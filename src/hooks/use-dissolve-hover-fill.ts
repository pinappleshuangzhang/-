"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";
import { MEMBER_RECORD_HOVER_REVEAL_DURATION } from "@/animations/member-record-reveal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  createDissolveMaskFrames,
  setElementMask,
} from "@/lib/dissolve-mask";

/**
 * 导航控件尺寸较小：格子约 5×8px，对应约 34×34~120×34 的按钮。
 * 全站导航共用一套帧，首次 hover 时生成。
 */
const NAV_MASK_COLS = 24;
const NAV_MASK_ROWS = 8;
const NAV_MASK_FRAME_COUNT = 24;

let navDissolveFrames: string[] | null = null;
function getNavDissolveFrames(): string[] {
  navDissolveFrames ??= createDissolveMaskFrames(
    NAV_MASK_COLS,
    NAV_MASK_ROWS,
    NAV_MASK_FRAME_COUNT,
  );
  return navDissolveFrames;
}

/**
 * 导航按钮的溶解 hover：白底藏在斑块遮罩后逐帧显现，离开倒放。
 * 与成员卡 / 作品卡共用同一套 dissolve-mask 语言。
 */
export function useDissolveHoverFill() {
  const fillRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef({ frame: 0 });
  const reducedMotion = useReducedMotion();

  const animate = useCallback(
    (entering: boolean) => {
      const fill = fillRef.current;
      if (!fill) return;
      const frames = getNavDissolveFrames();
      if (reducedMotion || frames.length === 0) {
        fill.style.opacity = entering ? "1" : "0";
        setElementMask(fill, null);
        return;
      }
      const proxy = proxyRef.current;
      gsap.killTweensOf(proxy);
      fill.style.opacity = "1";
      gsap.to(proxy, {
        frame: entering ? frames.length - 1 : 0,
        duration: MEMBER_RECORD_HOVER_REVEAL_DURATION,
        ease: "none",
        onUpdate: () => {
          const frame = frames[Math.round(proxy.frame)];
          if (frame) setElementMask(fill, frame);
        },
        onComplete: () => {
          if (entering) {
            setElementMask(fill, null);
          } else {
            fill.style.opacity = "0";
            setElementMask(fill, null);
          }
        },
      });
    },
    [reducedMotion],
  );

  return {
    fillRef,
    onMouseEnter: () => animate(true),
    onMouseLeave: () => animate(false),
  };
}
