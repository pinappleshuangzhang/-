import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/**
 * 在容器内跟随鼠标显示关闭文案；悬停 keepSelector 时隐藏。
 * 位移用 GSAP 写入，不经 React state。
 */
export function useCloseCursor(
  enabled: boolean,
  rootRef: RefObject<HTMLElement | null>,
  labelRef: RefObject<HTMLElement | null>,
  reducedMotion: boolean,
  keepSelector = "[data-survey-keep]",
) {
  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const label = labelRef.current;
    if (!root || !label) return;

    gsap.set(label, { x: -9999, y: -9999, autoAlpha: reducedMotion ? 1 : 0 });

    const xTo = reducedMotion
      ? (value: number) => {
          gsap.set(label, { x: value });
        }
      : gsap.quickTo(label, "x", { duration: 0.18, ease: "power2.out" });
    const yTo = reducedMotion
      ? (value: number) => {
          gsap.set(label, { y: value });
        }
      : gsap.quickTo(label, "y", { duration: 0.18, ease: "power2.out" });

    let visible = reducedMotion;
    const setVisible = (next: boolean) => {
      if (visible === next) return;
      visible = next;
      if (reducedMotion) {
        gsap.set(label, { autoAlpha: next ? 1 : 0 });
        return;
      }
      gsap.to(label, {
        autoAlpha: next ? 1 : 0,
        duration: 0.2,
        overwrite: "auto",
      });
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      xTo(event.clientX - rect.left + 12);
      yTo(event.clientY - rect.top + 12);
      const overKeep = Boolean(
        (event.target as Element | null)?.closest?.(keepSelector),
      );
      setVisible(!overKeep);
    };

    const onMouseLeave = () => setVisible(false);
    root.addEventListener("mousemove", onMouseMove, true);
    root.addEventListener("mouseleave", onMouseLeave);
    return () => {
      root.removeEventListener("mousemove", onMouseMove, true);
      root.removeEventListener("mouseleave", onMouseLeave);
      gsap.killTweensOf(label);
    };
  }, [enabled, keepSelector, labelRef, reducedMotion, rootRef]);
}
