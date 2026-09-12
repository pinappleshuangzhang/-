"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ARCHIVE_INDEX_ITEMS,
  type ArchiveIndexItem,
} from "@/lib/archive-index-items";
import { useLocale } from "@/components/providers/locale-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import binderImg from "../../../public/archive-index/binder.webp";
import bgImg from "../../../public/archive-index/bg.webp";

gsap.registerPlugin(useGSAP);

/** 与工作室简介的高亮条一致：黑底由左向右擦入，白字随裁切同步露出。 */
const INDEX_TAB_WIPE_DURATION = 1.2;
const INDEX_TAB_CLIP_HIDDEN = "inset(0 100% 0 0)";
const INDEX_TAB_CLIP_VISIBLE = "inset(0 0% 0 0)";
/** 与站点 md 断点、作品抽屉一致 */
const MOBILE_QUERY = "(max-width: 767px)";
const DRAWER_DURATION = 0.7;
const OVERLAY_DURATION = 0.6;

type ArchiveIndexProps = {
  open: boolean;
  /** 当前分屏 key，用于高亮对应目录项 */
  activeScreenKey: string;
  onClose: () => void;
  onSelect: (screenKey: string) => void;
  /** 公共 SiteNav 关闭按钮，打开时聚焦 */
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
};

/**
 * 全屏档案目录（Figma 00目录）：半透明活页夹视觉 + 档案列表。
 * 顶栏由公共 SiteNav（index 变体）提供，本组件只负责目录内容层。
 * 打开时鼠标跟随显示 CLOSE；点击空白处关闭，点目录项仍跳转。
 */
export function ArchiveIndex({
  open,
  activeScreenKey,
  onClose,
  onSelect,
  closeButtonRef,
}: ArchiveIndexProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeLabelRef = useRef<HTMLParagraphElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { locale, t } = useLocale();
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) {
    setMounted(true);
  }

  // 目录关闭时组件仍挂载：空闲预热活页夹与背景，避免首次展开才请求解码。
  useEffect(() => {
    const sources = [binderImg.src, bgImg.src];
    const warm = () => {
      for (const src of sources) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(warm, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timer = window.setTimeout(warm, 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef?.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, closeButtonRef]);

  // CLOSE 鼠标跟随：GSAP 写 transform，不经 React state
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const label = closeLabelRef.current;
    if (!panel || !label) return;

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
      const rect = panel.getBoundingClientRect();
      xTo(event.clientX - rect.left + 12);
      yTo(event.clientY - rect.top + 12);
      const overInteractive = Boolean(
        (event.target as Element | null)?.closest?.(
          "[data-index-interactive]",
        ),
      );
      setVisible(!overInteractive);
    };
    const onMouseLeave = () => setVisible(false);

    panel.addEventListener("mousemove", onMouseMove);
    panel.addEventListener("mouseleave", onMouseLeave);
    return () => {
      panel.removeEventListener("mousemove", onMouseMove);
      panel.removeEventListener("mouseleave", onMouseLeave);
      gsap.killTweensOf(label);
    };
  }, [open, reducedMotion]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !mounted) return;

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const overlay = mobileOverlayRef.current;
    const drawer = mobileDrawerRef.current;
    const hidden = { yPercent: 100 };
    const shown = { yPercent: 0 };

    if (reducedMotion) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0 });
      if (overlay) gsap.set(overlay, { opacity: open ? 1 : 0 });
      if (drawer) gsap.set(drawer, open ? shown : hidden);
      if (open) return;
      const frame = window.requestAnimationFrame(() => setMounted(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (!open) setMounted(false);
      },
    });

    if (isMobile && overlay && drawer) {
      gsap.set(panel, { autoAlpha: 1 });
      if (open) {
        gsap.set(overlay, { opacity: 0 });
        gsap.set(drawer, hidden);
        tl.to(overlay, { opacity: 1, duration: OVERLAY_DURATION, ease: "none" }, 0);
        tl.to(drawer, { ...shown, duration: DRAWER_DURATION, ease: "expo.out" }, 0);
      } else {
        tl.to(overlay, { opacity: 0, duration: OVERLAY_DURATION, ease: "none" }, 0);
        tl.to(drawer, { ...hidden, duration: DRAWER_DURATION, ease: "expo.out" }, 0);
      }
      return () => {
        tl.kill();
        if (open) {
          gsap.set(overlay, { opacity: 1 });
          gsap.set(drawer, shown);
        }
      };
    } else if (open) {
      tl.fromTo(
        panel,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.45, ease: "power2.out" },
      );
    } else {
      tl.to(panel, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
    }

    return () => {
      tl.kill();
    };
  }, [open, mounted, reducedMotion]);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel || !open) return;
      const activeTabFill = panel.querySelector<HTMLElement>(
        "[data-index-active-fill]",
      );
      // 首帧裁到右侧全隐，黑底与白字同步随 clip-path 擦入。
      gsap.set(activeTabFill, {
        clipPath: INDEX_TAB_CLIP_HIDDEN,
      });
      if (reducedMotion) {
        gsap.set(activeTabFill, { clipPath: INDEX_TAB_CLIP_VISIBLE });
        return;
      }
      if (activeTabFill) {
        gsap.to(activeTabFill, {
          clipPath: INDEX_TAB_CLIP_VISIBLE,
          duration: INDEX_TAB_WIPE_DURATION,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [open, reducedMotion] },
  );

  if (!mounted) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-[60] md:opacity-0 ${open ? "" : "pointer-events-none"}`}
      onClick={onClose}
    >
      <Image
        src={bgImg}
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="hidden object-cover md:block"
      />

      <h2 id={titleId} className="sr-only">
        {t("index.heading")}
      </h2>

      <MobileArchiveIndex
        activeScreenKey={activeScreenKey}
        onClose={onClose}
        onSelect={onSelect}
        overlayRef={mobileOverlayRef}
        drawerRef={mobileDrawerRef}
      />

      {/* 设计稿 1440×800 舞台：--su = 1 设计像素，随视口等比缩放；贴左对齐使档案图片始终靠视口最左 */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-start md:flex">
        <div className="relative aspect-[1440/800] h-full max-h-full w-auto max-w-full [--su:calc(min(100vw,180vh)/1440)]">
          {/* 透明底活页夹图（1050×800）锚定于舞台左上角，叠加在全屏背景图上 */}
          <div className="absolute left-0 top-0 h-full w-[72.917%]">
            <Image
              src={binderImg}
              alt=""
              fill
              priority
              unoptimized
              sizes="(min-width: 1440px) 1050px, 73vw"
              className="object-contain"
            />
          </div>

          <div
            aria-hidden="true"
            className="absolute left-[23.32%] top-[20.77%] h-[75.73%] w-[32.42%] text-grey-300"
          >
            <Image
              src="/archive-index/divider.svg"
              alt=""
              fill
              sizes="467px"
              className="object-fill"
            />
          </div>

          <div className="pointer-events-none absolute left-[23.77%] top-[21.97%] -rotate-[1.32deg]">
            <div className="flex gap-[calc(var(--su)*28)] whitespace-nowrap font-bodoni text-[length:calc(var(--su)*12)] uppercase leading-[calc(var(--su)*20)] text-grey-400">
              <div>
                <p>39.9042° N</p>
                <p>116.4074° E</p>
              </div>
              <p>China</p>
              <p>Beijing</p>
            </div>
          </div>

          <div className="pointer-events-none absolute left-[47.19%] top-[33.8%] flex h-[calc(var(--su)*188.3)] w-[calc(var(--su)*106.2)] items-center justify-center">
            <p className="rotate-[88.68deg] whitespace-nowrap font-bodoni text-[length:calc(var(--su)*40)] uppercase leading-[calc(var(--su)*51)] text-grey-400">
              Archive
              <br />
              Index
            </p>
          </div>

          <nav
            aria-label={t("index.nav")}
            data-index-interactive
            className="pointer-events-auto absolute left-[23.38%] top-[34.32%] -rotate-[1.32deg]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* 每行按内容宽度收紧，标题单行不换行，高亮黑条与箭头紧贴文字 */}
            <ul className="flex w-max flex-col gap-[calc(var(--su)*20)]">
              {ARCHIVE_INDEX_ITEMS.map((item) => (
                <li key={item.code}>
                  <IndexMenuItem
                    item={item}
                    active={item.screenKey === activeScreenKey}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <p
        ref={closeLabelRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-[61] hidden text-20 leading-normal text-grey-400 opacity-0 md:block ${
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

function MobileArchiveIndex({
  activeScreenKey,
  onClose,
  onSelect,
  overlayRef,
  drawerRef,
}: Pick<ArchiveIndexProps, "activeScreenKey" | "onClose" | "onSelect"> & {
  overlayRef: RefObject<HTMLDivElement | null>;
  drawerRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useLocale();

  return (
    <div className="absolute inset-0 md:hidden">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/30 opacity-0 backdrop-blur-[16px]"
      />
      <div
        ref={drawerRef}
        className="absolute inset-x-0 bottom-0 top-[67px] bg-white/90"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={t("nav.closeIndex")}
          onClick={onClose}
          className="absolute right-1 top-1 flex size-8 items-center justify-center focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="absolute h-px w-4 rotate-45 bg-grey-400"
          />
          <span
            aria-hidden="true"
            className="absolute h-px w-4 -rotate-45 bg-grey-400"
          />
        </button>

        <div className="absolute left-3 top-[68px] w-[calc(100%-24px)]">
          <div className="flex items-start justify-between">
            <p className="font-bodoni text-24 font-normal uppercase leading-normal text-grey-400">
              Archive
              <br />
              Index
            </p>
            <div className="flex items-center gap-1">
              <span aria-hidden="true" className="h-px w-[37px] bg-grey-200" />
              <p className="font-bodoni text-12 font-normal leading-normal text-grey-400">
                39.9042° N
                <br />
                116.4074° E
              </p>
            </div>
          </div>
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-[96px] h-px bg-grey-100"
          />
        </div>

        <nav
          aria-label={t("index.nav")}
          className="absolute left-3 right-3 top-[213px]"
        >
          <ul className="flex flex-col gap-9">
            {ARCHIVE_INDEX_ITEMS.map((item) => (
              <li key={item.code}>
                <MobileIndexMenuItem
                  item={item}
                  active={item.screenKey === activeScreenKey}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function MobileIndexMenuItem({
  item,
  active,
  onSelect,
}: IndexMenuItemProps) {
  const { t } = useLocale();
  const title = t(item.titleKey);

  return (
    <button
      type="button"
      onClick={() => onSelect(item.screenKey!)}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-7 w-full items-center justify-between px-0 py-1.5 text-14 leading-normal ${
        active ? "bg-grey-400 text-white" : "text-grey-300"
      } focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2`}
    >
      <span className="flex items-baseline gap-4">
        <span className="font-bodoni font-normal capitalize">
          ( {item.code} )
        </span>
        <span className="font-serif-sc font-normal">{title}</span>
      </span>
      {active && (
        <Image
          src="/archive-index/arrow.svg"
          alt=""
          width={15}
          height={15}
          className="size-4 shrink-0 brightness-0 invert"
        />
      )}
    </button>
  );
}

type IndexMenuItemProps = {
  item: ArchiveIndexItem;
  active: boolean;
  onSelect: (screenKey: string) => void;
};

function useIndexTabWipeFill() {
  const fillRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const animate = useCallback(
    (entering: boolean) => {
      const fill = fillRef.current;
      if (!fill) return;

      gsap.killTweensOf(fill);
      if (reducedMotion) {
        gsap.set(fill, {
          clipPath: entering
            ? INDEX_TAB_CLIP_VISIBLE
            : INDEX_TAB_CLIP_HIDDEN,
        });
        return;
      }

      gsap.to(fill, {
        clipPath: entering
          ? INDEX_TAB_CLIP_VISIBLE
          : INDEX_TAB_CLIP_HIDDEN,
        duration: INDEX_TAB_WIPE_DURATION,
        ease: "power2.out",
      });
    },
    [reducedMotion],
  );

  return {
    fillRef,
    onEnter: () => animate(true),
    onLeave: () => animate(false),
  };
}

function IndexMenuRow({
  code,
  title,
  showArrow,
}: {
  code: string;
  title: string;
  showArrow: boolean;
}) {
  return (
    <>
      <span className="flex items-baseline gap-[calc(var(--su)*16)]">
        <span className="shrink-0 font-bodoni font-normal capitalize">
          ( {code} )
        </span>
        <span className="whitespace-nowrap font-serif-sc font-light">
          {title}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`inline-flex size-[calc(var(--su)*24)] shrink-0 items-center justify-center ${
          showArrow ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src="/archive-index/arrow.svg"
          alt=""
          width={15}
          height={15}
          className="h-[calc(var(--su)*14.8)] w-[calc(var(--su)*15.4)] shrink-0 -rotate-45 brightness-0 invert"
        />
      </span>
    </>
  );
}

function IndexMenuItem({ item, active, onSelect }: IndexMenuItemProps) {
  const available = item.screenKey !== null;
  const { t } = useLocale();
  const {
    fillRef,
    onEnter: onDissolveEnter,
    onLeave: onDissolveLeave,
  } = useIndexTabWipeFill();
  const title = t(item.titleKey);

  const rowText =
    "text-[length:calc(var(--su)*14)] leading-[calc(var(--su)*20)] gap-[calc(var(--su)*16)]";

  if (!available) {
    return (
      <div
        className={`flex items-baseline text-grey-300 ${rowText}`}
        aria-disabled="true"
      >
        <span className="shrink-0 font-bodoni font-normal capitalize">
          ( {item.code} )
        </span>
        <span className="whitespace-nowrap font-serif-sc font-light">
          {title}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item.screenKey!)}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => {
        if (!active) onDissolveEnter();
      }}
      onMouseLeave={() => {
        if (!active) onDissolveLeave();
      }}
      onFocus={() => {
        if (!active) onDissolveEnter();
      }}
      onBlur={() => {
        if (!active) onDissolveLeave();
      }}
      className={`group relative flex w-full items-center justify-between text-grey-300 focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 ${rowText}`}
    >
      <IndexMenuRow code={item.code} title={title} showArrow={false} />
      {/* 黑底 + 白字副本：clip-path 从左擦入，擦到哪露到哪 */}
      <div
        ref={active ? undefined : fillRef}
        data-index-active-fill={active ? "" : undefined}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-between bg-grey-400 text-white"
        style={{ clipPath: INDEX_TAB_CLIP_HIDDEN }}
      >
        <IndexMenuRow code={item.code} title={title} showArrow />
      </div>
    </button>
  );
}
