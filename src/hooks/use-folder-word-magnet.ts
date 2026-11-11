import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/** 词心离光标超过此距离就不再被拉动。 */
const INFLUENCE_RADIUS = 320;
/** 距离越近，词沿指向光标的方向走得越多。 */
const PULL = 0.55;
/** 单词最大位移，避免整段叠到光标上无法阅读。 */
const MAX_PULL = 40;

type WordMover = {
  restX: number;
  restY: number;
  xTo: (value: number) => void;
  yTo: (value: number) => void;
};

type PointerPoint = { x: number; y: number };

let lastPointer: PointerPoint | null = null;
let pointerTrackerReady = false;

/** 光标可能在本屏激活前就停在书上，入场结束时不会再有新的移动事件。 */
function ensurePointerTracker() {
  if (pointerTrackerReady || typeof window === "undefined") return;
  pointerTrackerReady = true;
  window.addEventListener(
    "pointermove",
    (event) => {
      lastPointer = { x: event.clientX, y: event.clientY };
    },
    { passive: true },
  );
}

ensurePointerTracker();

/**
 * 逐词入场结束后，光标已在文件夹内会立刻吸附；之后进入再吸附，离开回到原位。
 * 位移只写 transform，不进 React state。
 */
export function useFolderWordMagnet(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  locale: string,
) {
  useEffect(() => {
    if (!enabled) return;
    const root = containerRef.current;
    if (!root) return;
    const folder = root.querySelector<HTMLElement>("[data-folder]");
    const copy = root.querySelector<HTMLElement>("[data-intro-copy]");
    if (!folder || !copy) return;

    let movers: WordMover[] = [];
    let inside = false;

    const wordsInCopy = () =>
      Array.from(copy.querySelectorAll<HTMLElement>(".sd-word"));

    const capture = () => {
      const words = wordsInCopy();
      gsap.killTweensOf(words);
      gsap.set(words, { x: 0, y: 0, force3D: false });
      movers = words.map((word) => {
        const rect = word.getBoundingClientRect();
        return {
          restX: rect.left + rect.width / 2,
          restY: rect.top + rect.height / 2,
          xTo: gsap.quickTo(word, "x", {
            duration: 0.55,
            ease: "power3.out",
            force3D: false,
          }),
          yTo: gsap.quickTo(word, "y", {
            duration: 0.55,
            ease: "power3.out",
            force3D: false,
          }),
        };
      });
    };

    const attract = (clientX: number, clientY: number) => {
      if (copy.dataset.magnet !== "ready") return;
      if (movers.length === 0) capture();
      for (const mover of movers) {
        const dx = clientX - mover.restX;
        const dy = clientY - mover.restY;
        const dist = Math.hypot(dx, dy);
        const influence = Math.max(0, 1 - dist / INFLUENCE_RADIUS);
        let x = dx * influence * PULL;
        let y = dy * influence * PULL;
        const magnitude = Math.hypot(x, y);
        if (magnitude > MAX_PULL) {
          const scale = MAX_PULL / magnitude;
          x *= scale;
          y *= scale;
        }
        mover.xTo(x);
        mover.yTo(y);
      }
    };

    const pointerInsideFolder = (point: PointerPoint) => {
      const rect = folder.getBoundingClientRect();
      return (
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      );
    };

    const settleIfInside = () => {
      if (copy.dataset.magnet !== "ready" || !lastPointer) return;
      if (!pointerInsideFolder(lastPointer)) return;
      inside = true;
      capture();
      attract(lastPointer.x, lastPointer.y);
    };

    const onEnter = () => {
      inside = true;
      if (copy.dataset.magnet === "ready") capture();
    };

    const onMove = (event: PointerEvent) => {
      if (!inside) return;
      attract(event.clientX, event.clientY);
    };

    const onLeave = () => {
      inside = false;
      for (const mover of movers) {
        mover.xTo(0);
        mover.yTo(0);
      }
    };

    const onMagnetReady = new MutationObserver(settleIfInside);
    onMagnetReady.observe(copy, {
      attributes: true,
      attributeFilter: ["data-magnet"],
    });
    settleIfInside();

    folder.addEventListener("pointerenter", onEnter);
    folder.addEventListener("pointermove", onMove);
    folder.addEventListener("pointerleave", onLeave);
    return () => {
      onMagnetReady.disconnect();
      folder.removeEventListener("pointerenter", onEnter);
      folder.removeEventListener("pointermove", onMove);
      folder.removeEventListener("pointerleave", onLeave);
      const words = wordsInCopy();
      gsap.killTweensOf(words);
      gsap.set(words, { x: 0, y: 0, force3D: false });
    };
  }, [containerRef, enabled, locale]);
}
