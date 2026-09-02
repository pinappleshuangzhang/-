import { useEffect, type RefObject } from "react";

function normalizeWheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * (100 / 6);
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/**
 * 把遮罩上的滚轮和拖动手势同步到抽屉滚动容器。
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

    const applyDelta = (deltaY: number) => {
      scroller.scrollTop += deltaY;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      applyDelta(normalizeWheelDeltaY(event));
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
