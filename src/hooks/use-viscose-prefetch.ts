"use client";

import { useEffect } from "react";
import { SURVEY_G_001 } from "@/lib/survey-details";
import {
  prefetchImage,
  prefetchNextImage,
  prefetchVideo,
} from "@/lib/viscose-prefetch";

type UseViscosePrefetchOptions = {
  seedSrc: string | undefined;
  /** 与 page.tsx 分屏一致：2 = 第三屏组织记录 */
  screenIndex: number;
  fifthActive: boolean;
  isDesktop: boolean;
};

function drawerWarmup() {
  const hero = SURVEY_G_001.media[0];
  const hover = SURVEY_G_001.media[1];
  if (hero) {
    prefetchImage(hero.src, "low");
    prefetchNextImage(hero.src, 1080, "low");
    prefetchNextImage(hero.src, 1920, "low");
  }
  if (hover?.hover === "video") {
    prefetchVideo(hover.videoSrc);
  }
}

/**
 * 第三屏起预热第五屏种子（裸文件 + 手机 next/image）。
 * 第五屏亮起后再空闲预热抽屉首图和第一段 hover 视频。
 */
export function useViscosePrefetch({
  seedSrc,
  screenIndex,
  fifthActive,
  isDesktop,
}: UseViscosePrefetchOptions) {
  useEffect(() => {
    if (screenIndex < 2 || !seedSrc) return;
    prefetchImage(seedSrc, "high");
    if (!isDesktop) {
      prefetchNextImage(seedSrc, 640, "low");
      prefetchNextImage(seedSrc, 828, "low");
    }
  }, [seedSrc, screenIndex, isDesktop]);

  useEffect(() => {
    if (!fifthActive) return;
    const timer = window.setTimeout(drawerWarmup, 1200);
    return () => window.clearTimeout(timer);
  }, [fifthActive]);
}
