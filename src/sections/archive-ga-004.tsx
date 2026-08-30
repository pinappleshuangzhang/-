"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  createArchiveGa004TitleSweep,
  slideInArchiveGa004Titles,
} from "@/animations/archive-ga-004-title-sweep";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import {
  CardGallery,
  type CardGalleryControls,
} from "@/components/ui/card-gallery";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useDissolveHoverFill } from "@/hooks/use-dissolve-hover-fill";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ARCHIVE_GA_004_CARDS } from "@/lib/archive-ga-003-cards";
import { SurveyDetails } from "@/sections/survey-details";

gsap.registerPlugin(useGSAP);

/**
 * 第五屏：档案 GA_004《视觉调查档案》
 * 长廊浏览作品；点击任一张卡片进入调查详情，详情顶部上滑返回长廊。
 */
export function ArchiveGa004() {
  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { registerScrollInterceptor, runWithCurtain } = useSectionPager();
  const galleryControlsRef = useRef<CardGalleryControls | null>(null);
  const detailsScrollRef = useRef<((deltaY: number) => boolean) | null>(null);
  const titlesRef = useRef<HTMLDivElement>(null);
  const galleryWrapRef = useRef<HTMLDivElement>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  /** hover 卡片对应的类目单词，替换 DESGIN / WORKS 角标大字 */
  const [titleWords, setTitleWords] = useState<[string, string] | null>(null);
  const { t } = useLocale();

  // 标题入场：先横穿滑出，再滑入定位；离屏后 revert，返回时重播。
  useGSAP(
    () => {
      const root = titlesRef.current;
      const gallery = galleryWrapRef.current;
      if (!root || !gallery) return;
      const design = root.querySelector<HTMLElement>("[data-title-design]");
      const works = root.querySelector<HTMLElement>("[data-title-works]");
      if (!design || !works) return;

      if (reducedMotion) {
        gsap.set([design, works, gallery], { x: 0 });
        return;
      }
      if (!isActive) return;
      createArchiveGa004TitleSweep(design, works, gallery);
    },
    {
      dependencies: [isActive, reducedMotion, detailsOpen],
      revertOnUpdate: true,
    },
  );

  // hover 换字：新文字从两侧屏外滑入（跳过首帧，入场动画自行处理）
  const titleSwapReadyRef = useRef(false);
  useGSAP(
    () => {
      if (!titleSwapReadyRef.current) {
        titleSwapReadyRef.current = true;
        return;
      }
      const root = titlesRef.current;
      if (!root || reducedMotion || !isActive) return;
      const design = root.querySelector<HTMLElement>("[data-title-design]");
      const works = root.querySelector<HTMLElement>("[data-title-works]");
      if (!design || !works) return;
      slideInArchiveGa004Titles(design, works);
    },
    { dependencies: [titleWords] },
  );

  // 离开此屏时复位详情与角标大字，返回时回到长廊初始状态（DESGIN / WORKS）
  useEffect(() => {
    if (isActive) return;
    const frame = window.requestAnimationFrame(() => {
      setDetailsOpen(false);
      setTitleWords(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isActive]);

  const openDetails = useCallback(() => {
    window.history.pushState({ surveyDetails: true }, "");
    if (reducedMotion) {
      setDetailsOpen(true);
      return;
    }
    runWithCurtain(() => setDetailsOpen(true));
  }, [reducedMotion, runWithCurtain]);

  // 组件内主动返回（如 Escape）：回退历史，由 popstate 统一关闭详情
  const closeDetails = useCallback(() => {
    window.history.back();
  }, []);

  // 浏览器返回键：从详情退回长廊
  useEffect(() => {
    if (!detailsOpen) return;
    const onPopState = () => {
      if (reducedMotion) {
        setDetailsOpen(false);
        return;
      }
      runWithCurtain(() => setDetailsOpen(false));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [detailsOpen, reducedMotion, runWithCurtain]);

  useEffect(() => {
    if (!isActive) return;

    return registerScrollInterceptor((deltaY) => {
      if (detailsOpen) {
        // 详情页内只滚动内容，滚到顶/底也不切屏、不返回长廊
        detailsScrollRef.current?.(deltaY);
        return true;
      }
      return false;
    });
  }, [isActive, detailsOpen, registerScrollInterceptor]);

  return (
    <ScreenShell
      aria-label={
        detailsOpen ? t("ga004.detailAria") : t("ga004.aria")
      }
    >
      {detailsOpen ? (
        <SurveyDetails
          scrollHandlerRef={detailsScrollRef}
          onBack={closeDetails}
        />
      ) : (
        <>
          <div
            ref={titlesRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-grey-400"
          >
            <div
              data-title-design
              className="absolute left-[20px] top-[64px] origin-top-left whitespace-nowrap font-bodoni text-60 uppercase [transform:scale(1.433)]"
            >
              {titleWords?.[0] ?? "DESGIN"}
            </div>
            <div
              data-title-works
              className="absolute bottom-[0px] right-[20px] origin-bottom-right whitespace-nowrap font-bodoni text-60 uppercase [transform:scale(1.433)]"
            >
              {titleWords?.[1] ?? "WORKS"}
            </div>
          </div>
          <div ref={galleryWrapRef} className="relative top-[20px] z-10 h-full">
            <CardGallery
              cards={ARCHIVE_GA_004_CARDS}
              reducedMotion={reducedMotion}
              interactionMode="buttons"
              controlsRef={galleryControlsRef}
              onSelect={openDetails}
              onHoverCard={(card) => setTitleWords(card?.titleWords ?? null)}
            />
            <GalleryNavButton
              direction="prev"
              className="left-[20px] top-1/2 -translate-y-1/2"
              onClick={() => galleryControlsRef.current?.prev()}
            />
            <GalleryNavButton
              direction="next"
              className="right-[20px] top-1/2 -translate-y-1/2"
              onClick={() => galleryControlsRef.current?.next()}
            />
          </div>
        </>
      )}
    </ScreenShell>
  );
}

type GalleryNavButtonProps = {
  direction: "prev" | "next";
  className: string;
  onClick: () => void;
};

function GalleryNavButton({
  direction,
  className,
  onClick,
}: GalleryNavButtonProps) {
  const { t } = useLocale();
  const isPrev = direction === "prev";
  const {
    fillRef,
    onMouseEnter: onDissolveEnter,
    onMouseLeave: onDissolveLeave,
  } = useDissolveHoverFill();

  return (
    <button
      type="button"
      aria-label={isPrev ? t("gallery.prev") : t("gallery.next")}
      onClick={onClick}
      onMouseEnter={onDissolveEnter}
      onMouseLeave={onDissolveLeave}
      className={`absolute z-20 flex size-[44px] items-center justify-center rounded-rs-4 border border-white/70 bg-white/40 backdrop-blur-[1.5px] shadow-[0px_2px_1.5px_rgba(92,92,92,0.10),0px_6px_3px_rgba(92,92,92,0.09),1px_14px_4px_rgba(92,92,92,0.05),1px_25px_5px_rgba(92,92,92,0.01)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 ${className}`}
    >
      <div
        ref={fillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2px] rounded-rs-2 bg-white opacity-0"
      />
      <Image
        src="/archive-ga-004/icon-arrow.svg"
        alt=""
        width={18}
        height={18}
        className={`relative z-10 size-[18px] opacity-85 brightness-0 ${isPrev ? "rotate-180" : ""}`}
      />
    </button>
  );
}
