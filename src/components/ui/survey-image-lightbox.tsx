"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { settleDrawerMedia } from "@/animations/sondaven-reveal";
import {
  CARD_HIDDEN,
  CARD_HIDDEN_SAFARI,
  CARD_SHOWN,
  CARD_SHOWN_SAFARI,
  isSafariCardClient,
} from "@/animations/studio-intro";
import { useLocale } from "@/components/providers/locale-provider";
import { useCloseCursor } from "@/hooks/use-close-cursor";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type SurveyImageLightboxProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  closeLabel: string;
  onClose: () => void;
};

/** 放大层：第三屏卡片翻入。关掉时只收回图片，抽屉保持打开。 */
export function SurveyImageLightbox({
  src,
  alt,
  width,
  height,
  closeLabel,
  onClose,
}: SurveyImageLightboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeLabelRef = useRef<HTMLParagraphElement>(null);
  const enterRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const reducedMotion = useReducedMotion();
  const { locale } = useLocale();
  useCloseCursor(true, rootRef, closeLabelRef, reducedMotion);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const card = cardRef.current;
    if (!overlay || !card) return;

    const safari = isSafariCardClient();
    const hidden = safari ? CARD_HIDDEN_SAFARI : CARD_HIDDEN;
    const shown = safari ? CARD_SHOWN_SAFARI : CARD_SHOWN;
    if (!safari) {
      gsap.set(card, {
        transformPerspective: 900,
        transformOrigin: "50% 50%",
        force3D: true,
      });
    }
    closeRef.current?.focus();

    if (reducedMotion) {
      gsap.set(overlay, { opacity: 1, force3D: false });
      gsap.set(card, shown);
      return;
    }

    gsap.set(overlay, { opacity: 0, force3D: false });
    gsap.set(card, hidden);
    const tl = gsap.timeline();
    enterRef.current = tl;
    tl.to(
      overlay,
      { opacity: 1, duration: 0.6, ease: "power2.inOut", force3D: false },
      0,
    );
    tl.fromTo(card, hidden, { ...shown, duration: 1.2, ease: "power4.out" }, 0);
    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const overlay = overlayRef.current;
    const card = cardRef.current;
    enterRef.current?.kill();
    if (!overlay || !card || reducedMotion) {
      onCloseRef.current();
      return;
    }
    const hidden = isSafariCardClient() ? CARD_HIDDEN_SAFARI : CARD_HIDDEN;
    const tl = gsap.timeline({ onComplete: () => onCloseRef.current() });
    enterRef.current = tl;
    tl.to(card, { ...hidden, duration: 0.7, ease: "power4.in" }, 0);
    tl.to(
      overlay,
      { opacity: 0, duration: 0.5, ease: "power2.in", force3D: false },
      0.15,
    );
  }, [reducedMotion]);

  useEffect(() => {
    settleDrawerMedia();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      requestClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      settleDrawerMedia();
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [requestClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      data-survey-lightbox=""
      data-lenis-prevent=""
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[80] cursor-none touch-none"
    >
      <button
        ref={overlayRef}
        type="button"
        tabIndex={-1}
        aria-label={closeLabel}
        onClick={(event) => {
          event.stopPropagation();
          requestClose();
        }}
        className="absolute inset-0 bg-grey-400/60 opacity-0 focus-visible:outline-none"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div ref={cardRef} data-survey-keep="" className="pointer-events-auto cursor-auto">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="85vw"
            priority
            className="h-auto max-h-[85vh] max-w-[85vw] object-contain"
            style={{
              width: `min(85vw, calc(85vh * ${width} / ${height}))`,
              height: "auto",
            }}
          />
        </div>
      </div>
      <button
        ref={closeRef}
        type="button"
        aria-label={closeLabel}
        onClick={requestClose}
        className="absolute top-[max(12px,env(safe-area-inset-top))] right-[max(12px,env(safe-area-inset-right))] z-10 flex size-8 appearance-none items-center justify-center border-0 bg-transparent text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:sr-only"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <p
        ref={closeLabelRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-20 mix-blend-difference text-20 leading-normal text-white opacity-0 md:text-[length:calc(var(--su)*20)] ${
          locale === "zh"
            ? "font-serif-sc font-medium"
            : "font-bodoni font-normal uppercase"
        }`}
      >
        {closeLabel}
      </p>
    </div>,
    document.body,
  );
}
