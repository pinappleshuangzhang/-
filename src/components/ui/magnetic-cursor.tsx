"use client";

import { useRef, useSyncExternalStore } from "react";
import { useDesktopMedia } from "@/hooks/use-desktop-media";
import { useMagneticCursor } from "@/hooks/use-magnetic-cursor";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const media = window.matchMedia(FINE_POINTER_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getFinePointer() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServer() {
  return false;
}

/**
 * 桌面精细指针下的动态光标：圆点贴指针，圆环滞后，
 * 悬停按钮或链接时圆环与控件互相吸近。
 * 触控、窄屏和减少动态效果时不挂载，系统光标保持原样。
 */
export function MagneticCursor() {
  const desktop = useDesktopMedia();
  const fine = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointer,
    getFinePointerServer,
  );
  const reduced = useReducedMotion();
  const active = desktop && fine && !reduced;
  const rootRef = useRef<HTMLDivElement>(null);
  useMagneticCursor(active, rootRef);

  if (!active) return null;

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none fixed inset-0">
      <span
        data-cursor-ring=""
        className="absolute left-0 top-0 z-[90] mix-blend-difference"
      >
        <span
          data-cursor-ring-shape=""
          className="block size-10 rounded-full border border-white"
        />
      </span>
      <span
        data-cursor-dot=""
        className="absolute left-0 top-0 z-[90] size-2 rounded-full bg-white mix-blend-difference"
      />
    </div>
  );
}
