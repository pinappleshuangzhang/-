"use client";

import Image from "next/image";
import type { MutableRefObject } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import type { ViscoseCarouselItem } from "@/lib/viscose-carousel-items";
import Carousel from "@/vendor/viscose/carousel";

type ViscoseCarouselProps = {
  items: ViscoseCarouselItem[];
  active: boolean;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  scrollHandlerRef: MutableRefObject<
    ((deltaY: number) => boolean) | null
  >;
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
  const categoryLabels = [
    t("gallery.category.brand"),
    t("gallery.category.product"),
    t("gallery.category.website"),
    t("gallery.category.visual"),
    t("gallery.category.motion"),
  ];

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

  if (!active) return null;

  return (
    <div
      className={`absolute inset-0 isolate overflow-hidden ${className ?? ""}`}
    >
      <Carousel
        onSelect={onSelect}
        scrollHandlerRef={scrollHandlerRef}
        paused={paused}
        cursorLabel={t("gallery.view")}
        categoryLabels={categoryLabels}
        categoryFontClass={
          locale === "zh" ? "font-serif-sc" : "font-bodoni"
        }
        nameFont={locale === "zh" ? "Noto Serif SC" : "Libre Bodoni"}
      />
    </div>
  );
}
