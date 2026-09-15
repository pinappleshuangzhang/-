import type { FogController, FogEngineOptions } from "@/lib/fog-glass-types";
import { addFrameTick, removeFrameTick } from "@/lib/frame-scheduler";

const CONFIG = {
  /** 擦拭笔刷半径（CSS px） */
  brushSize: 56,
  /** 笔画插值步长（CSS px） */
  wipeStep: 12,
  /** 回雾时间常数：停手后雾在数倍于此的时间内基本回满 */
  refogTime: 2.8,
  /** 停手多久后开始回雾（秒） */
  refogDelay: 2.4,
  /** 大颗流挂的出现概率 */
  bigRunnerChance: 0.3,
  /** mask 应用到霜层的节流间隔（秒） */
  maskApplyInterval: 0.1,
  /** 擦除进度采样间隔（秒） */
  progressInterval: 0.5,
  revealThreshold: 0.35,
  /** 静态小水珠 */
  dropMax: 7,
  dropSpawnChance: 0.01,
  dropKillRadius: 60,
  /** 流挂水珠：上限不变，提高触发频率与拖尾留存 */
  runnerMax: 4,
  runnerChance: 0.12,
  /** 静止时自发流挂的频率（次/秒） */
  idleRunnerRate: 0.36,
} as const;

const IS_SAFARI =
  typeof navigator !== "undefined" &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome|chromium|crios|edg|android/i.test(navigator.userAgent);

export function isSafariFogClient() {
  return IS_SAFARI;
}

/** Safari 对 backdrop-filter + 换 mask / 改 transform 会整层重采样闪烁 */
const MASK_APPLY_INTERVAL = IS_SAFARI ? 0.45 : CONFIG.maskApplyInterval;
const IDLE_RUNNER_RATE = IS_SAFARI ? 0 : CONFIG.idleRunnerRate;
const DROP_SPAWN_CHANCE = IS_SAFARI ? 0 : CONFIG.dropSpawnChance;

type Bead = { x: number; y: number; r: number; vy: number; seed: number };
type Runner = {
  x: number;
  y: number;
  vy: number;
  seed: number;
  /** 珠体半径（CSS px），水痕宽度与滑速随它缩放；下滑中缓慢耗损 */
  r: number;
};
type Point = { x: number; y: number };

/**
 * 雾玻璃 2D 引擎：在离屏 mask 画布上用 destination-out 真挖孔，
 * 套到 fixed 霜层上（染色 + blur 一起被裁掉）；水珠与流挂画在独立 canvas。
 */
export function createFogGlassEngine(
  canvas: HTMLCanvasElement,
  options: FogEngineOptions,
): FogController | null {
  const drawCtxOrNull = canvas.getContext("2d");
  const mask = document.createElement("canvas");
  const maskCtxOrNull = mask.getContext("2d");
  const sample = document.createElement("canvas");
  sample.width = 32;
  sample.height = 24;
  const sampleCtxOrNull = sample.getContext("2d", { willReadFrequently: true });
  if (!drawCtxOrNull || !maskCtxOrNull || !sampleCtxOrNull) return null;
  // 显式绑定为非空常量：收窄不会穿透被提升的函数声明
  const drawCtx = drawCtxOrNull;
  const maskCtx = maskCtxOrNull;
  const sampleCtx = sampleCtxOrNull;

  const { frostElement, anchorElement, onReveal } = options;
  const revealThreshold = options.revealThreshold ?? CONFIG.revealThreshold;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const shapeSource = options.maskShape
    ? new Path2D(options.maskShape.path)
    : null;

  /** 格子形状路径：mask 画布坐标系 / 水珠画布（dpr）坐标系，随尺寸重建 */
  let shapePath: Path2D | null = null;
  let canvasShapePath: Path2D | null = null;

  function scaledShape(targetW: number, targetH: number): Path2D | null {
    const shape = options.maskShape;
    if (!shape || !shapeSource) return null;
    const matrix = new DOMMatrix()
      .scale(targetW / shape.width, targetH / shape.height)
      .translate(-shape.x, -shape.y);
    const path = new Path2D();
    path.addPath(shapeSource, matrix);
    return path;
  }

  function buildShapePath() {
    shapePath = scaledShape(mask.width, mask.height);
    canvasShapePath = scaledShape(canvas.width, canvas.height);
  }

  function fillFogBase() {
    maskCtx.clearRect(0, 0, mask.width, mask.height);
    maskCtx.fillStyle = "#fff";
    if (shapePath) maskCtx.fill(shapePath);
    else maskCtx.fillRect(0, 0, mask.width, mask.height);
  }

  let boxW = 0;
  let boxH = 0;
  let lastLeft = Number.NaN;
  let lastTop = Number.NaN;
  let maskGeneration = 0;
  let destroyed = false;
  const beads: Bead[] = [];
  const runners: Runner[] = [];
  let lastWipe: Point | null = null;
  let lastWipeTime = -Infinity;
  let maskDirty = false;
  let lastMaskApply = 0;
  let lastProgressCheck = 0;
  let revealed = false;
  /** 满雾状态的平均 alpha（多边形覆盖率），进度按它归一化 */
  let baselineAlpha = 0;
  let running = false;
  let lastFrame = 0;
  let currentMaskUrl: string | null = null;
  let canvasCleared = false;

  function resizeSurfaces(w: number, h: number) {
    boxW = w;
    boxH = h;
    frostElement.style.width = `${w}px`;
    frostElement.style.height = `${h}px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    // mask 与设备像素等分辨率，Retina 下边缘才无锯齿
    mask.width = Math.max(1, Math.round(w * dpr));
    mask.height = Math.max(1, Math.round(h * dpr));
    buildShapePath();
    fillFogBase();
    baselineAlpha = measureFogAlpha();
    maskDirty = true;
  }

  function syncGeometry() {
    const rect = anchorElement.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w !== boxW || h !== boxH) {
      if (w < 2 || h < 2) return;
      resizeSurfaces(w, h);
    }
    // 位置取整：亚像素抖动会每帧改几何，Safari 对 backdrop-filter 重采样即闪。
    const left = Math.round(rect.left);
    const top = Math.round(rect.top);
    if (left === lastLeft && top === lastTop) return;
    lastLeft = left;
    lastTop = top;
    // Safari：用 left/top 定位，避免 transform + backdrop-filter 同元素闪烁。
    if (IS_SAFARI) {
      frostElement.style.left = `${left}px`;
      frostElement.style.top = `${top}px`;
      frostElement.style.transform = "none";
      canvas.style.left = `${left}px`;
      canvas.style.top = `${top}px`;
      canvas.style.transform = "none";
      return;
    }
    const shift = `translate3d(${left}px, ${top}px, 0)`;
    frostElement.style.transform = shift;
    canvas.style.transform = shift;
  }

  function paintMaskOntoFrost(url: string) {
    const value = `url("${url}")`;
    if (IS_SAFARI) {
      frostElement.style.webkitMaskImage = value;
      frostElement.style.webkitMaskSize = "100% 100%";
      frostElement.style.webkitMaskRepeat = "no-repeat";
      return;
    }
    frostElement.style.maskImage = value;
    frostElement.style.webkitMaskImage = value;
    frostElement.style.maskSize = "100% 100%";
    frostElement.style.webkitMaskSize = "100% 100%";
  }

  function revokeMaskUrl() {
    if (!currentMaskUrl) return;
    URL.revokeObjectURL(currentMaskUrl);
    currentMaskUrl = null;
  }

  function applyMask(now: number) {
    lastMaskApply = now;
    maskDirty = false;
    const generation = ++maskGeneration;

    const adopt = (url: string, revokeOnFail: boolean) => {
      const image = new Image();
      image.onload = () => {
        if (destroyed || generation !== maskGeneration) {
          if (revokeOnFail) URL.revokeObjectURL(url);
          return;
        }
        paintMaskOntoFrost(url);
        if (revokeOnFail) {
          revokeMaskUrl();
          currentMaskUrl = url;
        }
      };
      image.src = url;
    };

    // Safari 用 blob URL，避免反复塞 data:URL 触发霜层空帧。
    if (IS_SAFARI) {
      mask.toBlob((blob) => {
        if (!blob || destroyed || generation !== maskGeneration) return;
        adopt(URL.createObjectURL(blob), true);
      }, "image/png");
      return;
    }

    adopt(mask.toDataURL("image/png"), false);
  }

  function stampHole(x: number, y: number) {
    const s = dpr;
    const r = CONFIG.brushSize * s;
    const gradient = maskCtx.createRadialGradient(
      x * s,
      y * s,
      r * 0.2,
      x * s,
      y * s,
      r,
    );
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    maskCtx.globalCompositeOperation = "destination-out";
    maskCtx.fillStyle = gradient;
    maskCtx.beginPath();
    maskCtx.arc(x * s, y * s, r, 0, Math.PI * 2);
    maskCtx.fill();
    maskCtx.globalCompositeOperation = "source-over";
  }

  function wipePoint(x: number, y: number) {
    stampHole(x, y);
    for (let i = beads.length - 1; i >= 0; i -= 1) {
      const bead = beads[i];
      if (Math.hypot(bead.x - x, bead.y - y) < CONFIG.dropKillRadius) {
        beads.splice(i, 1);
      }
    }
    if (runners.length < CONFIG.runnerMax && Math.random() < CONFIG.runnerChance) {
      spawnRunner(x + (Math.random() - 0.5) * 30, y + 20);
    }
  }

  /** 生成流挂水珠：多为小颗，偶尔一颗大的（水痕更宽、滑得更快） */
  function spawnRunner(x: number, y: number) {
    const big = Math.random() < CONFIG.bigRunnerChance;
    runners.push({
      x,
      y,
      vy: 0.15,
      seed: Math.random(),
      r: big ? 6.5 + Math.random() * 2.5 : 3.5 + Math.random() * 1.5,
    });
  }

  function stepRunners(dt: number) {
    const s = dpr;
    for (let i = runners.length - 1; i >= 0; i -= 1) {
      const runner = runners[i];

      runner.vy = Math.min(
        runner.vy + 0.01 + runner.r * 0.002 + runner.seed * 0.008,
        0.85 + runner.r * 0.08,
      );

      const prevX = runner.x;
      const prevY = runner.y;
      runner.y += runner.vy;
      runner.x += Math.sin(runner.y * 0.05 + runner.seed * 9) * 0.35;

      // 吞并沿途凝珠：珠体微增、短暂提速
      for (let j = beads.length - 1; j >= 0; j -= 1) {
        const bead = beads[j];
        if (
          Math.hypot(bead.x - runner.x, bead.y - runner.y) <
          runner.r + bead.r + 2
        ) {
          beads.splice(j, 1);
          runner.r = Math.min(runner.r + bead.r * 0.25, 10);
          runner.vy += 0.12;
        }
      }

      // 质量耗损放缓：单颗流挂走得更远、水痕更长
      runner.r -= dt * 0.22;

      if (runner.vy > 0.02 && !IS_SAFARI) {
        maskCtx.globalCompositeOperation = "destination-out";
        maskCtx.strokeStyle = "rgba(0,0,0,0.92)";
        maskCtx.lineWidth = Math.max(runner.r * 1.05 * s, 1.2);
        maskCtx.lineCap = "round";
        maskCtx.beginPath();
        maskCtx.moveTo(prevX * s, prevY * s);
        maskCtx.lineTo(runner.x * s, runner.y * s);
        maskCtx.stroke();
        maskCtx.globalCompositeOperation = "source-over";
      }

      if (runner.y > boxH + 8) {
        runners.splice(i, 1);
      } else if (runner.r < 2.2) {
        // 耗尽：停在原地变成一颗普通凝珠
        if (beads.length < CONFIG.dropMax) {
          runners.splice(i, 1);
          beads.push({
            x: runner.x,
            y: runner.y,
            r: 2.4 + Math.random() * 1.2,
            vy: 0,
            seed: Math.random(),
          });
        } else {
          runners.splice(i, 1);
        }
      }
    }
    if (runners.length && !IS_SAFARI) maskDirty = true;
  }

  function drawBeads() {
    // Safari：空画布不再每帧 clear，避免隔壁 backdrop-filter 被逼着重采样。
    if (IS_SAFARI && beads.length === 0 && runners.length === 0) {
      if (!canvasCleared) {
        drawCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCleared = true;
      }
      return;
    }
    canvasCleared = false;
    drawCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawCtx.save();
    if (canvasShapePath) drawCtx.clip(canvasShapePath);
    if (beads.length < CONFIG.dropMax && Math.random() < DROP_SPAWN_CHANCE) {
      beads.push({
        x: Math.random() * boxW,
        y: Math.random() * boxH * 0.6,
        r: 2.4 + Math.random() * 3.8,
        vy: 0,
        seed: Math.random(),
      });
    }
    for (const bead of beads) {
      // 现有凝珠更易开始下滑，不增加珠数
      if (bead.r > 3.8) {
        bead.vy = Math.min(bead.vy + 0.028, 0.55 + bead.seed);
      }
      bead.y += bead.vy;
      bead.r += 0.0015;
      if (bead.y > boxH + 10) {
        bead.y = -6;
        bead.vy = 0;
        bead.r = 2.4 + Math.random() * 3.8;
      }
      const x = bead.x * dpr;
      const y = bead.y * dpr;
      const r = bead.r * dpr;
      const body = drawCtx.createRadialGradient(x, y, r * 0.2, x, y, r);
      body.addColorStop(0, "rgba(43,43,43,0.28)");
      body.addColorStop(0.8, "rgba(43,43,43,0.34)");
      body.addColorStop(1, "rgba(43,43,43,0)");
      drawCtx.fillStyle = body;
      drawCtx.beginPath();
      drawCtx.arc(x, y, r, 0, Math.PI * 2);
      drawCtx.fill();
      drawCtx.fillStyle = "rgba(255,255,255,0.5)";
      drawCtx.beginPath();
      drawCtx.arc(x - r * 0.3, y - r * 0.35, r * 0.22, 0, Math.PI * 2);
      drawCtx.fill();
    }
    for (const runner of runners) {
      const x = runner.x * dpr;
      const y = runner.y * dpr;
      const r = runner.r * dpr;
      // 随速度变形：加速时纵向拉长、横向收窄，停顿时回弹近圆
      const speedNorm = Math.min(runner.vy / 1.6, 1);
      const rx = r * (0.95 - speedNorm * 0.2);
      const ry = r * (1.05 + speedNorm * 0.6);
      const body = drawCtx.createRadialGradient(x, y, r * 0.2, x, y, r);
      body.addColorStop(0, "rgba(43,43,43,0.35)");
      body.addColorStop(1, "rgba(43,43,43,0)");
      drawCtx.fillStyle = body;
      drawCtx.beginPath();
      drawCtx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      drawCtx.fill();
      drawCtx.fillStyle = "rgba(255,255,255,0.55)";
      drawCtx.beginPath();
      drawCtx.arc(x - r * 0.25, y - r * 0.4, r * 0.25, 0, Math.PI * 2);
      drawCtx.fill();
    }
    drawCtx.restore();
  }

  function refog(now: number, dt: number) {
    // Safari：回雾会周期性换 mask，backdrop-filter 每次换都闪一层。
    if (IS_SAFARI) return;
    if (now - lastWipeTime < CONFIG.refogDelay) return;
    const alpha = Math.min(0.05, dt / CONFIG.refogTime);
    maskCtx.fillStyle = `rgba(255,255,255,${alpha})`;
    if (shapePath) {
      maskCtx.save();
      maskCtx.clip(shapePath);
      maskCtx.fillRect(0, 0, mask.width, mask.height);
      maskCtx.restore();
    } else {
      maskCtx.fillRect(0, 0, mask.width, mask.height);
    }
    maskDirty = true;
  }

  function measureFogAlpha() {
    sampleCtx.clearRect(0, 0, sample.width, sample.height);
    sampleCtx.drawImage(mask, 0, 0, sample.width, sample.height);
    const data = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
    let alphaSum = 0;
    for (let i = 3; i < data.length; i += 4) alphaSum += data[i];
    return alphaSum / ((data.length / 4) * 255);
  }

  function checkProgress(now: number) {
    if (revealed || now - lastProgressCheck < CONFIG.progressInterval) return;
    lastProgressCheck = now;
    if (baselineAlpha <= 0) return;
    const cleared = 1 - measureFogAlpha() / baselineAlpha;
    if (cleared >= revealThreshold) {
      revealed = true;
      onReveal?.();
    }
  }

  function tick(nowMs: number) {
    const now = nowMs / 1000;
    const dt = Math.min(lastFrame ? now - lastFrame : 1 / 60, 1 / 20);
    lastFrame = now;
    syncGeometry();
    if (boxW < 2) return;
    refog(now, dt);
    // 静止时自发流挂：不依赖擦拭，偶尔一颗从雾面上方滑下
    if (
      runners.length < CONFIG.runnerMax &&
      Math.random() < IDLE_RUNNER_RATE * dt
    ) {
      spawnRunner(
        (0.08 + Math.random() * 0.84) * boxW,
        Math.random() * boxH * 0.35,
      );
    }
    stepRunners(dt);
    drawBeads();
    checkProgress(now);
    if (maskDirty && now - lastMaskApply >= MASK_APPLY_INTERVAL) {
      applyMask(now);
    }
  }

  syncGeometry();
  if (boxW >= 2) applyMask(0);

  return {
    start() {
      if (running) return;
      running = true;
      lastFrame = 0;
      addFrameTick(tick);
    },
    pause() {
      running = false;
      removeFrameTick(tick);
    },
    destroy() {
      destroyed = true;
      running = false;
      removeFrameTick(tick);
      beads.length = 0;
      runners.length = 0;
      revokeMaskUrl();
    },
    wipeAt(x, y) {
      if (boxW < 2) return;
      lastWipeTime = performance.now() / 1000;
      if (lastWipe) {
        const distance = Math.hypot(x - lastWipe.x, y - lastWipe.y);
        const steps = Math.max(1, Math.ceil(distance / CONFIG.wipeStep));
        for (let i = 1; i <= steps; i += 1) {
          wipePoint(
            lastWipe.x + ((x - lastWipe.x) * i) / steps,
            lastWipe.y + ((y - lastWipe.y) * i) / steps,
          );
        }
      } else {
        wipePoint(x, y);
      }
      lastWipe = { x, y };
      const now = lastWipeTime;
      if (IS_SAFARI && now - lastMaskApply < MASK_APPLY_INTERVAL) {
        maskDirty = true;
        return;
      }
      applyMask(now);
    },
    endStroke() {
      lastWipe = null;
    },
  };
}
