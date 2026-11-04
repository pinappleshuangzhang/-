"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import {
  CARD_HIDDEN,
  CARD_HIDDEN_SAFARI,
  CARD_SHOWN,
  CARD_SHOWN_SAFARI,
  isSafariCardClient,
} from "@/animations/studio-intro";
import { useLocale } from "@/components/providers/locale-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type SurveyEnlargeableImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
};

/** 抽屉内图片：点击后按第三屏卡片的信封翻入放大。 */
export function SurveyEnlargeableImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
}: SurveyEnlargeableImageProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-survey-keep=""
        aria-label={`${alt} ${t("survey.imageExpand")}`}
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grey-400"
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          sizes={sizes}
          className={className}
        />
      </button>
      {open ? (
        <SurveyImageLightbox
          src={src}
          alt={alt}
          width={width}
          height={height}
          closeLabel={t("nav.close")}
          onClose={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
        />
      ) : null}
    </>
  );
}

type SurveyImageLightboxProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  closeLabel: string;
  onClose: () => void;
};

function SurveyImageLightbox({
  src,
  alt,
  width,
  height,
  closeLabel,
  onClose,
}: SurveyImageLightboxProps) {
  const overlayRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const enterRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const reducedMotion = useReducedMotion();

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
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      requestClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [requestClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-survey-lightbox=""
      data-survey-keep=""
      data-lenis-prevent=""
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[80] touch-none"
    >
      <button
        ref={overlayRef}
        type="button"
        aria-label={closeLabel}
        onClick={requestClose}
        className="absolute inset-0 cursor-auto bg-grey-400/60 opacity-0 focus-visible:outline-none"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div ref={cardRef} className="pointer-events-auto w-fit max-w-[92vw]">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="92vw"
            priority
            className="h-auto max-h-[86dvh] w-auto max-w-[92vw] object-contain"
          />
        </div>
      </div>
      <button
        ref={closeRef}
        type="button"
        aria-label={closeLabel}
        onClick={requestClose}
        className="absolute top-[max(12px,env(safe-area-inset-top))] right-[max(12px,env(safe-area-inset-right))] z-10 flex size-8 cursor-auto appearance-none items-center justify-center border-0 bg-transparent text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </div>,
    document.body,
  );
}
