"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";
import { MEMBER_RECORD_HOVER_REVEAL_DURATION } from "@/animations/member-record-reveal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  clearElementMask,
  createDissolveMaskSprite,
  setSpriteMaskFrame,
  type DissolveMaskSprite,
} from "@/lib/dissolve-mask";

/**
 * 溶解 hover 的目标颗粒边长（px）。按元素实测尺寸换算行列，
 * 宽按钮与小方钮共用同一套颗粒语言。
 */
const TARGET_CELL_PX = 6;
const NAV_MASK_FRAME_COUNT = 24;
const MIN_MASK_COLS = 12;
const MIN_MASK_ROWS = 6;
const MAX_MASK_COLS = 160;
const MAX_MASK_ROWS = 48;

const navDissolveSpriteCache = new Map<string, DissolveMaskSprite | null>();

function getNavDissolveSprite(
  width: number,
  height: number,
): DissolveMaskSprite | null {
  const cols = Math.min(
    MAX_MASK_COLS,
    Math.max(MIN_MASK_COLS, Math.round(width / TARGET_CELL_PX)),
  );
  const rows = Math.min(
    MAX_MASK_ROWS,
    Math.max(MIN_MASK_ROWS, Math.round(height / TARGET_CELL_PX)),
  );
  const key = `${cols}x${rows}`;
  const cached = navDissolveSpriteCache.get(key);
  if (cached !== undefined) return cached;
  const sprite = createDissolveMaskSprite(cols, rows, NAV_MASK_FRAME_COUNT);
  navDissolveSpriteCache.set(key, sprite);
  return sprite;
}

/**
 * 导航按钮的溶解 hover：白底藏在斑块遮罩后逐帧显现，离开倒放。
 * 与成员卡 / 作品卡共用同一套 dissolve-mask 语言。
 */
type DissolveHoverFillOptions = {
  /** 默认填充是否可见；invert 用于“进入时消失、离开时恢复”的深色按钮。 */
  initiallyVisible?: boolean;
  invert?: boolean;
};

export function useDissolveHoverFill({
  initiallyVisible = false,
  invert = false,
}: DissolveHoverFillOptions = {}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef({
    frame: initiallyVisible ? NAV_MASK_FRAME_COUNT - 1 : 0,
  });
  const reducedMotion = useReducedMotion();

  const reset = useCallback(() => {
    const fill = fillRef.current;
    const proxy = proxyRef.current;
    gsap.killTweensOf(proxy);
    proxy.frame = initiallyVisible ? NAV_MASK_FRAME_COUNT - 1 : 0;
    if (!fill) return;
    fill.style.opacity = initiallyVisible ? "1" : "0";
    clearElementMask(fill);
  }, [initiallyVisible]);

  const animate = useCallback(
    (entering: boolean) => {
      const fill = fillRef.current;
      if (!fill) return;
      const sprite = getNavDissolveSprite(
        fill.offsetWidth,
        fill.offsetHeight,
      );
      if (reducedMotion || !sprite) {
        fill.style.opacity = entering ? "1" : "0";
        clearElementMask(fill);
        return;
      }
      const proxy = proxyRef.current;
      gsap.killTweensOf(proxy);
      fill.style.opacity = "1";
      gsap.to(proxy, {
        frame: entering ? sprite.frameCount - 1 : 0,
        duration: MEMBER_RECORD_HOVER_REVEAL_DURATION,
        ease: "none",
        onUpdate: () => {
          setSpriteMaskFrame(fill, sprite, Math.round(proxy.frame));
        },
        onComplete: () => {
          if (entering) {
            clearElementMask(fill);
          } else {
            fill.style.opacity = "0";
            clearElementMask(fill);
          }
        },
      });
    },
    [reducedMotion],
  );

  return {
    fillRef,
    reset,
    onMouseEnter: () => animate(!invert),
    onMouseLeave: () => animate(invert),
  };
}
