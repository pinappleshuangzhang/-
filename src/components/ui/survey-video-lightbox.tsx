"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type SurveyVideoLightboxProps = {
  src: string;
  label: string;
  closeLabel: string;
  onClose: () => void;
};

const PORTRAIT_QUERY = "(orientation: portrait)";

function subscribePortrait(callback: () => void) {
  const media = window.matchMedia(PORTRAIT_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function usePortrait() {
  return useSyncExternalStore(
    subscribePortrait,
    () => window.matchMedia(PORTRAIT_QUERY).matches,
    () => true,
  );
}

const portraitFrameStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "100dvh",
  height: "100dvw",
  maxWidth: "none",
  transform: "translate(-50%, -50%) rotate(90deg)",
};

const landscapeFrameStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

/**
 * 手机端全屏看片：沿用浏览器默认 controls，关闭钮贴在控件左侧以免挡住展开/画中画。
 */
export function SurveyVideoLightbox({
  src,
  label,
  closeLabel,
  onClose,
}: SurveyVideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const isPortrait = usePortrait();

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const video = videoRef.current;
    if (video && !reducedMotion) {
      void video.play().catch(() => {
        /* 自动播放被拒时保留控件 */
      });
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown, true);
      video?.pause();
    };
  }, [onClose, reducedMotion]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-survey-video-lightbox=""
      data-survey-keep=""
      className="fixed inset-0 z-50 overflow-hidden bg-grey-400"
    >
      <div
        className="pointer-events-auto"
        style={isPortrait ? portraitFrameStyle : landscapeFrameStyle}
      >
        <video
          ref={videoRef}
          src={src}
          controls
          playsInline
          className="h-full w-full object-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={label}
        />
      </div>
      <button
        ref={closeRef}
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute top-[max(12px,env(safe-area-inset-top))] right-20 z-10 flex size-8 appearance-none items-center justify-center border-0 bg-transparent text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M1 1l14 14M15 1L1 15"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </button>
    </div>,
    document.body,
  );
}
