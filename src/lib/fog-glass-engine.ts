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
  dropMax: 12,
  dropSpawnChance: 0.02,
  dropKillRadius: 60,
  /** 流挂水珠 */
  runnerMax: 4,
  runnerChance: 0.06,
  /** 静止时自发流挂的频率（次/秒） */
  idleRunnerRate: 0.18,
} as const;

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
    const shift = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    frostElement.style.transform = shift;
    canvas.style.transform = shift;
  }

  function applyMask(now: number) {
    lastMaskApply = now;
    maskDirty = false;
    const url = `url("${mask.toDataURL("image/png")}")`;
    frostElement.style.maskImage = url;
    frostElement.style.webkitMaskImage = url;
    frostElement.style.maskSize = "100% 100%";
    frostElement.style.webkitMaskSize = "100% 100%";
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

      // 质量耗损：越滑越小，水痕随之收窄成锥形
      runner.r -= dt * 0.35;

      if (runner.vy > 0.02) {
        maskCtx.globalCompositeOperation = "destination-out";
        maskCtx.strokeStyle = "rgba(0,0,0,0.85)";
        maskCtx.lineWidth = Math.max(runner.r * 0.8 * s, 1);
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
    if (runners.length) maskDirty = true;
  }

  function drawBeads() {
    drawCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawCtx.save();
    if (canvasShapePath) drawCtx.clip(canvasShapePath);
    if (beads.length < CONFIG.dropMax && Math.random() < CONFIG.dropSpawnChance) {
      beads.push({
        x: Math.random() * boxW,
        y: Math.random() * boxH * 0.6,
        r: 2.4 + Math.random() * 3.8,
        vy: 0,
        seed: Math.random(),
      });
    }
    for (const bead of beads) {
      if (bead.r > 5) {
        bead.vy = Math.min(bead.vy + 0.02, 0.5 + bead.seed);
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
      Math.random() < CONFIG.idleRunnerRate * dt
    ) {
      spawnRunner(
        (0.08 + Math.random() * 0.84) * boxW,
        Math.random() * boxH * 0.35,
      );
    }
    stepRunners(dt);
    drawBeads();
    checkProgress(now);
    if (maskDirty && now - lastMaskApply >= CONFIG.maskApplyInterval) {
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
      running = false;
      removeFrameTick(tick);
      beads.length = 0;
      runners.length = 0;
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
      applyMask(performance.now() / 1000);
    },
    endStroke() {
      lastWipe = null;
    },
  };
}
