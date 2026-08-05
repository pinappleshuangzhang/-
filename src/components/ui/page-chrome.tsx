"use client";

import { useSectionPager } from "@/components/providers/section-pager-provider";
import { NextScreenHint } from "@/components/ui/scroll-hint";
import { SiteNav } from "@/components/ui/site-nav";
import type { NavVariant } from "@/lib/nav-variants";

const NAV_CENTER: Record<NavVariant, React.ReactNode> = {
  studio: (
    <p className="font-bodoni text-20 uppercase text-grey-400">
      Grava Design Studio
    </p>
  ),
  "archive-ga-001": (
    <p className="text-24 uppercase text-grey-400">
      <span className="font-bodoni">Archive_GA_001</span>
      <span className="font-serif-sc font-medium">《什么是引力？》</span>
    </p>
  ),
};

/**
 * 全局固定 UI：导航 + 右下角切屏提示。
 * 导航中间标题跟随当前分屏，切屏提示在末屏隐藏，
 * 首屏加载/序幕期间（切屏锁定时）也不显示。
 */
export function PageChrome() {
  const { navVariant, index, count, navigationLocked, goToNextScreen } =
    useSectionPager();
  const hasNextScreen = index < count - 1;

  return (
    <>
      <SiteNav center={NAV_CENTER[navVariant]} />
      {!navigationLocked && hasNextScreen && (
        <NextScreenHint onActivate={goToNextScreen} />
      )}
    </>
  );
}
