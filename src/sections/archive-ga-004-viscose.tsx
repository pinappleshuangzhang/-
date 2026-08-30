"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { ViscoseCarousel } from "@/components/ui/viscose-carousel";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { VISCOSE_CAROUSEL_ITEMS } from "@/lib/viscose-carousel-items";
import { SurveyDetails } from "@/sections/survey-details";

type CarouselScrollHandler = (deltaY: number) => boolean;

/** 完整 Viscose Carousel 第五屏；旧 ArchiveGa004 保留但不挂载。 */
export function ArchiveGa004Viscose() {
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { phase, registerScrollInterceptor, runWithCurtain } = useSectionPager();
  const detailsScrollRef = useRef<((deltaY: number) => boolean) | null>(null);
  const carouselScrollRef = useRef<CarouselScrollHandler | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (isActive) return;
    const frame = window.requestAnimationFrame(() => setDetailsOpen(false));
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

  const closeDetails = useCallback(() => {
    window.history.back();
  }, []);

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
        detailsScrollRef.current?.(deltaY);
        return true;
      }
      return carouselScrollRef.current?.(deltaY) ?? false;
    });
  }, [detailsOpen, isActive, registerScrollInterceptor]);

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
        <ViscoseCarousel
          items={VISCOSE_CAROUSEL_ITEMS}
          active={isActive && phase === "idle"}
          reducedMotion={reducedMotion}
          onSelect={openDetails}
          scrollHandlerRef={carouselScrollRef}
        />
      )}
    </ScreenShell>
  );
}
