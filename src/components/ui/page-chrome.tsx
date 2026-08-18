"use client";

import { useCallback, useRef, useState } from "react";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { ArchiveIndex } from "@/components/ui/archive-index";
import { SiteNav } from "@/components/ui/site-nav";
import type { NavVariant } from "@/lib/nav-variants";

const NAV_CENTER: Record<NavVariant, React.ReactNode> = {
  studio: (
    <p className="whitespace-nowrap font-bodoni text-20 uppercase text-grey-400">
      Grava Design Studio
    </p>
  ),
  "archive-ga-001": (
    <p className="whitespace-nowrap text-20 uppercase text-grey-400">
      <span className="font-bodoni font-normal">ARCHIVE_GA_001</span>
      <span className="font-serif-sc font-normal">《什么是引力？》</span>
    </p>
  ),
  "archive-ga-002": (
    <p className="whitespace-nowrap text-20 uppercase text-grey-400">
      <span className="font-bodoni">ARCHIVE_GA_002</span>
      <span className="font-serif-sc font-medium">《组织记录》</span>
    </p>
  ),
  "archive-ga-003": (
    <p className="whitespace-nowrap text-20 uppercase text-grey-400">
      <span className="font-bodoni">ARCHIVE_GA_003</span>
    </p>
  ),
};

/** 与 page.tsx 分屏顺序一致，供目录跳转 */
const SCREEN_INDEX_BY_KEY: Record<string, number> = {
  studio: 0,
  "archive-ga-001": 1,
  "archive-ga-002": 2,
  "archive-ga-003": 3,
};

/**
 * 全局固定 UI：公共导航（未展开 / 目录展开）+ 档案目录层。
 * 导航覆盖所有分屏；目录打开时切换为 index 变体。
 */
export function PageChrome() {
  const { navVariant, index, goToScreen } = useSectionPager();
  const [indexOpen, setIndexOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleSelect = useCallback(
    (screenKey: string) => {
      setIndexOpen(false);
      const target = SCREEN_INDEX_BY_KEY[screenKey];
      if (target === undefined || target === index) return;
      goToScreen(target);
    },
    [goToScreen, index],
  );

  return (
    <>
      <SiteNav
        variant={indexOpen ? "index" : "default"}
        center={NAV_CENTER[navVariant]}
        onOpenIndex={() => setIndexOpen(true)}
        onCloseIndex={() => setIndexOpen(false)}
        closeRef={closeRef}
      />
      <ArchiveIndex
        open={indexOpen}
        activeScreenKey={navVariant}
        onClose={() => setIndexOpen(false)}
        onSelect={handleSelect}
        closeButtonRef={closeRef}
      />
    </>
  );
}
