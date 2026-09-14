import gsap from "gsap";

/** 花朵 icon 绽放：以底部中点为原点从 0 放大到 1，同时不透明度 0 → 100%。 */
export function playIconBloom(el: HTMLElement) {
  gsap.killTweensOf(el);
  return gsap.fromTo(
    el,
    { scale: 0, opacity: 0, transformOrigin: "50% 100%" },
    { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.6)" },
  );
}
