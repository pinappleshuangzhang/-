import gsap from "gsap";

/**
 * 鼠标视差：指针在区域内移动时，各图层按自身深度系数轻微位移，
 * 用 quickTo 惯性跟随（不经 React state），离开区域回归原位。
 * 图层需预放大以留出位移余量，避免在遮罩容器内露出白边。
 * 默认响应所有指针类型（鼠标 / 触控），与 PC 交互保持一致。
 */

export type ParallaxLayer = {
  el: HTMLElement;
  /** 位移幅度（px）：正值与鼠标同向（近景），负值反向（远景） */
  amp: number;
  /** 预放大倍率，覆盖位移量即可（约 1 + 2×amp/短边） */
  scale: number;
};

export type PointerParallaxOptions = {
  /** 仅响应 mouse；默认 false，触控滑动同样驱动视差 */
  mouseOnly?: boolean;
};

export function createPointerParallax(
  area: HTMLElement,
  layers: ParallaxLayer[],
  options: PointerParallaxOptions = {},
): () => void {
  const { mouseOnly = false } = options;
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
    if (mouseOnly && event.pointerType !== "mouse") return;
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

/**
 * 滚动视差：媒体块在滚动容器中滑过时，前后景按深度反向位移。
 * 仅改 y（transform），不触发布局。
 */
export function createScrollParallax(
  scroller: HTMLElement,
  blocks: { root: HTMLElement; fg: HTMLElement; bg: HTMLElement; amp: number }[],
): () => void {
  for (const block of blocks) {
    gsap.set([block.fg, block.bg], { force3D: true });
  }

  const update = () => {
    const viewH = scroller.clientHeight || window.innerHeight;
    for (const block of blocks) {
      const rect = block.root.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      // 块中心相对滚动视口中心，归一到约 -1 ~ 1
      const blockCenter = rect.top + rect.height / 2;
      const viewCenter = scrollerRect.top + viewH / 2;
      const progress = Math.max(
        -1,
        Math.min(1, (blockCenter - viewCenter) / (viewH * 0.5)),
      );
      gsap.set(block.fg, { y: progress * block.amp });
      gsap.set(block.bg, { y: progress * -block.amp });
    }
  };

  update();
  scroller.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  return () => {
    scroller.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    for (const block of blocks) {
      gsap.set([block.fg, block.bg], { y: 0 });
    }
  };
}
