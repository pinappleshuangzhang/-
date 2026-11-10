import { useEffect, type RefObject } from "react";

function normalizeWheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * (100 / 6);
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/**
 * 桌面滚轮和遮罩上的拖动同步到抽屉。手机正文用原生滑动。
 * 点击仍关闭；拖动超过阈值则不算点击。
 */
export function useOverlayScroller(
  enabled: boolean,
  overlayRef: RefObject<HTMLElement | null>,
  scrollerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!enabled) return;
    const overlay = overlayRef.current;
    const scroller = scrollerRef.current;
    if (!overlay || !scroller) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // scrollTop 只保留整数。触控板开头的亚像素如果不累计，连滑几次都停在 0。
    let pending = 0;
    let velocity = 0;
    let lastWheelAt = 0;
    let burstCount = 0;
    let inertiaFrame = 0;
    let inertiaTimer = 0;

    const stopInertia = () => {
      window.clearTimeout(inertiaTimer);
      if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
      inertiaFrame = 0;
    };

    const applyDelta = (deltaY: number) => {
      pending += deltaY;
      const step =
        pending >= 1 ? Math.floor(pending) : pending <= -1 ? Math.ceil(pending) : 0;
      if (step === 0) return;
      pending -= step;
      const max = scroller.scrollHeight - scroller.clientHeight;
      scroller.scrollTop = Math.min(max, Math.max(0, scroller.scrollTop + step));
    };

    // preventDefault 会吃掉触控板松手后的惯性。手势停下来后按末速度再滑一段。
    const startInertia = () => {
      const count = burstCount;
      const speed = velocity;
      burstCount = 0;
      velocity = 0;
      if (reducedMotion || count < 4 || Math.abs(speed) < 0.08) return;
      let current = Math.max(-2.2, Math.min(2.2, speed));
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(32, now - last);
        last = now;
        current *= Math.pow(0.92, dt / 16);
        if (Math.abs(current) < 0.02) return;
        const before = scroller.scrollTop;
        applyDelta(current * dt);
        if (scroller.scrollTop === before) return;
        inertiaFrame = requestAnimationFrame(tick);
      };
      inertiaFrame = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      // 切屏在 document 上挂了非被动滚轮监听。Safari 只要存在这个监听，
      // 就不会再滚动内部 overflow，所以抽屉自己滚。
      if (!event.cancelable) return;
      event.preventDefault();
      stopInertia();
      const delta = normalizeWheelDeltaY(event);
      const now = performance.now();
      const gap = lastWheelAt === 0 ? 64 : now - lastWheelAt;
      const dt = Math.min(48, Math.max(8, gap));
      lastWheelAt = now;
      const sample = delta / dt;
      if (gap > 64) {
        velocity = sample;
        burstCount = 1;
      } else {
        velocity = velocity * 0.45 + sample * 0.55;
        burstCount += 1;
      }
      applyDelta(delta);
      inertiaTimer = window.setTimeout(startInertia, 64);
    };

    let lastY = 0;
    let pointerId: number | null = null;
    let travel = 0;
    let dragged = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      lastY = event.clientY;
      pointerId = event.pointerId;
      travel = 0;
      dragged = false;
      overlay.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      const deltaY = lastY - event.clientY;
      lastY = event.clientY;
      if (deltaY === 0) return;
      travel += Math.abs(deltaY);
      if (travel >= 4) dragged = true;
      applyDelta(deltaY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      if (overlay.hasPointerCapture(event.pointerId)) {
        overlay.releasePointerCapture(event.pointerId);
      }
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    const stopTouch = (event: TouchEvent) => {
      event.stopPropagation();
    };

    // 手机正文走原生滑动。手指滚动不再 preventDefault，避免每帧在主线程改 scrollTop。
    // 只记录位移，滑过以后不把这次手势当成点击。
    let touchDrag = 0;
    let touchY = 0;

    const onScrollerTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchDrag = 0;
      touchY = event.touches[0]?.clientY ?? 0;
    };

    const onScrollerTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const y = event.touches[0]?.clientY ?? touchY;
      touchDrag += Math.abs(y - touchY);
      touchY = y;
    };

    const onScrollerClickCapture = (event: MouseEvent) => {
      if (touchDrag < 4) return;
      event.preventDefault();
      event.stopPropagation();
      touchDrag = 0;
    };

    // 滚轮仍由抽屉自己滚。手机手指不拦截，交给滚动容器的原生滑动。
    scroller.addEventListener("wheel", onWheel, { passive: false, capture: true });
    scroller.addEventListener("touchstart", onScrollerTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onScrollerTouchMove, { passive: true });
    scroller.addEventListener("click", onScrollerClickCapture, true);
    overlay.addEventListener("wheel", onWheel, { passive: false });
    overlay.addEventListener("pointerdown", onPointerDown);
    overlay.addEventListener("pointermove", onPointerMove);
    overlay.addEventListener("pointerup", onPointerUp);
    overlay.addEventListener("pointercancel", onPointerUp);
    overlay.addEventListener("click", onClickCapture, true);
    overlay.addEventListener("touchstart", stopTouch, { passive: true });
    overlay.addEventListener("touchmove", stopTouch, { passive: true });
    overlay.addEventListener("touchend", stopTouch, { passive: true });

    return () => {
      stopInertia();
      scroller.removeEventListener("wheel", onWheel, { capture: true });
      scroller.removeEventListener("touchstart", onScrollerTouchStart);
      scroller.removeEventListener("touchmove", onScrollerTouchMove);
      scroller.removeEventListener("click", onScrollerClickCapture, true);
      overlay.removeEventListener("wheel", onWheel);
      overlay.removeEventListener("pointerdown", onPointerDown);
      overlay.removeEventListener("pointermove", onPointerMove);
      overlay.removeEventListener("pointerup", onPointerUp);
      overlay.removeEventListener("pointercancel", onPointerUp);
      overlay.removeEventListener("click", onClickCapture, true);
      overlay.removeEventListener("touchstart", stopTouch);
      overlay.removeEventListener("touchmove", stopTouch);
      overlay.removeEventListener("touchend", stopTouch);
    };
  }, [enabled, overlayRef, scrollerRef]);
}
