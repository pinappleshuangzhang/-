"use client";

import { useEffect, useState } from "react";
import { ScrollHintCorner } from "@/components/ui/scroll-hint";
import { SiteNav } from "@/components/ui/site-nav";

export type NavVariant = "studio" | "archive-ga-001";

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
 * 全局固定 UI：导航 + 右下角滚动提示，不随页面滚动。
 * 各分屏在 section 上声明 data-nav-variant，
 * 滚动到对应分屏时导航中间标题自动切换。
 */
export function PageChrome() {
  const [variant, setVariant] = useState<NavVariant>("studio");

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-nav-variant]",
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const next = (entry.target as HTMLElement).dataset.navVariant;
          if (next && next in NAV_CENTER) {
            setVariant(next as NavVariant);
          }
        }
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SiteNav center={NAV_CENTER[variant]} />
      <ScrollHintCorner />
    </>
  );
}
