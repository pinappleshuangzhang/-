import gsap from "gsap";

export const FLIP_CHAR_TWEEN = {
  duration: 0.45,
  ease: "power2.out",
  stagger: 0.04,
  overlap: 0.15,
} as const;

export const FLIP_CHAR_VISIBLE = {
  yPercent: 0,
  scale: 1,
  opacity: 1,
  force3D: true,
} as const;

export const FLIP_CHAR_IN_HIDDEN = {
  yPercent: 75,
  scale: 0,
  opacity: 0,
  force3D: true,
} as const;

export const FLIP_CHAR_OUT = {
  yPercent: -75,
  scale: 0,
  opacity: 0,
  force3D: true,
} as const;

export function setFlipCharsRest(
  outChars: HTMLElement[],
  inChars: HTMLElement[],
  mark: HTMLElement | null,
) {
  if (outChars.length) gsap.set(outChars, FLIP_CHAR_VISIBLE);
  if (inChars.length) gsap.set(inChars, FLIP_CHAR_IN_HIDDEN);
  if (mark) gsap.set(mark, FLIP_CHAR_IN_HIDDEN);
}

export function buildFlipTimeline(
  outChars: HTMLElement[],
  inTargets: HTMLElement[],
  options?: { paused?: boolean; onComplete?: () => void },
) {
  const timeline = gsap.timeline({
    paused: options?.paused ?? true,
    onComplete: options?.onComplete,
  });
  if (outChars.length) {
    timeline.to(
      outChars,
      {
        ...FLIP_CHAR_OUT,
        duration: FLIP_CHAR_TWEEN.duration,
        ease: FLIP_CHAR_TWEEN.ease,
        stagger: FLIP_CHAR_TWEEN.stagger,
      },
      0,
    );
  }
  if (inTargets.length) {
    timeline.to(
      inTargets,
      {
        ...FLIP_CHAR_VISIBLE,
        duration: FLIP_CHAR_TWEEN.duration,
        ease: FLIP_CHAR_TWEEN.ease,
        stagger: FLIP_CHAR_TWEEN.stagger,
      },
      FLIP_CHAR_TWEEN.overlap,
    );
  }
  return timeline;
}
