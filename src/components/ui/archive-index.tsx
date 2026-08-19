"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ARCHIVE_INDEX_ITEMS,
  type ArchiveIndexItem,
} from "@/lib/archive-index-items";
import { useLocale } from "@/components/providers/locale-provider";
import { useDissolveHoverFill } from "@/hooks/use-dissolve-hover-fill";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import binderImg from "../../../public/archive-index/binder.webp";
import bgImg from "../../../public/archive-index/bg.webp";

gsap.registerPlugin(useGSAP);

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
  const reducedMotion = useReducedMotion();
  const { t } = useLocale();

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

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel || !open) return;
      if (reducedMotion) {
        gsap.set(panel, { autoAlpha: 1 });
        return;
      }
      gsap.fromTo(
        panel,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.45, ease: "power2.out" },
      );
    },
    { dependencies: [open, reducedMotion] },
  );

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] opacity-0"
    >
      <Image
        src={bgImg}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <h2 id={titleId} className="sr-only">
        {t("index.heading")}
      </h2>

      {/* 设计稿 1440×800 舞台：--su = 1 设计像素，随视口等比缩放；贴左对齐使档案图片始终靠视口最左 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-start">
        <div className="relative aspect-[1440/800] h-full max-h-full w-auto max-w-full [--su:calc(min(100vw,180vh)/1440)]">
          {/* 透明底活页夹图（1050×800）锚定于舞台左上角，叠加在全屏背景图上 */}
          <div className="absolute left-0 top-0 h-full w-[72.917%]">
            <Image
              src={binderImg}
              alt=""
              fill
              priority
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
            className="pointer-events-auto absolute left-[23.38%] top-[34.32%] -rotate-[1.32deg]"
          >
            <ul className="flex w-[calc(var(--su)*267)] flex-col gap-[calc(var(--su)*20)]">
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
    </div>
  );
}

type IndexMenuItemProps = {
  item: ArchiveIndexItem;
  active: boolean;
  onSelect: (screenKey: string) => void;
};

function IndexMenuItem({ item, active, onSelect }: IndexMenuItemProps) {
  const available = item.screenKey !== null;
  const { t } = useLocale();
  const {
    fillRef,
    onMouseEnter: onDissolveEnter,
    onMouseLeave: onDissolveLeave,
  } = useDissolveHoverFill();
  const title = t(item.titleKey);

  const rowText =
    "text-[length:calc(var(--su)*14)] leading-normal gap-[calc(var(--su)*16)]";

  if (!available) {
    return (
      <div
        className={`flex items-center rounded-rs-4 text-grey-300 ${rowText}`}
        aria-disabled="true"
      >
        <span className="shrink-0 font-bodoni font-normal capitalize">
          ( {item.code} )
        </span>
        <span className="font-serif-sc font-normal uppercase">{title}</span>
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
      className={`group relative flex w-full items-center justify-between overflow-hidden rounded-rs-4 focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 ${rowText} ${
        active
          ? "bg-grey-400 text-white"
          : "text-grey-300 transition-colors duration-[600ms] hover:text-white focus-visible:text-white motion-reduce:transition-none"
      }`}
    >
      {!active && (
        <div
          ref={fillRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-grey-400 opacity-0"
        />
      )}
      <span className="relative z-10 flex items-center gap-[calc(var(--su)*16)]">
        <span className="shrink-0 font-bodoni font-normal capitalize">
          ( {item.code} )
        </span>
        <span className="font-serif-sc font-normal uppercase">{title}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 inline-flex size-[calc(var(--su)*24)] shrink-0 items-center justify-center transition-opacity duration-[600ms] motion-reduce:transition-none ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
      >
        <Image
          src="/archive-index/arrow.png"
          alt=""
          width={48}
          height={48}
          className="size-full shrink-0 object-contain"
        />
      </span>
    </button>
  );
}
