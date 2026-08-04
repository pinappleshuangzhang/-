/**
 * ASCII 字符幕布：屏与屏切换时铺满视口的转场层。
 *
 * 幕布不是整齐推进的，而是由一张低分辨率平滑噪声图给每个字符格分配不同的
 * 起始延迟，进度推进时各格依次点亮，因而呈现斑块生长、彼此汇合的有机质感。
 */

/** 字符集：按索引循环取用，混合数字与符号以形成档案终端质感 */
const CURTAIN_CHARS = "01<>[]{}()/\\|=+*#%&$@!?;:.~01ABCDEF0123456789";

/** 延迟场的控制点网格，插值后放大到实际字符网格 */
const CONTROL_COLS = 7;
const CONTROL_ROWS = 5;
/** 控制点插值后叠加的随机抖动幅度，打散过于规整的渐变带 */
const DELAY_JITTER = 0.08;

/** 单格从出现到完全显现所占的进度比例 */
const CELL_FADE_WINDOW = 0.12;
/** 延迟场上限：留出一个淡入窗口，保证进度到 1 时最后一格刚好完成 */
const MAX_CELL_DELAY = 1 - CELL_FADE_WINDOW;

/** 字符网格的目标格宽与格高（px），决定幕布疏密 */
const CELL_TARGET_W = 12;
const CELL_TARGET_H = 17;

/** 字形相对格高的比例 */
const GLYPH_SCALE = 0.86;
/** 字形图集预渲染的透明度档位数 */
const ALPHA_STEPS = 12;

/** 显现度超过该阈值的格子会填充底色，形成幕布的实心部分 */
const SOLID_THRESHOLD = 0.35;
/** 低于该显现度的格子不绘制字符 */
const GLYPH_MIN_REVEAL = 0.02;
/** 字符闪烁周期（ms）的取值区间 */
const FLICKER_MIN_MS = 70;
const FLICKER_RANGE_MS = 120;
/** 每隔若干个闪烁步长出现一次满亮度的字符 */
const FLASH_EVERY = 19;

const GLYPH_FONT_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** 幕布单程时长：cover 铺满与 reveal 消散各占一程 */
export const CURTAIN_DURATION_MS = 720;
/** 降低动态效果时的单程时长，配合纯色淡入淡出 */
export const CURTAIN_REDUCED_DURATION_MS = 180;

export type CurtainPhase = "idle" | "cover" | "reveal";
/** 实际参与绘制的两个阶段 */
export type CurtainDrawPhase = Exclude<CurtainPhase, "idle">;

type GlyphAtlas = {
  canvas: HTMLCanvasElement;
  cellW: number;
  cellH: number;
};

export type CurtainGrid = {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  width: number;
  height: number;
  background: string;
  /** cover 与 reveal 各用一张延迟场，两程的生长形状因此不会重复 */
  coverDelays: Float32Array;
  revealDelays: Float32Array;
  seeds: Uint16Array;
  flickerPeriods: Float32Array;
  atlas: GlyphAtlas | null;
};

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * 生成每个字符格的起始延迟（0 ~ MAX_CELL_DELAY）。
 * 做法是对一张 7×5 的随机控制点网格做双线性 + smoothstep 插值，
 * 得到大块起伏的低频噪声，再叠加细微抖动并归一化。
 */
function createDelayField(cols: number, rows: number) {
  const controls = new Float32Array(CONTROL_COLS * CONTROL_ROWS);
  for (let i = 0; i < controls.length; i += 1) {
    controls[i] = Math.random();
  }

  const raw = new Float32Array(cols * rows);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const u = (col / cols) * (CONTROL_COLS - 1);
      const v = (row / rows) * (CONTROL_ROWS - 1);
      const u0 = Math.floor(u);
      const v0 = Math.floor(v);
      const tu = smoothstep(u - u0);
      const tv = smoothstep(v - v0);
      const base = v0 * CONTROL_COLS + u0;

      const top = lerp(controls[base] ?? 0, controls[base + 1] ?? 0, tu);
      const bottom = lerp(
        controls[base + CONTROL_COLS] ?? 0,
        controls[base + CONTROL_COLS + 1] ?? 0,
        tu,
      );
      const value =
        lerp(top, bottom, tv) + (Math.random() - 0.5) * DELAY_JITTER;

      raw[row * cols + col] = value;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  const span = max - min || 1;
  const delays = new Float32Array(cols * rows);
  for (let i = 0; i < raw.length; i += 1) {
    delays[i] = (((raw[i] ?? 0) - min) / span) * MAX_CELL_DELAY;
  }
  return delays;
}

/**
 * 把整套字符按 ALPHA_STEPS 个透明度档位预渲染成一张图集，
 * 逐帧绘制时只做 drawImage，避免每格都走一次 fillText。
 */
function createGlyphAtlas(
  color: string,
  cellW: number,
  cellH: number,
  fontSize: number,
  dpr: number,
): GlyphAtlas | null {
  const glyphW = Math.ceil(cellW * dpr);
  const glyphH = Math.ceil(cellH * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = glyphW * CURTAIN_CHARS.length;
  canvas.height = glyphH * ALPHA_STEPS;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = `${Math.round(fontSize * dpr)}px ${GLYPH_FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;

  for (let step = 0; step < ALPHA_STEPS; step += 1) {
    ctx.globalAlpha = (step + 1) / ALPHA_STEPS;
    const y = step * glyphH + glyphH / 2;
    for (let i = 0; i < CURTAIN_CHARS.length; i += 1) {
      ctx.fillText(CURTAIN_CHARS[i] ?? "0", i * glyphW + glyphW / 2, y);
    }
  }
  ctx.globalAlpha = 1;

  return { canvas, cellW: glyphW, cellH: glyphH };
}

/**
 * 按当前视口尺寸建立幕布网格，并把 canvas 缩放到设备像素比。
 * 颜色取自 CSS 变量，保证幕布配色跟随设计令牌而非写死在脚本里。
 */
export function createCurtainGrid(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): CurtainGrid {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cols = Math.max(1, Math.round(width / CELL_TARGET_W));
  const rows = Math.max(1, Math.round(height / CELL_TARGET_H));
  const cellW = width / cols;
  const cellH = height / rows;

  const styles = getComputedStyle(canvas);
  const background =
    styles.getPropertyValue("--ascii-curtain-bg").trim() || "#ffffff";
  const glyphColor =
    styles.getPropertyValue("--ascii-curtain-color").trim() || "#131313";

  const cellCount = cols * rows;
  const seeds = new Uint16Array(cellCount);
  const flickerPeriods = new Float32Array(cellCount);
  for (let i = 0; i < cellCount; i += 1) {
    seeds[i] = Math.floor(Math.random() * 65536);
    flickerPeriods[i] = FLICKER_MIN_MS + Math.random() * FLICKER_RANGE_MS;
  }

  return {
    cols,
    rows,
    cellW,
    cellH,
    width,
    height,
    background,
    coverDelays: createDelayField(cols, rows),
    revealDelays: createDelayField(cols, rows),
    seeds,
    flickerPeriods,
    atlas: createGlyphAtlas(
      glyphColor,
      cellW,
      cellH,
      Math.round(cellH * GLYPH_SCALE),
      dpr,
    ),
  };
}

/**
 * 绘制一帧幕布。progress 为当前阶段的 0~1 进度，time 供字符闪烁取相位。
 * cover 阶段字符由无到有，reveal 阶段反向。
 */
export function drawCurtainFrame(
  ctx: CanvasRenderingContext2D,
  grid: CurtainGrid,
  phase: CurtainDrawPhase,
  progress: number,
  time: number,
) {
  const {
    cols,
    rows,
    cellW,
    cellH,
    width,
    height,
    background,
    seeds,
    flickerPeriods,
    atlas,
  } = grid;
  const delays = phase === "cover" ? grid.coverDelays : grid.revealDelays;
  const fadeRate = 1 / CELL_FADE_WINDOW;

  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.fillStyle = background;

  if (phase === "cover" && progress >= 1) {
    ctx.fillRect(0, 0, width, height);
  } else {
    // 实心底块一次性攒进同一条路径，整屏只做一次 fill
    ctx.beginPath();
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const local = clamp01((progress - (delays[row * cols + col] ?? 0)) * fadeRate);
        const revealed = phase === "cover" ? local : 1 - local;
        if (revealed < SOLID_THRESHOLD) continue;
        ctx.rect(
          Math.floor(col * cellW),
          Math.floor(row * cellH),
          Math.ceil(cellW) + 1,
          Math.ceil(cellH) + 1,
        );
      }
    }
    ctx.fill();
  }

  if (!atlas) return;

  const charCount = CURTAIN_CHARS.length;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const local = clamp01((progress - (delays[index] ?? 0)) * fadeRate);
      const revealed = phase === "cover" ? local : 1 - local;
      if (revealed <= GLYPH_MIN_REVEAL) continue;

      const seed = seeds[index] ?? 0;
      const flickerStep = Math.floor(
        (time + seed) / (flickerPeriods[index] || 100),
      );
      const isFlashing = (seed + flickerStep) % FLASH_EVERY === 0;
      // 未处于过渡中的格子按各自相位缓慢明暗呼吸
      const breathing = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(0.004 * time + seed));
      const inTransition = local > 0 && local < 1;
      const brightness = inTransition || isFlashing ? 1 : breathing;

      let alphaStep = Math.floor(
        clamp01(brightness) * clamp01(1.3 * revealed) * ALPHA_STEPS,
      );
      if (alphaStep <= 0) continue;
      if (alphaStep >= ALPHA_STEPS) alphaStep = ALPHA_STEPS - 1;

      const charIndex = (seed + flickerStep) % charCount;
      ctx.drawImage(
        atlas.canvas,
        charIndex * atlas.cellW,
        alphaStep * atlas.cellH,
        atlas.cellW,
        atlas.cellH,
        col * cellW,
        row * cellH,
        cellW,
        cellH,
      );
    }
  }
}

/** 降低动态效果时的降级绘制：跳过字符，只做整屏底色淡入淡出 */
export function drawCurtainFade(
  ctx: CanvasRenderingContext2D,
  grid: CurtainGrid,
  phase: CurtainDrawPhase,
  progress: number,
) {
  ctx.clearRect(0, 0, grid.width, grid.height);
  ctx.globalAlpha = phase === "cover" ? progress : 1 - progress;
  ctx.fillStyle = grid.background;
  ctx.fillRect(0, 0, grid.width, grid.height);
  ctx.globalAlpha = 1;
}
