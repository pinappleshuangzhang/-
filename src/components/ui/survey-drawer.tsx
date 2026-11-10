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

const KEY_SCROLL_DELTA = 120;
const PAGE_SCROLL_DELTA = 240;
/** 与站点 md 断点一致；手机上抽屉改为从底部拉起（Figma 1008-561） */
const MOBILE_QUERY = "(max-width: 767px)";

/** 桌面端从左侧滑入，手机从底部拉起；返回收起态的 transform */
function hiddenTransform() {
  return window.matchMedia(MOBILE_QUERY).matches
    ? { xPercent: 0, yPercent: 100 }
    : { xPercent: -100, yPercent: 0 };
}

/** 桌面抽屉右缘落在「目录」和「联系我们」的间距正中。 */
function syncDrawerWidth(
  panel: HTMLElement,
  scrim: HTMLElement,
  root: HTMLElement,
) {
  if (window.matchMedia(MOBILE_QUERY).matches) {
    panel.style.width = "";
    scrim.style.width = "";
    return;
  }
  const index = document.querySelector("[data-nav-index]");
  const contact = document.querySelector("[data-nav-contact]");
  if (!(index instanceof HTMLElement) || !(contact instanceof HTMLElement)) {
    return;
  }
  const indexBox = index.getBoundingClientRect();
  const contactBox = contact.getBoundingClientRect();
  if (indexBox.width === 0 || contactBox.width === 0) return;
  const mid = (indexBox.right + contactBox.left) / 2;
  const width = `${mid - root.getBoundingClientRect().left}px`;
  panel.style.width = width;
  scrim.style.width = width;
}

function resetHorizontalScroll(start: HTMLElement | null) {
  let node = start;
  while (node) {
    if (node.scrollLeft !== 0) node.scrollLeft = 0;
    node = node.parentElement;
  }
}

type SurveyDrawerProps = {
  open: boolean;
  workIndex: number;
  scrollHandlerRef: MutableRefObject<((deltaY: number) => boolean) | null>;
  onClose: () => void;
  /** 抽屉挂载期间通知外层：长廊需保持模糊，直到离场动画结束 */
  onPresenceChange?: (present: boolean) => void;
};

/**
 * 第五屏作品详情抽屉：桌面端左侧滑入，手机端自底部拉起（顶部留 67px 露出遮罩）。
 * 图片外区域跟随鼠标显示「关闭」，点击收起。
 */
export function SurveyDrawer({
  open,
  workIndex,
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
  const navScrimRef = useRef<HTMLDivElement>(null);
  const mobileScrimRef = useRef<HTMLDivElement>(null);
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

    const hidden = hiddenTransform();
    const shown = { xPercent: 0, yPercent: 0 };

    if (reducedMotion) {
      gsap.set(overlay, { opacity: open ? 1 : 0, force3D: false });
      gsap.set(panel, open ? shown : hidden);
      if (open) {
        gsap.set(panel, { clearProps: "transform" });
        return;
      }
      const frame = window.requestAnimationFrame(() => setMounted(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const clearPanelTransform = () => {
      // 只要抽屉还开着，祖先上的 transform 就会让内部 overflow 划不动。
      gsap.set(panel, { clearProps: "transform" });
    };
    const releaseScroll = () => {
      clearPanelTransform();
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const top = scroller.scrollTop;
      // 位移动画期间生成的滚动层，清掉 transform 后 WebKit 仍可能不接手指，强制重建一次。
      scroller.style.overflowY = "hidden";
      void scroller.offsetHeight;
      scroller.style.overflowY = "";
      scroller.scrollTop = top;
    };
    const tl = gsap.timeline();
    let releaseTimer = 0;
    if (open) {
      gsap.set(overlay, { opacity: 0, force3D: false });
      gsap.set(panel, hidden);
      tl.to(
        overlay,
        { opacity: 1, duration: 0.6, ease: "none", force3D: false },
        0,
      );
      tl.to(
        panel,
        {
          ...shown,
          duration: 0.7,
          ease: "expo.out",
          force3D: false,
          overwrite: "auto",
          onComplete: releaseScroll,
        },
        0,
      );
      // 时间轴被打断时 onComplete 不会走，到点再清一次，避免必须关开一次才能滑。
      releaseTimer = window.setTimeout(releaseScroll, 800);
    } else {
      tl.eventCallback("onComplete", () => setMounted(false));
      tl.to(
        overlay,
        { opacity: 0, duration: 0.6, ease: "none", force3D: false },
        0,
      );
      tl.fromTo(
        panel,
        shown,
        { ...hidden, duration: 0.7, ease: "expo.out", overwrite: "auto" },
        0,
      );
    }
    return () => {
      window.clearTimeout(releaseTimer);
      tl.kill();
      if (open) {
        gsap.set(overlay, { opacity: 1, force3D: false });
        clearPanelTransform();
      }
    };
  }, [open, mounted, reducedMotion]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const scrim = navScrimRef.current;
    const root = rootRef.current;
    if (!panel || !scrim || !root || !mounted) return;

    const apply = () => syncDrawerWidth(panel, scrim, root);
    apply();
    const index = document.querySelector("[data-nav-index]");
    const contact = document.querySelector("[data-nav-contact]");
    const observer = new ResizeObserver(apply);
    if (index) observer.observe(index);
    if (contact) observer.observe(contact);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      panel.style.width = "";
      scrim.style.width = "";
    };
  }, [mounted, locale]);

  useLayoutEffect(() => {
    onPresenceChange?.(mounted);
    return () => onPresenceChange?.(false);
  }, [mounted, onPresenceChange]);

  useEffect(() => {
    if (!open) {
      scrollHandlerRef.current = null;
      if (navScrimRef.current) navScrimRef.current.style.opacity = "0";
      if (mobileScrimRef.current) mobileScrimRef.current.style.opacity = "0";
      return;
    }
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = 0;
    if (!window.matchMedia(MOBILE_QUERY).matches) {
      closeButtonRef.current?.focus({ preventScroll: true });
    }
    resetHorizontalScroll(rootRef.current?.parentElement ?? null);

    const syncNavScrim = () => {
      const el = scrollerRef.current;
      const shown = el && el.scrollTop > 0 ? "1" : "0";
      if (navScrimRef.current) navScrimRef.current.style.opacity = shown;
      if (mobileScrimRef.current) mobileScrimRef.current.style.opacity = shown;
    };
    const consumeScroll = (deltaY: number) => {
      if (document.querySelector("[data-survey-lightbox]")) return true;
      const el = scrollerRef.current;
      if (!el) return true;
      el.scrollTop += deltaY;
      syncNavScrim();
      return true;
    };
    scrollHandlerRef.current = consumeScroll;
    syncNavScrim();
    scroller?.addEventListener("scroll", syncNavScrim, { passive: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector("[data-survey-lightbox]")) return;
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
      scroller?.removeEventListener("scroll", syncNavScrim);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose, scrollHandlerRef]);

  if (!mounted) return null;

  const handlePanelClick = (event: MouseEvent<HTMLElement>) => {
    if (document.querySelector("[data-survey-lightbox]")) return;
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
      className={`absolute inset-0 z-40 cursor-none overflow-hidden ${open ? "" : "pointer-events-none"}`}
    >
      <button
        ref={overlayRef}
        type="button"
        tabIndex={-1}
        aria-label={t("nav.close")}
        onClick={() => {
          if (document.querySelector("[data-survey-lightbox]")) return;
          onClose();
        }}
        className="absolute inset-0 touch-none bg-grey-400/60 opacity-0 focus-visible:outline-none"
      />
      <aside
        ref={panelRef}
        onClick={handlePanelClick}
        className="absolute inset-y-0 left-0 z-10 flex w-[min(calc(var(--su)*935),calc(100%-80px))] flex-col bg-[#F7F7F9] max-md:inset-x-0 max-md:top-[67px] max-md:w-auto"
      >
        <div
          ref={scrollerRef}
          data-survey-scroller=""
          tabIndex={-1}
          onScroll={() => {
            const shown = (scrollerRef.current?.scrollTop ?? 0) > 0 ? "1" : "0";
            if (mobileScrimRef.current) mobileScrimRef.current.style.opacity = shown;
            if (navScrimRef.current) navScrimRef.current.style.opacity = shown;
          }}
          className="relative z-0 h-full overflow-y-auto overscroll-contain touch-pan-y focus-visible:outline-none [scrollbar-width:none] md:touch-none [&::-webkit-scrollbar]:hidden"
          aria-label={t("survey.detailAria")}
        >
          <SurveyDrawerContent
            open={open}
            workIndex={workIndex}
            titleId={titleId}
          />
        </div>
        {/* 白条必须盖在滚动层上面。手机 Safari 会把 overflow 滚动层画到更低 z-index 的兄弟之上，叉号就悬在内容上。 */}
        <div
          ref={mobileScrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-white opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none md:hidden"
          style={{ transform: "translateZ(0)" }}
        />
        {/* 桌面端靠跟随光标的「关闭」收起，按钮仅供读屏；手机上显示 16px 叉号（Figma 1008-561） */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label={t("nav.close")}
          onClick={onClose}
          data-survey-keep=""
          className="group absolute right-1 top-1 z-30 flex size-8 cursor-auto appearance-none items-center justify-center border-0 bg-transparent text-grey-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 md:sr-only"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="md:hidden transition-transform duration-500 ease-out group-hover:rotate-[360deg] group-focus-visible:rotate-[360deg] motion-reduce:transition-none"
          >
            <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </aside>
      {/* 仅盖住抽屉上方的导航，不延伸到右侧蒙层。下滑离开顶部后出现。 */}
      <div
        ref={navScrimRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[15] hidden h-[calc(var(--page-margin)*2+var(--su)*20)] w-[min(calc(var(--su)*935),calc(100%-80px))] bg-white/70 opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none md:block"
      />
      <p
        ref={closeLabelRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-20 mix-blend-difference text-20 leading-normal text-white opacity-0 md:text-[length:calc(var(--su)*20)] ${
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
