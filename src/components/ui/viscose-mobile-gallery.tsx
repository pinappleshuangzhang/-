"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  ViscoseMobileStage,
  type ViscoseMobileStageHandle,
} from "@/components/ui/viscose-mobile-stage";
import type { ViscoseMobileCard } from "@/components/ui/viscose-mobile-work-grid";
import {
  SURVEY_CATEGORIES,
  SURVEY_WORK_BY_CATEGORY,
} from "@/lib/survey-details";
import type { ViscoseCarouselItem } from "@/lib/viscose-carousel-items";

/** chip 0 = 全部项目，1–4 = 网站 / 品牌 / 创意 / 动态；进入作品屏默认全部项目 */
const INITIAL_TAB = 0;

/**
 * 作品归属（categoryIndex：0 苹果时刻 / 1 未来创意 / 2 Easycash）：
 * 1 网站设计：苹果时刻、Easycash
 * 2 品牌设计：苹果时刻、未来创意、Easycash
 * 3 创意设计：苹果时刻、未来创意、Easycash
 * 4 动态设计：苹果时刻、未来创意
 */
const MOBILE_TAB_WORKS: readonly number[][] = [
  [0, 1, 2],
  [0, 2],
  [0, 1, 2],
  [0, 1, 2],
  [0, 1],
];

type ViscoseMobileGalleryProps = {
  items: ViscoseCarouselItem[];
  active: boolean;
  onSelect: (index: number) => void;
};

function useMobileCards(items: ViscoseCarouselItem[]): ViscoseMobileCard[] {
  const { t } = useLocale();
  return items.map((item, categoryIndex) => {
    const category = SURVEY_CATEGORIES[categoryIndex];
    const work = category ? SURVEY_WORK_BY_CATEGORY[category.code] : null;
    return {
      title: work ? t(work.titleKey) : item.title,
      description: work ? t(work.descriptionKey) : "",
      src: item.src,
      alt: item.alt,
      categoryIndex,
    };
  });
}

/**
 * 第五屏移动端只保留第三阶段。
 * 一类一件：大图+全文案（Figma 1183:525）；多件或「全部项目」：两列小卡（1269:1720）。
 */
export function ViscoseMobileGallery({
  items,
  active,
  onSelect,
}: ViscoseMobileGalleryProps) {
  const { t } = useLocale();
  const stageRef = useRef<ViscoseMobileStageHandle>(null);
  const settledRef = useRef(false);
  const [tab, setTab] = useState(INITIAL_TAB);
  // 重新进入第五屏时回到默认类型（渲染期间同步，避免 effect 里 setState）
  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setTab(INITIAL_TAB);
  }
  const allCards = useMobileCards(items);

  const cards = useMemo(() => {
    const indexes = MOBILE_TAB_WORKS[tab] ?? MOBILE_TAB_WORKS[0];
    return indexes
      .map((index) => allCards[index])
      .filter((card): card is ViscoseMobileCard => card !== undefined);
  }, [allCards, tab]);

  useEffect(() => {
    if (!active) {
      if (!settledRef.current) stageRef.current?.hide();
      return;
    }
    if (settledRef.current) return;
    settledRef.current = true;
    stageRef.current?.reveal();
  }, [active]);

  const categoryLabels = [
    t("gallery.mobile.category.all"),
    t("gallery.mobile.category.website"),
    t("gallery.mobile.category.brand"),
    t("gallery.mobile.category.creative"),
    t("gallery.mobile.category.motion"),
  ];

  return (
    <div className="absolute inset-0 isolate overflow-hidden md:hidden">
      <ViscoseMobileStage
        ref={stageRef}
        tab={tab}
        cards={cards}
        heading={t("gallery.mobile.heading")}
        categoryLabels={categoryLabels}
        viewDetailsLabel={t("gallery.mobile.viewDetails")}
        onPickTab={setTab}
        onOpenWork={onSelect}
      />
    </div>
  );
}
