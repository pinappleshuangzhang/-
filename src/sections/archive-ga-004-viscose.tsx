"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurveyDrawer } from "@/components/ui/survey-drawer";
import { ViscoseCarousel } from "@/components/ui/viscose-carousel";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { surveyCodeFromCarouselIndex, type SurveyCategoryCode } from "@/lib/survey-details";
import { VISCOSE_CAROUSEL_ITEMS } from "@/lib/viscose-carousel-items";

type CarouselScrollHandler = (deltaY: number) => boolean;

/** 完整 Viscose Carousel 第五屏；点击卡片从右侧滑出作品详情抽屉。 */
export function ArchiveGa004Viscose() {
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { phase, registerScrollInterceptor } = useSectionPager();
  const detailsScrollRef = useRef<((deltaY: number) => boolean) | null>(null);
  const carouselScrollRef = useRef<CarouselScrollHandler | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCode, setDetailsCode] = useState<SurveyCategoryCode>("C");
  const [coverPresent, setCoverPresent] = useState(false);
  const { t } = useLocale();
  const blurCarousel = !reducedMotion && coverPresent;

  useEffect(() => {
    if (isActive) return;
    const frame = window.requestAnimationFrame(() => setDetailsOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isActive]);

  const openDetails = useCallback((index: number) => {
    setDetailsCode(surveyCodeFromCarouselIndex(index));
    setDetailsOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    return registerScrollInterceptor((deltaY) => {
      if (detailsOpen) {
        detailsScrollRef.current?.(deltaY);
        return true;
      }
      return carouselScrollRef.current?.(deltaY) ?? false;
    });
  }, [detailsOpen, isActive, registerScrollInterceptor]);

  return (
    <ScreenShell
      className="overflow-x-clip"
      aria-label={
        detailsOpen ? t("ga004.detailAria") : t("ga004.aria")
      }
    >
      {/* 第五屏长廊是 WebGL canvas，backdrop-filter 采不到它；
          抽屉打开时对长廊层做 32px 模糊，效果对齐第四屏毛玻璃。 */}
      <ViscoseCarousel
        items={VISCOSE_CAROUSEL_ITEMS}
        active={isActive && phase === "idle"}
        paused={coverPresent}
        reducedMotion={reducedMotion}
        onSelect={openDetails}
        scrollHandlerRef={carouselScrollRef}
        className={blurCarousel ? "blur-[32px]" : undefined}
      />
      <SurveyDrawer
        open={detailsOpen}
        initialCode={detailsCode}
        scrollHandlerRef={detailsScrollRef}
        onPresenceChange={setCoverPresent}
        onClose={closeDetails}
      />
    </ScreenShell>
  );
}
