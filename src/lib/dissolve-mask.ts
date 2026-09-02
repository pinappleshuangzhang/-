import { CELL_FADE_WINDOW, createDelayField } from "@/lib/ascii-curtain";

/**
 * 溶解遮罩雪碧图：全部帧纵向堆进一张图，翻帧只改 mask-position。
 * 早期实现是逐帧换 data URL 的 mask-image，Chrome 同步解码没问题，
 * Safari 异步解码，换帧瞬间遮罩尚未就绪会把整层渲染成全遮（闪烁一帧）。
 */
export type DissolveMaskSprite = {
  url: string;
  frameCount: number;
  /** 持有一份 Image 引用促使浏览器提前解码并留在缓存里 */
  image: HTMLImageElement;
};

/**
 * 复用 ASCII 幕布的延迟场，把「斑块生长、彼此汇合」的覆盖节奏
 * 转成一张纵向雪碧图（每帧一段低分辨率亮度遮罩），供 mask-position
 * 逐帧翻页做内容显现。每个像素对应一个字符格，放大到元素尺寸后
 * 保留幕布式的颗粒质感。
 */
export function createDissolveMaskSprite(
  cols: number,
  rows: number,
  frameCount: number,
): DissolveMaskSprite | null {
  const delays = createDelayField(cols, rows);
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows * frameCount;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(cols, rows);
  const data = image.data;
  const fadeRate = 1 / CELL_FADE_WINDOW;

  for (let frame = 0; frame < frameCount; frame += 1) {
    const progress = frame / (frameCount - 1);
    for (let i = 0; i < delays.length; i += 1) {
      const local = Math.min(
        1,
        Math.max(0, (progress - (delays[i] ?? 0)) * fadeRate),
      );
      const offset = i * 4;
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = Math.round(local * 255);
    }
    ctx.putImageData(image, 0, frame * rows);
  }

  const url = canvas.toDataURL();
  const img = new Image();
  img.src = url;
  return { url, frameCount, image: img };
}

/** 给元素挂上 / 卸下 CSS mask 雪碧图的某一帧（含 webkit 前缀） */
export function setSpriteMaskFrame(
  el: HTMLElement,
  sprite: DissolveMaskSprite,
  frame: number,
) {
  const clamped = Math.max(0, Math.min(sprite.frameCount - 1, frame));
  const pct =
    sprite.frameCount > 1 ? (clamped / (sprite.frameCount - 1)) * 100 : 0;
  const image = `url(${sprite.url})`;
  const size = `100% ${sprite.frameCount * 100}%`;
  const position = `0% ${pct}%`;
  el.style.maskImage = image;
  el.style.maskSize = size;
  el.style.maskRepeat = "no-repeat";
  el.style.maskPosition = position;
  el.style.setProperty("-webkit-mask-image", image);
  el.style.setProperty("-webkit-mask-size", size);
  el.style.setProperty("-webkit-mask-repeat", "no-repeat");
  el.style.setProperty("-webkit-mask-position", position);
}

/** 移除元素上的 mask（含 webkit 前缀） */
export function clearElementMask(el: HTMLElement) {
  el.style.maskImage = "";
  el.style.maskSize = "";
  el.style.maskRepeat = "";
  el.style.maskPosition = "";
  el.style.removeProperty("-webkit-mask-image");
  el.style.removeProperty("-webkit-mask-size");
  el.style.removeProperty("-webkit-mask-repeat");
  el.style.removeProperty("-webkit-mask-position");
}
