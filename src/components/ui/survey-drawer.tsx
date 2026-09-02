"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type MutableRefObject,
} from "react";
import gsap from "gsap";
import { useLocale } from "@/components/providers/locale-provider";
import { SurveyDrawerContent } from "@/components/ui/survey-drawer-content";
import { useCloseCursor } from "@/hooks/use-close-cursor";
import { useOverlayScroller } from "@/hooks/use-overlay-scroller";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SurveyCategoryCode } from "@/lib/survey-details";

const KEY_SCROLL_DELTA = 120;
const PAGE_SCROLL_DELTA = 240;

function resetHorizontalScroll(start: HTMLElement | null) {
  let node = start;
  while (node) {
    if (node.scrollLeft !== 0) node.scrollLeft = 0;
    node = node.parentElement;
  }
}

type SurveyDrawerProps = {
  open: boolean;
  initialCode: SurveyCategoryCode;
  scrollHandlerRef: MutableRefObject<((deltaY: number) => boolean) | null>;
  onClose: () => void;
  /** 抽屉挂载期间通知外层：长廊需保持模糊，直到离场动画结束 */
  onPresenceChange?: (present: boolean) => void;
};

/**
 * 第五屏作品详情抽屉：右侧滑入，背后黑色模糊遮罩。
 * 图片外区域跟随鼠标显示「关闭」，点击收起。
 */
export function SurveyDrawer({
  open,
  initialCode,
  scrollHandlerRef,
  onClose,
  onPresenceChange,
}: SurveyDrawerProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeLabelRef = useRef<HTMLParagraphElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { locale, t } = useLocale();
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) {
    setMounted(true);
  }

  useCloseCursor(open && mounted, rootRef, closeLabelRef, reducedMotion);
  useOverlayScroller(open && mounted, overlayRef, scrollerRef);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel || !mounted) return;

    if (reducedMotion) {
      gsap.set(overlay, { opacity: open ? 1 : 0, force3D: false });
      gsap.set(panel, { xPercent: open ? 0 : 100 });
      if (open) return;
      const frame = window.requestAnimationFrame(() => setMounted(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const tl = gsap.timeline();
    if (open) {
      gsap.set(overlay, { opacity: 0, force3D: false });
      gsap.set(panel, { xPercent: 100 });
      tl.to(
        overlay,
        { opacity: 1, duration: 0.6, ease: "none", force3D: false },
        0,
      );
      tl.to(
        panel,
        {
          xPercent: 0,
          duration: 0.7,
          ease: "expo.out",
          overwrite: "auto",
          onComplete: () => {
            // 入场结束后清掉 transform，否则内部 overflow 无法走 GPU 原生滚动
            gsap.set(panel, { clearProps: "transform" });
          },
        },
        0,
      );
    } else {
      tl.eventCallback("onComplete", () => setMounted(false));
      tl.to(
        overlay,
        { opacity: 0, duration: 0.6, ease: "none", force3D: false },
        0,
      );
      tl.fromTo(
        panel,
        { xPercent: 0 },
        { xPercent: 100, duration: 0.7, ease: "expo.out", overwrite: "auto" },
        0,
      );
    }
    return () => {
      tl.kill();
    };
  }, [open, mounted, reducedMotion]);

  useLayoutEffect(() => {
    onPresenceChange?.(mounted);
    return () => onPresenceChange?.(false);
  }, [mounted, onPresenceChange]);

  useEffect(() => {
    if (!open) {
      scrollHandlerRef.current = null;
      return;
    }
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = 0;
    closeButtonRef.current?.focus({ preventScroll: true });
    resetHorizontalScroll(rootRef.current?.parentElement ?? null);

    const consumeScroll = (deltaY: number) => {
      const el = scrollerRef.current;
      if (!el) return true;
      el.scrollTop += deltaY;
      return true;
    };
    scrollHandlerRef.current = consumeScroll;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      const deltaByKey: Record<string, number> = {
        ArrowDown: KEY_SCROLL_DELTA,
        PageDown: PAGE_SCROLL_DELTA,
        ArrowUp: -KEY_SCROLL_DELTA,
        PageUp: -PAGE_SCROLL_DELTA,
        " ": event.shiftKey ? -KEY_SCROLL_DELTA : KEY_SCROLL_DELTA,
      };
      const delta = deltaByKey[event.key];
      if (delta === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      consumeScroll(delta);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      scrollHandlerRef.current = null;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose, scrollHandlerRef]);

  if (!mounted) return null;

  const handlePanelClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest("[data-survey-keep]")) return;
    onClose();
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-survey-drawer=""
      data-lenis-prevent=""
      className={`absolute inset-0 z-40 cursor-none ${open ? "" : "pointer-events-none"}`}
    >
      <button
        ref={overlayRef}
        type="button"
        tabIndex={-1}
        aria-label={t("nav.close")}
        onClick={onClose}
        className={`absolute inset-0 touch-none opacity-0 focus-visible:outline-none ${
          reducedMotion ? "bg-grey-400/70" : "bg-grey-400/55"
        }`}
      />
      <aside
        ref={panelRef}
        onClick={handlePanelClick}
        className="absolute inset-y-0 right-0 z-10 flex w-[min(935px,calc(100%-80px))] flex-col bg-grey-50"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="sr-only"
          onClick={onClose}
        >
          {t("nav.close")}
        </button>
        <div
          ref={scrollerRef}
          data-survey-scroller=""
          tabIndex={-1}
          className="h-full overflow-y-auto overscroll-contain touch-pan-y focus-visible:outline-none"
          aria-label={t("survey.detailAria")}
        >
          <SurveyDrawerContent
            open={open}
            initialCode={initialCode}
            titleId={titleId}
          />
        </div>
      </aside>
      <p
        ref={closeLabelRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-20 mix-blend-difference text-20 leading-normal text-white opacity-0 ${
          locale === "zh"
            ? "font-serif-sc font-medium"
            : "font-bodoni font-normal uppercase"
        }`}
      >
        {t("nav.close")}
      </p>
    </div>
  );
}
