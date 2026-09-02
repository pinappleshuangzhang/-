import type { MessageKey } from "@/lib/i18n/messages";

/** 档案目录条目：与 Figma「00目录」列表一一对应 */

export type ArchiveIndexItem = {
  code: string;
  titleKey: MessageKey;
  /** 对应 SectionPager 的 screen key；暂无分屏则为 null */
  screenKey: string | null;
};

// screenKey 与 page.tsx 的分屏 key 对应；置 null 则渲染为不可点击态。
export const ARCHIVE_INDEX_ITEMS: ArchiveIndexItem[] = [
  {
    code: "GA_001",
    titleKey: "index.ga001",
    screenKey: "archive-ga-001",
  },
  {
    code: "GA_002",
    titleKey: "index.ga002",
    screenKey: "archive-ga-002",
  },
  {
    code: "GA_003",
    titleKey: "index.ga003",
    screenKey: "archive-ga-003",
  },
  {
    code: "GA_004",
    titleKey: "index.ga004",
    screenKey: "archive-ga-004",
  },
  {
    code: "GA_005",
    titleKey: "index.ga005",
    screenKey: "archive-ga-005",
  },
  {
    code: "GA_006",
    titleKey: "index.ga006",
    screenKey: "contact",
  },
];
