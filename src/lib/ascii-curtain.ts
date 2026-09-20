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

/** 单格从出现到完全显现所占的进度比例（溶解遮罩复用同一节奏） */
export const CELL_FADE_WINDOW = 0.12;
/** 延迟场上限：留出一个淡入窗口，保证进度到 1 时最后一格刚好完成 */
const MAX_CELL_DELAY = 1 - CELL_FADE_WINDOW;

/** 字符网格的目标格宽与格高（px），决定幕布疏密 */
const CELL_TARGET_W = 5;
const CELL_TARGET_H = 8;

/** 字形相对格高的比例 */
const GLYPH_SCALE = 0.86;

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

/**
 * 逐帧合成用的离屏资源。
 *
 * Safari 的 Canvas 2D 无法像 Chrome（Skia）那样把上万次逐格 drawImage 合批，
 * 因此绘制被拆成：字形整屏预渲染一次（glyphScreen），每帧只用 JS 算出一张
 * cols×rows 的透明度小位图（掩膜），经 destination-in 一次性套在字形层上，
 * 整帧只剩个位数次整屏级 canvas 操作。
 */
type CurtainCompositor = {
  /** 全部字符按满透明度预绘的整屏层 */
  glyphScreen: HTMLCanvasElement;
  glyphCtx: CanvasRenderingContext2D;
  /** 套掩膜用的整屏暂存层 */
  scratch: HTMLCanvasElement;
  scratchCtx: CanvasRenderingContext2D;
  /** cols×rows 的字形透明度掩膜 */
  mask: HTMLCanvasElement;
  maskCtx: CanvasRenderingContext2D;
  maskImage: ImageData;
  /** cols×rows 的实心底色小位图 */
  solid: HTMLCanvasElement;
  solidCtx: CanvasRenderingContext2D;
  solidImage: ImageData;
  /** 底色的 RGB 分量（写 ImageData 用） */
  bgR: number;
  bgG: number;
  bgB: number;
  /** 字符轮换的游标：每帧刷新一小批格子保持"活"感 */
  refreshCursor: number;
  /** 字形层分帧构建进度（已画好的格子数） */
  builtCount: number;
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
  compositor: CurtainCompositor | null;
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
 * 同时供成员记录浮层的溶解遮罩复用，保证斑块生长的形状语言一致。
 */
export function createDelayField(cols: number, rows: number) {
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
 * 把整套字符按满透明度预渲染成一行图集；
 * 透明度不再分档进图集，由每帧的掩膜位图统一控制。
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
  canvas.height = glyphH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = `${Math.round(fontSize * dpr)}px ${GLYPH_FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  for (let i = 0; i < CURTAIN_CHARS.length; i += 1) {
    ctx.fillText(CURTAIN_CHARS[i] ?? "0", i * glyphW + glyphW / 2, glyphH / 2);
  }

  return { canvas, cellW: glyphW, cellH: glyphH };
}

/** 解析十六进制底色供 ImageData 写入；非法值退回设计令牌灰白 */
function parseHexColor(value: string): [number, number, number] {
  const hex = value.replace("#", "").trim();
  const full =
    hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex;
  const num = Number.parseInt(full.slice(0, 6), 16);
  if (full.length < 6 || Number.isNaN(num)) return [234, 234, 236];
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

/** 把某个格子的字形（按当前时间轮换的字符）画进整屏字形层 */
function paintGlyphCell(
  grid: CurtainGrid,
  compositor: CurtainCompositor,
  atlas: GlyphAtlas,
  index: number,
  time: number,
) {
  const col = index % grid.cols;
  const row = Math.floor(index / grid.cols);
  const seed = grid.seeds[index] ?? 0;
  const flickerStep = Math.floor(
    (time + seed) / (grid.flickerPeriods[index] || 100),
  );
  const charIndex = (seed + flickerStep) % CURTAIN_CHARS.length;
  const x = col * grid.cellW;
  const y = row * grid.cellH;
  compositor.glyphCtx.clearRect(x, y, grid.cellW, grid.cellH);
  compositor.glyphCtx.drawImage(
    atlas.canvas,
    charIndex * atlas.cellW,
    0,
    atlas.cellW,
    atlas.cellH,
    x,
    y,
    grid.cellW,
    grid.cellH,
  );
}

function createCompositor(
  cols: number,
  rows: number,
  width: number,
  height: number,
  background: string,
  dpr: number,
): CurtainCompositor | null {
  const make = (w: number, h: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return [canvas, canvas.getContext("2d")] as const;
  };
  const [glyphScreen, glyphCtx] = make(
    Math.round(width * dpr),
    Math.round(height * dpr),
  );
  const [scratch, scratchCtx] = make(
    Math.round(width * dpr),
    Math.round(height * dpr),
  );
  const [mask, maskCtx] = make(cols, rows);
  const [solid, solidCtx] = make(cols, rows);
  if (!glyphCtx || !scratchCtx || !maskCtx || !solidCtx) return null;
  // 字形层以 CSS 单位作画，缩放交给 transform
  glyphCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const [bgR, bgG, bgB] = parseHexColor(background);
  return {
    glyphScreen,
    glyphCtx,
    scratch,
    scratchCtx,
    mask,
    maskCtx,
    maskImage: maskCtx.createImageData(cols, rows),
    solid,
    solidCtx,
    solidImage: solidCtx.createImageData(cols, rows),
    bgR,
    bgG,
    bgB,
    refreshCursor: 0,
    builtCount: 0,
  };
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
    styles.getPropertyValue("--ascii-curtain-bg").trim() || "#eaeaec";
  const glyphColor =
    styles.getPropertyValue("--ascii-curtain-color").trim() || "#131313";

  const cellCount = cols * rows;
  const seeds = new Uint16Array(cellCount);
  const flickerPeriods = new Float32Array(cellCount);
  for (let i = 0; i < cellCount; i += 1) {
    seeds[i] = Math.floor(Math.random() * 65536);
    flickerPeriods[i] = FLICKER_MIN_MS + Math.random() * FLICKER_RANGE_MS;
  }

  const atlas = createGlyphAtlas(
    glyphColor,
    cellW,
    cellH,
    Math.round(cellH * GLYPH_SCALE),
    dpr,
  );
  const compositor = atlas
    ? createCompositor(cols, rows, width, height, background, dpr)
    : null;

  const grid: CurtainGrid = {
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
    atlas,
    compositor,
  };

  // 整屏字形层按时间预算异步构建：一次性画满 9 万格会在 Safari 上把主线程
  // 阻塞数秒（表现为加载进度停在 0%）。每次最多画 8ms 就让出 32ms，
  // CPU 占用封顶约两成，慢机器上视频预加载等主线程任务不会被饿死；
  // 幕布最早也要数秒后才触发，届时已建完，未建完时由绘制帧同步补齐
  if (atlas && compositor) {
    const BUDGET_MS = 8;
    const YIELD_MS = 32;
    const buildChunk = () => {
      if (compositor.builtCount >= cellCount) return;
      const deadline = performance.now() + BUDGET_MS;
      while (compositor.builtCount < cellCount) {
        const end = Math.min(compositor.builtCount + 256, cellCount);
        for (let i = compositor.builtCount; i < end; i += 1) {
          paintGlyphCell(grid, compositor, atlas, i, 0);
        }
        compositor.builtCount = end;
        if (performance.now() >= deadline) break;
      }
      if (compositor.builtCount < cellCount) setTimeout(buildChunk, YIELD_MS);
    };
    setTimeout(buildChunk, 300);
  }

  return grid;
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
  const { cols, rows, width, height, seeds, flickerPeriods, atlas, compositor } =
    grid;
  const delays = phase === "cover" ? grid.coverDelays : grid.revealDelays;
  const fadeRate = 1 / CELL_FADE_WINDOW;

  if (!atlas || !compositor) {
    // 离屏资源不可用时退回纯色淡入淡出
    drawCurtainFade(ctx, grid, phase, progress);
    return;
  }

  // 逐格状态只写进两张 cols×rows 的小位图：实心底色 + 字形透明度
  const cellCount = cols * rows;

  // 极端情况下幕布在字形层建完前就启动：一次性同步补齐剩余格子
  if (compositor.builtCount < cellCount) {
    for (let i = compositor.builtCount; i < cellCount; i += 1) {
      paintGlyphCell(grid, compositor, atlas, i, 0);
    }
    compositor.builtCount = cellCount;
  }
  const solidData = compositor.solidImage.data;
  const maskData = compositor.maskImage.data;
  const { bgR, bgG, bgB } = compositor;

  for (let index = 0; index < cellCount; index += 1) {
    const local = clamp01((progress - (delays[index] ?? 0)) * fadeRate);
    const revealed = phase === "cover" ? local : 1 - local;
    const offset = index * 4;

    solidData[offset] = bgR;
    solidData[offset + 1] = bgG;
    solidData[offset + 2] = bgB;
    solidData[offset + 3] = revealed >= SOLID_THRESHOLD ? 255 : 0;

    if (revealed <= GLYPH_MIN_REVEAL) {
      maskData[offset + 3] = 0;
      continue;
    }

    const seed = seeds[index] ?? 0;
    const flickerStep = Math.floor(
      (time + seed) / (flickerPeriods[index] || 100),
    );
    const isFlashing = (seed + flickerStep) % FLASH_EVERY === 0;
    // 未处于过渡中的格子按各自相位缓慢明暗呼吸
    const breathing = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(0.004 * time + seed));
    const inTransition = local > 0 && local < 1;
    const brightness = inTransition || isFlashing ? 1 : breathing;

    maskData[offset] = 255;
    maskData[offset + 1] = 255;
    maskData[offset + 2] = 255;
    maskData[offset + 3] = Math.round(
      clamp01(brightness) * clamp01(1.3 * revealed) * 255,
    );
  }

  compositor.solidCtx.putImageData(compositor.solidImage, 0, 0);
  compositor.maskCtx.putImageData(compositor.maskImage, 0, 0);

  // 每帧轮换一小批格子的字符，维持字符跳动的"活"感；
  // 大素数跨步让更新点在屏上伪随机散布，避免出现扫描带
  const refreshCount = Math.min(2048, Math.ceil(cellCount / 48));
  let cursor = compositor.refreshCursor;
  for (let i = 0; i < refreshCount; i += 1) {
    paintGlyphCell(grid, compositor, atlas, cursor, time);
    cursor = (cursor + 7919) % cellCount;
  }
  compositor.refreshCursor = cursor;

  // 暂存层 = 整屏字形 × 透明度掩膜（最近邻放大保证格块边缘干脆）；
  // 该层以设备像素工作，避免 transform 参与合成
  const { scratchCtx, scratch } = compositor;
  const deviceW = scratch.width;
  const deviceH = scratch.height;
  scratchCtx.globalCompositeOperation = "source-over";
  scratchCtx.clearRect(0, 0, deviceW, deviceH);
  scratchCtx.drawImage(compositor.glyphScreen, 0, 0);
  scratchCtx.globalCompositeOperation = "destination-in";
  scratchCtx.imageSmoothingEnabled = false;
  scratchCtx.drawImage(compositor.mask, 0, 0, cols, rows, 0, 0, deviceW, deviceH);
  scratchCtx.globalCompositeOperation = "source-over";

  // 主画布（CSS 单位坐标系）：实心底块 + 字形层，各一次整屏绘制
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(compositor.solid, 0, 0, cols, rows, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(scratch, 0, 0, deviceW, deviceH, 0, 0, width, height);
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
