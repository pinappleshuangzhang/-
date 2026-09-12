"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { ArchiveIndex } from "@/components/ui/archive-index";
import { SiteNav } from "@/components/ui/site-nav";

/** 与 page.tsx 分屏顺序一致，供目录跳转 */
const SCREEN_INDEX_BY_KEY: Record<string, number> = {
  studio: 0,
  "archive-ga-001": 1,
  "archive-ga-002": 2,
  "archive-ga-003": 3,
  "archive-ga-004": 4,
  contact: 5,
};

/**
 * 全局固定 UI：公共导航（未展开 / 目录展开）+ 档案目录层。
 * 导航覆盖所有分屏；目录打开时切换为 index 变体。
 */
export function PageChrome() {
  const {
    navVariant,
    index,
    goToScreen,
    runWithCurtain,
    registerScrollInterceptor,
  } = useSectionPager();
  const [indexOpen, setIndexOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // 目录是覆盖层而非一张分屏；打开时吃掉滚轮和触摸滑动，避免触发幕布切屏。
  useEffect(() => {
    if (!indexOpen) return;
    return registerScrollInterceptor(() => true);
  }, [indexOpen, registerScrollInterceptor]);

  // 目录展开走一次幕布；幕布正忙时直接展开，避免点击落空
  const handleOpenIndex = useCallback(() => {
    const open = () => setIndexOpen(true);
    if (!runWithCurtain(open)) open();
  }, [runWithCurtain]);

  // 目录收起延到幕布铺满时执行，避免列表先凭空消失再走过场
  const handleSelect = useCallback(
    (screenKey: string) => {
      const target = SCREEN_INDEX_BY_KEY[screenKey];
      if (target === undefined || target === index) {
        setIndexOpen(false);
        return;
      }
      goToScreen(target, () => setIndexOpen(false));
    },
    [goToScreen, index],
  );

  const handleHome = useCallback(() => {
    if (index === SCREEN_INDEX_BY_KEY.studio) {
      setIndexOpen(false);
      return;
    }
    goToScreen(SCREEN_INDEX_BY_KEY.studio, () => setIndexOpen(false));
  }, [goToScreen, index]);

  return (
    <>
      <SiteNav
        variant={indexOpen ? "index" : "default"}
        navVariant={navVariant}
        onOpenIndex={handleOpenIndex}
        onCloseIndex={() => setIndexOpen(false)}
        onHome={handleHome}
        contactHref="mailto:shuangzhang@fintopia.tech"
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
