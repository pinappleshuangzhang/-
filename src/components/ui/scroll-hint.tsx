"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ENTRANCE_HIDDEN,
  ENTRANCE_TWEEN,
} from "@/animations/entrance";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(useGSAP);

export function ScrollHint() {
  return (
    <span className="flex flex-col items-center gap-1" aria-hidden="true">
      <span className="font-bodoni text-12 uppercase italic text-grey-400">
        Scroll
      </span>
      <span className="relative h-[18px] w-[14px] rounded-rm-12 border border-grey-400">
        <span className="absolute left-1/2 top-[6px] h-[5px] w-px -translate-x-1/2 rounded-full bg-grey-400" />
      </span>
    </span>
  );
}

type NextScreenHintProps = {
  onActivate: () => void;
};

/**
 * 右下角切屏提示：固定在视口右下角贴 30px 边距。
 * 同时是可聚焦按钮，键盘与指针用户都能据此进入下一屏。
 * 挂载时以全站统一的角度浮现动效入场（与首屏标题、第二屏文字一致）。
 */
export function NextScreenHint({ onActivate }: NextScreenHintProps) {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!container.current || reducedMotion) return;
      gsap.from(container.current, { ...ENTRANCE_HIDDEN, ...ENTRANCE_TWEEN });
    },
    { dependencies: [reducedMotion], scope: container },
  );

  return (
    <div
      ref={container}
      className="pointer-events-none fixed inset-x-0 bottom-[30px] z-50"
    >
      <div className="mx-auto flex w-[calc(100%-60px)] justify-end">
        <button
          type="button"
          onClick={onActivate}
          aria-label="进入下一屏"
          className="pointer-events-auto rounded-rs-8 p-1 transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <ScrollHint />
        </button>
      </div>
    </div>
  );
}
