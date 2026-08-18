"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createArchiveGa004TitleSweep } from "@/animations/archive-ga-004-title-sweep";
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

  useEffect(() => {
    if (!isActive || !detailsOpen) return;
    const frame = window.requestAnimationFrame(() => setDetailsOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isActive, detailsOpen]);

  const openDetails = useCallback(() => {
    if (reducedMotion) {
      setDetailsOpen(true);
      return;
    }
    runWithCurtain(() => setDetailsOpen(true));
  }, [reducedMotion, runWithCurtain]);

  const closeDetails = useCallback(() => {
    if (reducedMotion) {
      setDetailsOpen(false);
      return;
    }
    runWithCurtain(() => setDetailsOpen(false));
  }, [reducedMotion, runWithCurtain]);

  useEffect(() => {
    if (!isActive) return;

    return registerScrollInterceptor((deltaY) => {
      if (detailsOpen) {
        const consumed = detailsScrollRef.current?.(deltaY);
        if (consumed === false && deltaY < 0) {
          closeDetails();
          return true;
        }
        return consumed ?? true;
      }
      return false;
    });
  }, [
    isActive,
    detailsOpen,
    registerScrollInterceptor,
    closeDetails,
  ]);

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
              className="absolute left-[30px] top-[74px] origin-top-left font-bodoni text-60 uppercase [transform:scale(1.67)]"
            >
              DESGIN
            </div>
            <div
              data-title-works
              className="absolute bottom-[0px] right-[30px] origin-bottom-right font-bodoni text-60 uppercase [transform:scale(1.67)]"
            >
              WORKS
            </div>
          </div>
          <div ref={galleryWrapRef} className="relative z-10 h-full">
            <CardGallery
              cards={ARCHIVE_GA_004_CARDS}
              reducedMotion={reducedMotion}
              interactionMode="buttons"
              controlsRef={galleryControlsRef}
              onSelect={openDetails}
            />
            <GalleryNavButton
              direction="prev"
              className="left-[30px] top-1/2 -translate-y-1/2"
              onClick={() => galleryControlsRef.current?.prev()}
            />
            <GalleryNavButton
              direction="next"
              className="right-[30px] top-1/2 -translate-y-1/2"
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

  return (
    <button
      type="button"
      aria-label={isPrev ? t("gallery.prev") : t("gallery.next")}
      onClick={onClick}
      className={`absolute z-20 flex size-[44px] items-center justify-center rounded-rs-4 border border-white/55 bg-white/18 shadow-[0_8px_24px_rgba(255,255,255,0.18)] backdrop-blur-[10px] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 ${className}`}
    >
      <Image
        src="/archive-ga-004/icon-arrow.svg"
        alt=""
        width={18}
        height={18}
        className={`opacity-85 brightness-0 ${isPrev ? "rotate-180" : ""}`}
      />
    </button>
  );
}
