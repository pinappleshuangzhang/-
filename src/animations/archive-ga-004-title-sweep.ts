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
