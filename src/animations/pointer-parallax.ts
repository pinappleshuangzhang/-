import gsap from "gsap";

/**
 * 指针视差：指针移动时各图层按深度位移；可选自动漂移（待机时缓慢晃动）。
 * 用 quickTo 惯性跟随（不经 React state），图层需预放大以免露白边。
 */

export type ParallaxLayer = {
  el: HTMLElement;
  /** 位移幅度（px）：正值与指针同向（近景），负值反向（远景） */
  amp: number;
  /** 预放大倍率，覆盖位移量即可（约 1 + 2×amp/短边） */
  scale: number;
};

export type PointerParallaxOptions = {
  /** 仅响应 mouse；默认 false，触控滑动同样驱动视差 */
  mouseOnly?: boolean;
  /** 无指针交互时自动缓慢漂移；默认 false */
  autoDrift?: boolean;
  /** 自动漂移角速度（弧度/秒），默认 0.35 */
  driftSpeed?: number;
};

export function createPointerParallax(
  area: HTMLElement,
  layers: ParallaxLayer[],
  options: PointerParallaxOptions = {},
): () => void {
  const { mouseOnly = false, autoDrift = false, driftSpeed = 0.35 } = options;
  const movers = layers.map(({ el, amp, scale }) => {
    gsap.set(el, { scale });
    return {
      el,
      amp,
      xTo: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
      yTo: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
    };
  });

  let pointing = false;
  let pointerNx = 0;
  let pointerNy = 0;
  let elapsed = 0;

  const apply = (nx: number, ny: number) => {
    for (const mover of movers) {
      mover.xTo(nx * mover.amp);
      mover.yTo(ny * mover.amp);
    }
  };

  const onTick = (_time: number, delta: number) => {
    if (!autoDrift || pointing) return;
    elapsed += delta / 1000;
    // 椭圆慢漂：前后景因 amp 正负自然反向
    const nx = Math.sin(elapsed * driftSpeed) * 0.85;
    const ny = Math.cos(elapsed * driftSpeed * 0.8) * 0.65;
    apply(nx, ny);
  };

  const onMove = (event: PointerEvent) => {
    if (mouseOnly && event.pointerType !== "mouse") return;
    const rect = area.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointing = true;
    pointerNx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNy = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    apply(pointerNx, pointerNy);
  };

  const onLeave = () => {
    pointing = false;
    // 无自动漂移时回正；有漂移则交给 ticker 续接
    if (!autoDrift) apply(0, 0);
  };

  if (autoDrift) {
    gsap.ticker.add(onTick);
    onTick(0, 0);
  }

  area.addEventListener("pointermove", onMove);
  area.addEventListener("pointerleave", onLeave);

  return () => {
    if (autoDrift) gsap.ticker.remove(onTick);
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
 * 仅改 y（transform），rAF 合并一帧内多次 scroll，避免与布局争抢。
 */
export function createScrollParallax(
  scroller: HTMLElement,
  blocks: { root: HTMLElement; fg: HTMLElement; bg: HTMLElement; amp: number }[],
): () => void {
  const movers = blocks.map(({ root, fg, bg, amp }) => {
    gsap.set([fg, bg], { force3D: true });
    return {
      root,
      amp,
      setFgY: gsap.quickSetter(fg, "y", "px"),
      setBgY: gsap.quickSetter(bg, "y", "px"),
    };
  });

  let raf = 0;
  const update = () => {
    raf = 0;
    const viewH = scroller.clientHeight || window.innerHeight;
    const scrollerTop = scroller.getBoundingClientRect().top;
    const viewCenter = scrollerTop + viewH / 2;
    const half = viewH * 0.5 || 1;
    for (const mover of movers) {
      const rect = mover.root.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(1, (rect.top + rect.height / 2 - viewCenter) / half),
      );
      mover.setFgY(progress * mover.amp);
      mover.setBgY(progress * -mover.amp);
    }
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  update();
  scroller.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    scroller.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    for (const block of blocks) {
      gsap.set([block.fg, block.bg], { y: 0 });
    }
  };
}
