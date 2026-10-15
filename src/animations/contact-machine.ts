import gsap from "gsap";

/** 自动一步：齿轮顺时针 15°，卡片从上往下滑入 */
export const GEAR_STEP_DEG = 15;
export const SLIDE_DURATION = 0.6;
/** 两步起点的间隔，含上面的动画时长 */
export const AUTO_STEP_INTERVAL = 3.2;

const STEP_EASE = "power2.inOut";

/**
 * 播一步。减少动态效果时直接落到终态并返回 null，调用方自行收尾。
 * 返回的时间轴在中途被 kill 时不会触发 onComplete。
 */
export function playMachineStep(
  gear: HTMLElement,
  outgoing: HTMLElement,
  incoming: HTMLElement,
  fromAngle: number,
  reduced: boolean,
  onComplete: () => void,
): gsap.core.Timeline | null {
  const toAngle = fromAngle + GEAR_STEP_DEG;
  if (reduced) {
    gsap.set(gear, { rotation: toAngle });
    gsap.set(outgoing, { yPercent: 100 });
    gsap.set(incoming, { yPercent: 0 });
    onComplete();
    return null;
  }
  const timeline = gsap.timeline({ onComplete });
  timeline.to(
    gear,
    { rotation: toAngle, duration: SLIDE_DURATION, ease: STEP_EASE },
    0,
  );
  timeline.to(
    outgoing,
    { yPercent: 100, duration: SLIDE_DURATION, ease: STEP_EASE },
    0,
  );
  timeline.fromTo(
    incoming,
    { yPercent: -100 },
    { yPercent: 0, duration: SLIDE_DURATION, ease: STEP_EASE },
    0,
  );
  return timeline;
}

/** 把被打断的一步退回提交过的角度，两层卡片回到切分前 */
export function revertMachineStep(
  gear: HTMLElement,
  outgoing: HTMLElement,
  incoming: HTMLElement,
  angle: number,
) {
  gsap.killTweensOf([gear, outgoing, incoming]);
  gsap.set(gear, { rotation: angle });
  gsap.set(outgoing, { yPercent: 0 });
  gsap.set(incoming, { yPercent: -100 });
}
