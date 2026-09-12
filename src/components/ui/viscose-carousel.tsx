"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState, type MutableRefObject } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { ViscoseMobileGallery } from "@/components/ui/viscose-mobile-gallery";
import { useDesktopMedia } from "@/hooks/use-desktop-media";
import {
  VISCOSE_SEED_INDEX,
  type ViscoseCarouselItem,
} from "@/lib/viscose-carousel-items";

const ViscoseDesktopCarousel = dynamic(
  () =>
    import("@/components/ui/viscose-desktop-carousel").then(
      (module) => module.ViscoseDesktopCarousel,
    ),
  { ssr: false },
);

type ViscoseCarouselProps = {
  items: ViscoseCarouselItem[];
  active: boolean;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  scrollHandlerRef: MutableRefObject<((deltaY: number) => boolean) | null>;
  /** 抽屉打开时暂停渲染，避免模糊长廊抢 GPU 导致抽屉滚动卡顿 */
  paused?: boolean;
  className?: string;
};

export function ViscoseCarousel({
  items,
  active,
  reducedMotion,
  onSelect,
  scrollHandlerRef,
  paused = false,
  className,
}: ViscoseCarouselProps) {
  const { locale, t } = useLocale();
  const { index: screenIndex } = useSectionPager();
  const isDesktop = useDesktopMedia();
  const [hasActivated, setHasActivated] = useState(false);

  useEffect(() => {
    if (!isDesktop) return;
    void import("@/components/ui/viscose-desktop-carousel");
  }, [isDesktop]);

  // 工作室简介屏起预取种子图（Website Interface），避开首屏 Hero 带宽；
  // 与图集同一 URL，进入第五屏时 Image() 走缓存。
  useEffect(() => {
    if (screenIndex < 2) return;
    const src = items[VISCOSE_SEED_INDEX]?.src;
    if (!src) return;
    const img = new window.Image();
    img.fetchPriority = "high";
    img.src = src;
  }, [items, screenIndex]);

  // 首次激活后保持挂载（渲染期守卫式 setState，避免级联渲染）
  if (active && !hasActivated) setHasActivated(true);

  if (!isDesktop) {
    return <ViscoseMobileGallery items={items} active={active} onSelect={onSelect} />;
  }

  if (reducedMotion) {
    return (
      <div
        role="list"
        aria-label={t("gallery.list")}
        className="absolute inset-x-[20px] top-1/2 flex -translate-y-1/2 gap-8 overflow-x-auto py-8"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(index)}
            className="relative aspect-[242/136] w-[242px] shrink-0 overflow-hidden rounded-rs-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="242px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    );
  }

  if (!hasActivated) return null;

  return (
    <div
      className={`absolute inset-0 isolate overflow-hidden ${active ? "" : "invisible"} ${className ?? ""}`}
    >
      <ViscoseDesktopCarousel
        onSelect={onSelect}
        scrollHandlerRef={scrollHandlerRef}
        paused={paused || !active}
        cursorLabel={t("gallery.view")}
        dragHintLabel={t("gallery.dragHint")}
        categoryLabels={[
          t("gallery.category.brand"),
          t("gallery.category.product"),
          t("gallery.category.website"),
          t("gallery.category.visual"),
          t("gallery.category.motion"),
        ]}
        mobileHeading={t("gallery.mobile.heading")}
        mobileViewDetails={t("gallery.mobile.viewDetails")}
        mobileWorks={[]}
        categoryFontClass={locale === "zh" ? "font-serif-sc" : "font-bodoni"}
        nameFont={locale === "zh" ? "Noto Serif SC" : "Libre Bodoni"}
      />
    </div>
  );
}
