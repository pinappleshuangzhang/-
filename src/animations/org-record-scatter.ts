import gsap from "gsap";

/**
 * 铭牌标题笔画迸发：触发时文字层换成逐笔画 SVG，
 * 所有笔画同时嘭地向右上方炸开，一边放大、变模糊，一边飞出屏幕。
 */

/** 飞散方向：右上偏上（相对水平线的仰角，单位度） */
const ANGLE_MIN = 32;
const ANGLE_MAX = 78;

/** 滞留比例：这部分笔画减速后不出屏，化作模糊的残影留在半空 */
const LINGER_RATIO = 0.3;

export function buildScatterTimeline(root: HTMLElement): gsap.core.Timeline {
  const glyphs = gsap.utils.toArray<HTMLElement>("[data-scatter-glyph]", root);
  const layers = gsap.utils.toArray<HTMLElement>("[data-scatter-svg]", root);
  const strokes = gsap.utils.toArray<SVGSVGElement>(
    "[data-scatter-stroke]",
    root,
  );

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const timeline = gsap.timeline();
  // 换层：隐藏原文字，亮出笔画层（同一瞬间，紧接着就炸开）
  timeline.set(glyphs, { autoAlpha: 0 }, 0);
  timeline.set(layers, { autoAlpha: 1 }, 0);

  strokes.forEach((stroke) => {
    const angle = (gsap.utils.random(ANGLE_MIN, ANGLE_MAX) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // 沿飞行方向越过屏幕右缘或上缘即算离场，再加余量确保模糊放大后也完全出屏
    const rect = stroke.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distToExit = Math.min(
      (viewportWidth - centerX + rect.width) / cos,
      (centerY + rect.height) / sin,
    );
    // 大部分笔画飞出屏幕；少数减速滞留在视口右上角，化作模糊残影
    const linger = Math.random() < LINGER_RATIO;
    const dist = distToExit * gsap.utils.random(1.25, 1.9);
    const lingerX =
      viewportWidth * gsap.utils.random(0.74, 0.94) - centerX;
    const lingerY =
      viewportHeight * gsap.utils.random(0.06, 0.26) - centerY;

    // 阻尼感：瞬间迸发后骤然减速，剩下的路程缓慢地、不可逆转地飘远
    const duration = gsap.utils.random(2.6, 3.6);
    const start = gsap.utils.random(0, 0.18);

    timeline.to(
      stroke,
      {
        x: linger ? lingerX : cos * dist,
        y: linger ? lingerY : -sin * dist,
        rotation: gsap.utils.random(-160, 160),
        scale: linger
          ? gsap.utils.random(1.6, 2.6)
          : gsap.utils.random(2.5, 5),
        filter: linger
          ? `blur(${gsap.utils.random(4, 8)}px)`
          : `blur(${gsap.utils.random(10, 20)}px)`,
        duration,
        ease: "expo.out",
      },
      start,
    );
  });

  return timeline;
}

/** 复位：笔画归位隐藏，恢复原文字层 */
export function resetScatter(root: HTMLElement) {
  const glyphs = gsap.utils.toArray<HTMLElement>("[data-scatter-glyph]", root);
  const layers = gsap.utils.toArray<HTMLElement>("[data-scatter-svg]", root);
  const strokes = gsap.utils.toArray<SVGSVGElement>(
    "[data-scatter-stroke]",
    root,
  );
  gsap.set(strokes, {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    clearProps: "filter",
  });
  gsap.set(layers, { autoAlpha: 0 });
  gsap.set(glyphs, { autoAlpha: 1 });
}
