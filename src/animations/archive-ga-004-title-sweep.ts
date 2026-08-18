import gsap from "gsap";

/** 第一遍横穿全屏：慢起猛冲 */
const SWEEP_DURATION = 1.8;
const SWEEP_EASE = "expo.in";
/** 第二遍滑入定位：快 */
const SETTLE_DURATION = 0.6;
const SETTLE_EASE = "power3.out";

/**
 * 第五屏入场：DESGIN 从左屏外滑入、横穿滑出右侧，WORKS 反向对称；
 * 随后各自再次滑入停在最终位置，整体节奏由慢到快。
 * 卡片长廊与标题第二遍滑入同步：从右侧屏外以相同时长与缓动滑入到位。
 * 位移基于元素最终位置的包围盒计算，任何屏宽下都能完全移出屏幕。
 */
export function createArchiveGa004TitleSweep(
  design: HTMLElement,
  works: HTMLElement,
  gallery: HTMLElement,
): gsap.core.Timeline {
  const viewportWidth = window.innerWidth;
  const designRect = design.getBoundingClientRect();
  const worksRect = works.getBoundingClientRect();

  const designOffLeft = -designRect.right;
  const designOffRight = viewportWidth - designRect.left;
  const worksOffRight = viewportWidth - worksRect.left;
  const worksOffLeft = -worksRect.right;

  const timeline = gsap.timeline();
  timeline.fromTo(
    design,
    { x: designOffLeft },
    { x: designOffRight, duration: SWEEP_DURATION, ease: SWEEP_EASE },
    0,
  );
  timeline.fromTo(
    works,
    { x: worksOffRight },
    { x: worksOffLeft, duration: SWEEP_DURATION, ease: SWEEP_EASE },
    0,
  );
  timeline.fromTo(
    design,
    { x: designOffLeft },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
  );
  timeline.fromTo(
    works,
    { x: worksOffRight },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
    "<",
  );
  timeline.fromTo(
    gallery,
    { x: viewportWidth },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
    "<",
  );
  return timeline;
}
