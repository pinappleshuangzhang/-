"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import Image from "next/image";
import { SurveyCategoryNav } from "@/components/ui/survey-category-nav";
import { useLocale } from "@/components/providers/locale-provider";
import {
  SURVEY_CATEGORY_BY_CODE,
  SURVEY_G_001,
  SURVEY_WORK_BY_CATEGORY,
  type SurveyCategoryCode,
  type SurveyWork,
} from "@/lib/survey-details";

const KEY_SCROLL_DELTA = 120;
const PAGE_SCROLL_DELTA = 240;

type SurveyDetailsProps = {
  work?: SurveyWork;
  /** 详情区滚轮消费函数，供分屏拦截器调用 */
  scrollHandlerRef: MutableRefObject<((deltaY: number) => boolean) | null>;
  onBack: () => void;
};

/**
 * 档案 GA_004 作品详情（Figma 566:607）。
 * 页内滚动由分屏拦截器驱动；浏览器返回键或 Escape 返回长廊。
 */
export function SurveyDetails({
  work = SURVEY_G_001,
  scrollHandlerRef,
  onBack,
}: SurveyDetailsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const [activeCode, setActiveCode] = useState<SurveyCategoryCode>(
    work.activeCategory,
  );
  const activeCategory = SURVEY_CATEGORY_BY_CODE[activeCode];
  const activeWork = SURVEY_WORK_BY_CATEGORY[activeCode];

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollTop = 0;
      scroller.focus();
    }

    const consumeScroll = (deltaY: number) => {
      const el = scrollerRef.current;
      if (!el) return true;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if (deltaY < 0 && atTop) return false;
      if (deltaY > 0 && atBottom) return true;
      el.scrollTop += deltaY;
      return true;
    };

    scrollHandlerRef.current = consumeScroll;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key === "Escape") {
        if (document.querySelector('[role="dialog"]')) return;
        event.preventDefault();
        onBack();
        return;
      }

      let delta = 0;
      switch (event.key) {
        case "ArrowDown":
          delta = KEY_SCROLL_DELTA;
          break;
        case "PageDown":
          delta = PAGE_SCROLL_DELTA;
          break;
        case " ":
          delta = event.shiftKey ? -KEY_SCROLL_DELTA : KEY_SCROLL_DELTA;
          break;
        case "ArrowUp":
          delta = -KEY_SCROLL_DELTA;
          break;
        case "PageUp":
          delta = -PAGE_SCROLL_DELTA;
          break;
        default:
          return;
      }

      event.preventDefault();
      event.stopPropagation();
      consumeScroll(delta);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      scrollHandlerRef.current = null;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onBack, scrollHandlerRef]);

  return (
    <div
      ref={scrollerRef}
      tabIndex={-1}
      className="h-full overflow-y-auto overscroll-contain px-[30px] focus-visible:outline-none"
      aria-label={t("survey.detailAria")}
    >
      <div className="mt-[30px] h-[34px] shrink-0" aria-hidden="true" />
      <div className="mt-18 flex flex-col gap-14 pb-18">
        <header className="flex items-center justify-between">
          <h1 className="min-h-[60px] whitespace-nowrap font-bodoni text-60 font-normal uppercase leading-none text-grey-400">
            {`Survey Details_G_${activeCode}`}
          </h1>
          <div className="flex flex-col items-end justify-center gap-2">
            <div className="flex w-[180px] items-center justify-end gap-1">
              <div className="h-px min-w-px flex-1 bg-grey-400" aria-hidden="true" />
              <p className="whitespace-nowrap font-bodoni text-20 capitalize leading-normal text-grey-400">
                {activeCategory.typeLabel}
              </p>
            </div>
            {activeWork ? (
              <p className="whitespace-nowrap font-bodoni text-20 uppercase leading-normal text-grey-400">
                {activeWork.archivedLabel}
              </p>
            ) : null}
          </div>
        </header>

        <div className="h-px w-full bg-grey-100" aria-hidden="true" />

        <div className="flex items-start justify-between">
          <SurveyCategoryNav
            activeCode={activeCode}
            aria-label={t("survey.categoryNav")}
            onSelect={(code) => {
              if (code === activeCode) return;
              setActiveCode(code);
              const el = scrollerRef.current;
              if (el) el.scrollTop = 0;
            }}
          />
          {activeWork ? (
            <WorkContent work={activeWork} />
          ) : (
            <div className="w-[757px]" aria-live="polite">
              <p className="sr-only">{t("survey.emptyWork")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkContent({ work }: { work: SurveyWork }) {
  const { t } = useLocale();
  const duration =
    work.duration === SURVEY_G_001.duration
      ? t("survey.duration")
      : work.duration;
  const description =
    work.description === SURVEY_G_001.description
      ? t("survey.description")
      : work.description;
  const heroAlt =
    work.hero.alt === SURVEY_G_001.hero.alt
      ? t("survey.heroAlt")
      : work.hero.alt;
  const billboardAlt =
    work.billboard.alt === SURVEY_G_001.billboard.alt
      ? t("survey.billboardAlt")
      : work.billboard.alt;

  return (
    <div className="flex w-[757px] flex-col gap-18">
      <div className="flex w-full flex-col gap-6">
        <div className="relative w-full overflow-hidden">
          <Image
            src={work.hero.src}
            alt={heroAlt}
            width={work.hero.width}
            height={work.hero.height}
            sizes="757px"
            className="h-auto w-full"
          />
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-fit items-center justify-center gap-0.5 rounded-rs-4 border border-grey-400 px-1 py-0.5">
            <Image
              src="/archive-ga-004/icon-time.svg"
              alt=""
              width={21}
              height={21}
              className="size-[21px]"
            />
            <p className="whitespace-nowrap font-serif-sc text-14 capitalize leading-normal text-grey-400">
              {duration}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="whitespace-nowrap font-serif-sc text-20 font-medium capitalize leading-normal text-grey-400">
              {work.projectTitle}
            </p>
            <p className="font-serif-sc text-14 capitalize leading-[28px] text-grey-300">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="relative w-full overflow-hidden">
        <Image
          src={work.billboard.src}
          alt={billboardAlt}
          width={work.billboard.width}
          height={work.billboard.height}
          sizes="757px"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
