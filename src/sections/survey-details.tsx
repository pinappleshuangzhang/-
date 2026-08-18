"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import Image from "next/image";
import {
  SURVEY_CATEGORIES,
  SURVEY_G_001,
  type SurveyWork,
} from "@/lib/survey-details";
import { useLocale } from "@/components/providers/locale-provider";

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
 * 页内滚动由分屏拦截器驱动；滚到顶部再上滑、或按 Escape 返回长廊。
 */
export function SurveyDetails({
  work = SURVEY_G_001,
  scrollHandlerRef,
  onBack,
}: SurveyDetailsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

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
      const consumed = consumeScroll(delta);
      if (consumed === false && delta < 0) onBack();
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
          <h1 className="whitespace-nowrap font-bodoni text-60 font-normal uppercase leading-none text-grey-400">
            {work.title}
          </h1>
          <div className="flex flex-col items-end justify-center gap-2">
            <div className="flex w-[180px] items-center justify-end gap-1">
              <div className="h-px min-w-px flex-1 bg-grey-400" aria-hidden="true" />
              <p className="whitespace-nowrap font-bodoni text-20 capitalize leading-normal text-grey-400">
                {work.typeLabel}
              </p>
            </div>
            <p className="whitespace-nowrap font-bodoni text-20 uppercase leading-normal text-grey-400">
              {work.archivedLabel}
            </p>
          </div>
        </header>

        <div className="h-px w-full bg-grey-100" aria-hidden="true" />

        <div className="flex items-start justify-between">
          <CategoryList activeCode={work.activeCategory} />
          <WorkContent work={work} />
        </div>
      </div>
    </div>
  );
}

function CategoryList({
  activeCode,
}: {
  activeCode: SurveyWork["activeCategory"];
}) {
  const { t } = useLocale();

  return (
    <nav aria-label={t("survey.categoryNav")}>
      <ul className="flex w-[330px] flex-col gap-6">
        {SURVEY_CATEGORIES.map((item) => {
          const active = item.code === activeCode;
          return (
            <li key={item.code}>
              <div
                aria-current={active ? "true" : undefined}
                className={
                  active
                    ? "flex w-fit items-center gap-7 rounded-rs-4 bg-grey-400 py-1"
                    : "flex w-full items-center gap-7 font-bodoni text-20 capitalize leading-normal text-grey-300"
                }
              >
                <span
                  className={
                    active
                      ? "whitespace-nowrap font-bodoni text-20 capitalize leading-normal text-white"
                      : "whitespace-nowrap"
                  }
                >
                  {item.letter}
                </span>
                {active ? (
                  <span className="flex items-center gap-3">
                    <span className="whitespace-nowrap font-bodoni text-20 font-medium capitalize leading-normal text-white">
                      {item.label}
                    </span>
                    <span className="relative flex size-7 shrink-0 items-center justify-center">
                      <Image
                        src="/archive-ga-004/icon-arrow.svg"
                        alt=""
                        width={19}
                        height={18}
                        className="h-[18px] w-[19px] rotate-180"
                      />
                    </span>
                  </span>
                ) : (
                  <span className="w-[250px]">{item.label}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
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
