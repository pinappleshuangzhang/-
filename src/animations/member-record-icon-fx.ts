import gsap from "gsap";

/** 花朵 viewBox 内花心坐标，花瓣以此为原点展开 */
const FLOWER_CENTER = "57.7 42.9";
/** 花茎底端坐标，花茎以此为原点向上生长 */
const STEM_BOTTOM = "92 105";

/**
 * 花朵绽放：花茎自底端向上长出，随后四片花瓣从花心逐片弹开，
 * 全程只动 transform 与 opacity。
 */
export function playFlowerBloom(root: HTMLElement) {
  const stem = root.querySelector<SVGPathElement>("[data-flower-stem]");
  const petals = Array.from(
    root.querySelectorAll<SVGPathElement>("[data-flower-petal]"),
  );
  if (!stem || !petals.length) return null;

  gsap.killTweensOf([root, stem, ...petals]);

  return gsap
    .timeline()
    .set(root, { opacity: 1 })
    .fromTo(
      stem,
      { scale: 0, opacity: 0, svgOrigin: STEM_BOTTOM },
      { scale: 1, opacity: 1, duration: 0.45, ease: "power2.out" },
    )
    .fromTo(
      petals,
      { scale: 0, opacity: 0, svgOrigin: FLOWER_CENTER },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.08,
      },
      "-=0.15",
    );
}
