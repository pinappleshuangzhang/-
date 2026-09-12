const warmed = new Set<string>();

/** 只预热一次，避免切屏来回重复打同一地址。 */
function mark(src: string): boolean {
  if (warmed.has(src)) return false;
  warmed.add(src);
  return true;
}

export function prefetchImage(src: string, priority: "high" | "low" = "low") {
  if (!src || !mark(src)) return;
  const img = new Image();
  img.fetchPriority = priority;
  img.src = src;
}

/** 与 next/image 默认 loader 同一地址，避免只预热裸文件却打不中优化图。 */
export function prefetchNextImage(
  src: string,
  width: number,
  priority: "high" | "low" = "low",
) {
  if (!src) return;
  prefetchImage(
    `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`,
    priority,
  );
}

export function prefetchVideo(src: string) {
  if (!src || !mark(src)) return;
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = src;
  video.load();
}
