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

export function playMemberMarkSpin(mark: HTMLElement) {
  gsap.killTweensOf(mark);

  return gsap
    .timeline()
    .to(mark, { rotate: 28, duration: 0.16, ease: "power2.out" })
    .to(mark, { rotate: -18, duration: 0.18, ease: "power2.inOut" })
    .to(mark, { rotate: 360, duration: 0.64, ease: "power3.inOut" })
    .set(mark, { rotate: 0 });
}
