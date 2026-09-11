import gsap from "gsap";

export function playGravaStrokeLoad(
  base: HTMLElement,
  strokeSegments: HTMLElement[],
) {
  gsap.killTweensOf([base, ...strokeSegments]);

  return gsap
    .timeline()
    .set(base, { opacity: 0 })
    .fromTo(
      strokeSegments,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.12,
        stagger: 0.07,
        ease: "none",
      },
    )
    .set(base, { opacity: 1 })
    .set(strokeSegments, { opacity: 0 });
}

/** 四块菱形从右上起顺时针依次渐隐，再以同顺序缓慢渐现。 */
export function playMemberMarkReveal(diamonds: HTMLElement[]) {
  gsap.killTweensOf(diamonds);

  return gsap
    .timeline()
    .to(
      diamonds,
      {
        opacity: 0,
        duration: 0.32,
        stagger: 0.12,
        ease: "power2.inOut",
      },
    )
    .to(
      diamonds,
      {
        opacity: 1,
        duration: 0.42,
        stagger: 0.12,
        ease: "power2.inOut",
      },
      "-=0.12",
    );
}
