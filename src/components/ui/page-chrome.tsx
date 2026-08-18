"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { ArchiveIndex } from "@/components/ui/archive-index";
import { SiteNav } from "@/components/ui/site-nav";
import type { MessageKey } from "@/lib/i18n/messages";
import type { NavVariant } from "@/lib/nav-variants";

const NAV_TITLE_KEY: Partial<Record<NavVariant, MessageKey>> = {
  "archive-ga-001": "nav.title.ga001",
  "archive-ga-002": "nav.title.ga002",
  "archive-ga-003": "nav.title.ga003",
  "archive-ga-004": "nav.title.ga004",
  "archive-ga-005": "nav.title.ga005",
  contact: "nav.title.contact",
};

const NAV_CODE: Partial<Record<NavVariant, string>> = {
  "archive-ga-001": "ARCHIVE_GA_001",
  "archive-ga-002": "ARCHIVE_GA_002",
  "archive-ga-003": "ARCHIVE_GA_003",
  "archive-ga-004": "GA_ARCHIVE_004",
  "archive-ga-005": "GA_ARCHIVE_005",
  contact: "GA_ARCHIVE_006",
};

/** 与 page.tsx 分屏顺序一致，供目录跳转 */
const SCREEN_INDEX_BY_KEY: Record<string, number> = {
  studio: 0,
  "archive-ga-001": 1,
  "archive-ga-002": 2,
  "archive-ga-003": 3,
  "archive-ga-004": 4,
  "archive-ga-005": 5,
  contact: 6,
};

/**
 * 全局固定 UI：公共导航（未展开 / 目录展开）+ 档案目录层。
 * 导航覆盖所有分屏；目录打开时切换为 index 变体。
 */
export function PageChrome() {
  const { navVariant, index, goToScreen } = useSectionPager();
  const { t } = useLocale();
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

  const titleKey = NAV_TITLE_KEY[navVariant];
  const code = NAV_CODE[navVariant];
  const center =
    navVariant === "studio" || !titleKey || !code ? (
      <p className="whitespace-nowrap font-bodoni text-20 uppercase text-grey-400">
        Grava Design Studio
      </p>
    ) : (
      <p className="whitespace-nowrap text-20 uppercase text-grey-400">
        <span className="font-bodoni font-normal">{code}</span>
        <span className="font-serif-sc font-normal">{t(titleKey)}</span>
      </p>
    );

  return (
    <>
      <SiteNav
        variant={indexOpen ? "index" : "default"}
        center={center}
        onOpenIndex={() => setIndexOpen(true)}
        onCloseIndex={() => setIndexOpen(false)}
        onContact={() => {
          setIndexOpen(false);
          goToScreen(SCREEN_INDEX_BY_KEY.contact);
        }}
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
