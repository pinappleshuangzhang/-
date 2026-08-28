import gsap from "gsap";

/**
 * 鼠标视差：指针在区域内移动时，各图层按自身深度系数轻微位移，
 * 用 quickTo 惯性跟随（不经 React state），离开区域回归原位。
 * 图层需预放大以留出位移余量，避免在遮罩容器内露出白边。
 */

export type ParallaxLayer = {
  el: HTMLElement;
  /** 位移幅度（px）：正值与鼠标同向（近景），负值反向（远景） */
  amp: number;
  /** 预放大倍率，覆盖位移量即可（约 1 + 2×amp/短边） */
  scale: number;
};

export function createPointerParallax(
  area: HTMLElement,
  layers: ParallaxLayer[],
): () => void {
  const movers = layers.map(({ el, amp, scale }) => {
    gsap.set(el, { scale });
    return {
      el,
      amp,
      xTo: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }),
      yTo: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }),
    };
  });

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const rect = area.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // 指针位置归一化到 -1 ~ 1（区域中心为原点）
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    for (const mover of movers) {
      mover.xTo(nx * mover.amp);
      mover.yTo(ny * mover.amp);
    }
  };

  const onLeave = () => {
    for (const mover of movers) {
      mover.xTo(0);
      mover.yTo(0);
    }
  };

  area.addEventListener("pointermove", onMove);
  area.addEventListener("pointerleave", onLeave);

  return () => {
    area.removeEventListener("pointermove", onMove);
    area.removeEventListener("pointerleave", onLeave);
    for (const mover of movers) {
      gsap.killTweensOf(mover.el);
      gsap.set(mover.el, { x: 0, y: 0, scale: 1 });
    }
  };
}
