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

/** 小于 1px 视为触控板抖动，不单独触发进第三阶段 */
const WHEEL_JITTER_PX = 1;
/** 吃掉同一次下滑的后续惯性，避免连触或滑完又切屏 */
const GESTURE_LOCK_MS = 500;
const GESTURE_GAP_MS = 200;

function normalizeWheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * (100 / 6);
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/** 完整 Viscose Carousel 第五屏；点击卡片从右侧滑出作品详情抽屉。 */
export function ArchiveGa004Viscose() {
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { phase, registerScrollInterceptor } = useSectionPager();
  // 首次 idle 后记住：回切时幕布揭开阶段就要露出终态，不能再等 idle 或重播入场
  const [introSettled, setIntroSettled] = useState(false);
  if (isActive && phase === "idle" && !introSettled) {
    setIntroSettled(true);
  }
  const carouselActive = isActive && (introSettled || phase === "idle");
  const detailsScrollRef = useRef<((deltaY: number) => boolean) | null>(null);
  const carouselScrollRef = useRef<CarouselScrollHandler | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCode, setDetailsCode] = useState<SurveyCategoryCode>("C");
  const [coverPresent, setCoverPresent] = useState(false);
  const { t } = useLocale();

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

  // 早于分页器的 document capture：第二阶段第一下下滑就进第三阶段，
  // 不等 8px / 200ms 累计。同一手势的惯性在这里吞掉。
  useEffect(() => {
    if (!isActive || detailsOpen) return;
    let gestureActive = false;
    let gestureUntil = 0;
    let lastWheelAt = 0;

    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      if (gestureActive) {
        const gap = now - lastWheelAt;
        if (gap < GESTURE_GAP_MS || now < gestureUntil) {
          lastWheelAt = now;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        gestureActive = false;
      }

      const deltaY = normalizeWheelDeltaY(event);
      if (deltaY < WHEEL_JITTER_PX) return;

      const consumed = carouselScrollRef.current?.(deltaY) ?? false;
      if (!consumed) return;

      gestureActive = true;
      gestureUntil = now + GESTURE_LOCK_MS;
      lastWheelAt = now;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [detailsOpen, isActive]);

  return (
    <ScreenShell
      className="overflow-x-clip"
      aria-label={
        detailsOpen ? t("ga004.detailAria") : t("ga004.aria")
      }
    >
      {/* 抽屉打开时不再模糊长廊（blur 全屏合成太重），由抽屉遮罩压暗背景 */}
      <ViscoseCarousel
        items={VISCOSE_CAROUSEL_ITEMS}
        active={carouselActive}
        paused={coverPresent}
        reducedMotion={reducedMotion}
        onSelect={openDetails}
        scrollHandlerRef={carouselScrollRef}
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
