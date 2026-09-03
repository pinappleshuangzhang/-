"use client";

import Image from "next/image";
import type { MutableRefObject } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import type { ViscoseMobileWork } from "@/components/ui/viscose-mobile-stage";
import {
  SURVEY_CATEGORIES,
  SURVEY_G_001,
  SURVEY_WORK_BY_CATEGORY,
} from "@/lib/survey-details";
import type { ViscoseCarouselItem } from "@/lib/viscose-carousel-items";
import Carousel from "@/vendor/viscose/carousel";

type ViscoseCarouselProps = {
  items: ViscoseCarouselItem[];
  active: boolean;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  scrollHandlerRef: MutableRefObject<
    ((deltaY: number) => boolean) | null
  >;
  /** 抽屉打开时暂停渲染，避免模糊长廊抢 GPU 导致抽屉滚动卡顿 */
  paused?: boolean;
  className?: string;
};

export function ViscoseCarousel({
  items,
  active,
  reducedMotion,
  onSelect,
  scrollHandlerRef,
  paused = false,
  className,
}: ViscoseCarouselProps) {
  const { locale, t } = useLocale();
  const categoryLabels = [
    t("gallery.category.brand"),
    t("gallery.category.product"),
    t("gallery.category.website"),
    t("gallery.category.visual"),
    t("gallery.category.motion"),
  ];
  // 移动端第三阶段文字块：有详情的类型取作品标题与简介，其余先用卡片标题占位
  const mobileWorks: ViscoseMobileWork[] = SURVEY_CATEGORIES.map(
    (category, index) => {
      const work = SURVEY_WORK_BY_CATEGORY[category.code];
      if (!work) {
        return { title: items[index]?.title ?? "", description: "" };
      }
      return {
        title: work.projectTitle,
        description:
          work.description === SURVEY_G_001.description
            ? t("survey.description")
            : work.description,
      };
    },
  );

  if (reducedMotion) {
    return (
      <div
        role="list"
        aria-label={t("gallery.list")}
        className="absolute inset-x-[20px] top-1/2 flex -translate-y-1/2 gap-8 overflow-x-auto py-8"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(index)}
            className="relative aspect-[242/136] w-[242px] shrink-0 overflow-hidden rounded-rs-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="242px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    );
  }

  if (!active) return null;

  return (
    <div
      className={`absolute inset-0 isolate overflow-hidden ${className ?? ""}`}
    >
      <Carousel
        onSelect={onSelect}
        scrollHandlerRef={scrollHandlerRef}
        paused={paused}
        cursorLabel={t("gallery.view")}
        categoryLabels={categoryLabels}
        mobileHeading={t("gallery.mobile.heading")}
        mobileViewDetails={t("gallery.mobile.viewDetails")}
        mobileWorks={mobileWorks}
        categoryFontClass={
          locale === "zh" ? "font-serif-sc" : "font-bodoni"
        }
        nameFont={locale === "zh" ? "Noto Serif SC" : "Libre Bodoni"}
      />
    </div>
  );
}
