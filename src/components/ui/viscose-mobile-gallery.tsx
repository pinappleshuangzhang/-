"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  ViscoseMobileStage,
  type ViscoseMobileStageHandle,
  type ViscoseMobileWork,
} from "@/components/ui/viscose-mobile-stage";
import {
  SURVEY_CATEGORIES,
  SURVEY_G_001,
  SURVEY_WORK_BY_CATEGORY,
} from "@/lib/survey-details";
import type { ViscoseCarouselItem } from "@/lib/viscose-carousel-items";

/** 与桌面入场种子一致：Website Interface */
const INITIAL_INDEX = 2;
/** Figma 947-3937：365.5 宽 / 390 画板，顶边 305px */
const CARD_WIDTH = "calc(100vw * 365.5 / 390)";
const CARD_TOP = 305;

type ViscoseMobileGalleryProps = {
  items: ViscoseCarouselItem[];
  active: boolean;
  onSelect: (index: number) => void;
};

function useMobileWorks(items: ViscoseCarouselItem[]): ViscoseMobileWork[] {
  const { t } = useLocale();
  return SURVEY_CATEGORIES.map((category, index) => {
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
  });
}

/**
 * 第五屏移动端只保留第三阶段：静态大图 + 文案层。
 * 不导入 carousel / Three.js。
 */
export function ViscoseMobileGallery({
  items,
  active,
  onSelect,
}: ViscoseMobileGalleryProps) {
  const { t } = useLocale();
  const stageRef = useRef<ViscoseMobileStageHandle>(null);
  const [index, setIndex] = useState(INITIAL_INDEX);
  const works = useMobileWorks(items);
  const item = items[index];

  useEffect(() => {
    if (!active) {
      stageRef.current?.hide();
      return;
    }
    stageRef.current?.reveal();
  }, [active]);

  if (!item) return null;

  const categoryLabels = [
    t("gallery.category.brand"),
    t("gallery.category.product"),
    t("gallery.category.website"),
    t("gallery.category.visual"),
    t("gallery.category.motion"),
  ];

  return (
    <div className="absolute inset-0 isolate overflow-hidden md:hidden">
      <button
        type="button"
        onClick={() => onSelect(index)}
        className="absolute left-1/2 z-10 -translate-x-1/2 overflow-hidden rounded-rs-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
        style={{ top: CARD_TOP, width: CARD_WIDTH, aspectRatio: "1.6 / 1" }}
        aria-label={item.alt}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="94vw"
          className="object-cover"
        />
      </button>
      <ViscoseMobileStage
        ref={stageRef}
        active={index}
        heading={t("gallery.mobile.heading")}
        categoryLabels={categoryLabels}
        works={works}
        viewDetailsLabel={t("gallery.mobile.viewDetails")}
        onPickCategory={setIndex}
        onViewDetails={onSelect}
      />
    </div>
  );
}
