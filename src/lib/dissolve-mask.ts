import { CELL_FADE_WINDOW, createDelayField } from "@/lib/ascii-curtain";

/**
 * 溶解遮罩：复用 ASCII 幕布的延迟场，把「斑块生长、彼此汇合」的覆盖节奏
 * 转成一组低分辨率亮度遮罩帧（dataURL），供 mask-image 逐帧翻页做内容显现。
 * 每个像素对应一个字符格，放大到元素尺寸后保留幕布式的颗粒质感。
 */
export function createDissolveMaskFrames(
  cols: number,
  rows: number,
  frameCount: number,
): string[] {
  const delays = createDelayField(cols, rows);
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const image = ctx.createImageData(cols, rows);
  const data = image.data;
  const fadeRate = 1 / CELL_FADE_WINDOW;
  const frames: string[] = [];

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
    ctx.putImageData(image, 0, 0);
    frames.push(canvas.toDataURL());
  }

  return frames;
}

/** 给元素挂上 / 卸下 CSS mask-image（含 webkit 前缀） */
export function setElementMask(el: HTMLElement, url: string | null) {
  const value = url ? `url(${url})` : "";
  el.style.maskImage = value;
  el.style.webkitMaskImage = value;
  el.style.maskSize = url ? "100% 100%" : "";
  el.style.webkitMaskSize = url ? "100% 100%" : "";
}
