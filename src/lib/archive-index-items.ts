import type { MessageKey } from "@/lib/i18n/messages";

/** 档案目录条目：与 Figma「00目录」列表一一对应 */

export type ArchiveIndexItem = {
  code: string;
  titleKey: MessageKey;
  /** 对应 SectionPager 的 screen key；暂无分屏则为 null */
  screenKey: string | null;
};

// 目录跳转暂时全部隐藏（screenKey 置 null 即渲染为不可点击态）；
// 恢复时按 page.tsx 分屏 key 回填即可。
export const ARCHIVE_INDEX_ITEMS: ArchiveIndexItem[] = [
  {
    code: "GA_001",
    titleKey: "index.ga001",
    screenKey: null,
  },
  {
    code: "GA_002",
    titleKey: "index.ga002",
    screenKey: null,
  },
  {
    code: "GA_003",
    titleKey: "index.ga003",
    screenKey: null,
  },
  {
    code: "GA_004",
    titleKey: "index.ga004",
    screenKey: null,
  },
  {
    code: "GA_005",
    titleKey: "index.ga005",
    screenKey: null,
  },
  {
    code: "GA_006",
    titleKey: "index.ga006",
    screenKey: null,
  },
];
