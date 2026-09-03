"use client";

import { useEffect, useRef, type RefObject } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { SplitWords } from "@/components/ui/split-words";
import plateImg from "../../public/org-record/founding-plate-m.webp";
import statuesImg from "../../public/org-record/founding-statues-m.webp";

/** 标题高亮条：中文取移动稿；英文按桌面 983:1425 比例换算到 24px 字号 */
const TITLE_BAR_BY_LOCALE = {
  zh: { inset: 60, extend: 95, top: 37, height: 28 },
  en: { inset: 34, extend: 165, top: 37, height: 32 },
} as const;
const FOUNDED_BAR_EXTEND = 24;

type HighlightTitleProps = {
  syncId: string;
  delay: string;
  line1: string;
  line2: string;
  ariaLabel: string;
  barInset: number;
  barTop: number;
  barHeight: number;
  line2Ref?: RefObject<HTMLSpanElement | null>;
  barRef?: RefObject<HTMLDivElement | null>;
};

/** 双行标题 + 第二行黑色切字高亮条（宽度由外层实测写入） */
function HighlightTitle({
  syncId,
  delay,
  line1,
  line2,
  ariaLabel,
  barInset,
  barTop,
  barHeight,
  line2Ref,
  barRef,
}: HighlightTitleProps) {
  return (
    <div className="relative font-serif-sc text-24 leading-[34px] text-grey-400">
      <div data-sd-words data-sd-sync={syncId} data-sd-delay={delay} aria-label={ariaLabel}>
        <p aria-hidden="true">
          <SplitWords text={line1} />
        </p>
        <p aria-hidden="true">
          <span ref={line2Ref} className="inline-block">
            <SplitWords text={line2} />
          </span>
        </p>
      </div>
      <div
        ref={barRef}
        aria-hidden="true"
        className="absolute overflow-hidden"
        style={{ left: barInset, top: barTop, height: barHeight }}
      >
        <span
          data-sd-bar
          data-sd-delay={delay}
          className="absolute inset-0 origin-left scale-x-0 bg-grey-400"
        />
        <div
          data-sd-words
          data-sd-sync={syncId}
          data-sd-delay={delay}
          className="absolute whitespace-nowrap text-white"
          style={{ left: -barInset, top: -barTop }}
        >
          <p>
            <SplitWords text={line1} />
          </p>
          <p>
            <SplitWords text={line2} />
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 第三屏移动端（Figma 926:1394）：纵向两段文案 + 单图；页边 12px；无视差。
 */
export function OrgFoundingMobile() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isActive = useScreenActive();
  const { registerScrollInterceptor } = useSectionPager();
  const { t, locale } = useLocale();

  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const foundedLine2Ref = useRef<HTMLSpanElement>(null);
  const foundedBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = TITLE_BAR_BY_LOCALE[locale];
    const apply = () => {
      const line2 = titleLine2Ref.current;
      const titleBar = titleBarRef.current;
      if (line2 && titleBar) {
        titleBar.style.width = `${
          Math.max(line2.offsetWidth - bar.inset, 0) + bar.extend
        }px`;
      }
      const foundedLine2 = foundedLine2Ref.current;
      const foundedBar = foundedBarRef.current;
      if (foundedLine2 && foundedBar) {
        foundedBar.style.width = `${
          foundedLine2.offsetWidth + FOUNDED_BAR_EXTEND
        }px`;
      }
    };
    apply();
    document.fonts?.ready.then(apply);
  }, [locale]);

  // 回到本屏时展示首屏（滚回顶部）
  useEffect(() => {
    if (!isActive) return;
    const el = scrollerRef.current;
    if (el) el.scrollTop = 0;
  }, [isActive]);

  // 滚轮：页内滚动；触控走原生 pan-y。顶/底再放行切屏
  useEffect(() => {
    if (!isActive) return;
    return registerScrollInterceptor((deltaY) => {
      const el = scrollerRef.current;
      if (!el) return true;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if (deltaY < 0 && atTop) return false;
      if (deltaY > 0 && atBottom) return false;
      el.scrollTop += deltaY;
      return true;
    });
  }, [isActive, registerScrollInterceptor]);

  const titleLabel = `${t("org.line1a")} ${t("org.line1b")}`;
  const foundedLabel = `${t("orgFounding.foundedPrefix")}${t(
    "orgFounding.foundedHighlight",
  )}`;
  const titleBar = TITLE_BAR_BY_LOCALE[locale];
  const foundedBar = { inset: 0, top: titleBar.top, height: titleBar.height };

  return (
    // data-lenis-prevent：分页模式下 Lenis 处于 stop 态，会对 touchmove 一律 preventDefault，
    // 路径上没有该标记的嵌套滚动容器在 iOS 上完全无法原生滚动
    <div
      ref={scrollerRef}
      data-pager-scroller
      data-lenis-prevent=""
      className="absolute inset-0 overflow-y-scroll overscroll-y-contain touch-pan-y"
    >
      {/* 页边距恒定 12px，通栏不限 390 */}
      <div className="flex w-full flex-col px-3 pb-3 pt-[52px]">
        {/* 第一段：标题 + 雕塑方图 */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p
              data-sd-words
              data-sd-delay="0.2"
              aria-label={t("orgFounding.designers")}
              className="font-serif-sc text-12 text-grey-300"
            >
              <SplitWords text={t("orgFounding.designers")} />
            </p>
            <HighlightTitle
              syncId="founding-title-m"
              delay="0.35"
              line1={t("org.line1a")}
              line2={t("org.line1b")}
              ariaLabel={titleLabel}
              barInset={titleBar.inset}
              barTop={titleBar.top}
              barHeight={titleBar.height}
              line2Ref={titleLine2Ref}
              barRef={titleBarRef}
            />
          </div>
          <div
            data-sd-media
            data-sd-delay="0.55"
            className="w-full overflow-hidden"
          >
            <div data-sd-media-inner className="translate-y-[105%]">
              <Image
                src={statuesImg}
                alt={t("orgFounding.statuesAlt")}
                width={732}
                height={732}
                sizes="100vw"
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>

        {/* 第二段：成立宣言 + 铭牌竖图（间距取自稿 112px） */}
        <div className="mt-28 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p
              data-sd-words
              data-sd-delay="0.45"
              aria-label={t("orgFounding.designers")}
              className="font-serif-sc text-12 text-grey-300"
            >
              <SplitWords text={t("orgFounding.designers")} />
            </p>
            <HighlightTitle
              syncId="founding-founded-m"
              delay="0.55"
              line1={t("orgFounding.foundedPrefix").trimEnd()}
              line2={t("orgFounding.foundedHighlight")}
              ariaLabel={foundedLabel}
              barInset={foundedBar.inset}
              barTop={foundedBar.top}
              barHeight={foundedBar.height}
              line2Ref={foundedLine2Ref}
              barRef={foundedBarRef}
            />
          </div>
          <div
            data-sd-media
            data-sd-delay="0.65"
            className="w-full overflow-hidden"
          >
            <div data-sd-media-inner className="translate-y-[105%]">
              {/* iOS Safari 对嵌套滚动容器内的 lazy 图可能永不触发加载，此处直接 eager */}
              <Image
                src={plateImg}
                alt={t("orgFounding.plateAlt")}
                width={732}
                height={1147}
                sizes="100vw"
                loading="eager"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
