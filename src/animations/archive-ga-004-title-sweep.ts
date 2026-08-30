import gsap from "gsap";

/** 第一遍横穿全屏：慢起猛冲 */
const SWEEP_DURATION = 1.8;
const SWEEP_EASE = "expo.in";
/** 第二遍滑入定位：快 */
const SETTLE_DURATION = 0.6;
const SETTLE_EASE = "power3.out";

/**
 * 两处页面角标大字的通用入场：从相反方向横穿页面并离场，
 * 再同时由屏幕两侧滑回最终位置。
 */
export function createCornerTitleSweep(
  leftTitle: HTMLElement,
  rightTitle: HTMLElement,
): gsap.core.Timeline {
  const viewportWidth = window.innerWidth;
  const leftRect = leftTitle.getBoundingClientRect();
  const rightRect = rightTitle.getBoundingClientRect();

  const leftOffscreen = -leftRect.right;
  const leftAcrossViewport = viewportWidth - leftRect.left;
  const rightOffscreen = viewportWidth - rightRect.left;
  const rightAcrossViewport = -rightRect.right;

  const timeline = gsap.timeline();
  timeline.fromTo(
    leftTitle,
    { x: leftOffscreen },
    { x: leftAcrossViewport, duration: SWEEP_DURATION, ease: SWEEP_EASE },
    0,
  );
  timeline.fromTo(
    rightTitle,
    { x: rightOffscreen },
    { x: rightAcrossViewport, duration: SWEEP_DURATION, ease: SWEEP_EASE },
    0,
  );
  timeline.fromTo(
    leftTitle,
    { x: leftOffscreen },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
  );
  timeline.fromTo(
    rightTitle,
    { x: rightOffscreen },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
    "<",
  );
  return timeline;
}

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
  const timeline = createCornerTitleSweep(design, works);
  const viewportWidth = window.innerWidth;
  timeline.fromTo(
    gallery,
    { x: viewportWidth },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
    "<",
  );
  return timeline;
}

/**
 * hover 联动换字：新文字从各自一侧屏外滑入（左上从左、右下从右），
 * 时长与缓动与入场第二遍滑入一致。
 */
export function slideInArchiveGa004Titles(
  design: HTMLElement,
  works: HTMLElement,
): gsap.core.Timeline {
  const viewportWidth = window.innerWidth;
  gsap.killTweensOf([design, works]);
  gsap.set([design, works], { x: 0 });
  const designRect = design.getBoundingClientRect();
  const worksRect = works.getBoundingClientRect();

  const timeline = gsap.timeline();
  timeline.fromTo(
    design,
    { x: -designRect.right },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
    0,
  );
  timeline.fromTo(
    works,
    { x: viewportWidth - worksRect.left },
    { x: 0, duration: SETTLE_DURATION, ease: SETTLE_EASE },
    0,
  );
  return timeline;
}
