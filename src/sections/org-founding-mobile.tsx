"use client";

import { useEffect, useRef, type RefObject } from "react";
import Image from "next/image";
import {
  createPointerParallax,
  createScrollParallax,
} from "@/animations/pointer-parallax";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { SplitWords } from "@/components/ui/split-words";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import plateBgImg from "../../public/org-record/founding-plate-bg-m.webp";
import plateFgImg from "../../public/org-record/founding-plate-fg-m.webp";
import statuesBgImg from "../../public/org-record/founding-statues-bg-m.webp";
import statuesFgImg from "../../public/org-record/founding-statues-fg-m.webp";

/** 标题高亮条：中文取移动稿；英文按桌面 983:1425 比例换算到 24px 字号 */
const TITLE_BAR_BY_LOCALE = {
  zh: { inset: 60, extend: 95, top: 37, height: 28 },
  en: { inset: 34, extend: 165, top: 37, height: 32 },
} as const;
const FOUNDED_BAR_EXTEND = 24;

const LAYER_FG_PARALLAX = { amp: 4, scale: 1.03 };
const LAYER_BG_PARALLAX = { amp: -4, scale: 1.03 };
const SCROLL_PARALLAX_AMP = 4;

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
 * 第三屏移动端（Figma 926:1394，390×1452）：纵向两段文案 + 方图 / 竖图，
 * 入场与高亮条交互同桌面；触控滑动与页内滚动驱动前后景视差。
 */
export function OrgFoundingMobile() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { registerScrollInterceptor } = useSectionPager();
  const { t, locale } = useLocale();

  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const foundedLine2Ref = useRef<HTMLSpanElement>(null);
  const foundedBarRef = useRef<HTMLDivElement>(null);

  const statuesRootRef = useRef<HTMLDivElement>(null);
  const statuesFgRef = useRef<HTMLDivElement>(null);
  const statuesBgRef = useRef<HTMLDivElement>(null);
  const plateRootRef = useRef<HTMLDivElement>(null);
  const plateFgRef = useRef<HTMLDivElement>(null);
  const plateBgRef = useRef<HTMLDivElement>(null);

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

  // 页内滚动时消费手势，滚到顶/底再允许切屏
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

  // 触控 / 指针视差（与 PC 相同幅度）
  useEffect(() => {
    const area = scrollerRef.current;
    const statuesFg = statuesFgRef.current;
    const statuesBg = statuesBgRef.current;
    const plateFg = plateFgRef.current;
    const plateBg = plateBgRef.current;
    if (
      !area ||
      !statuesFg ||
      !statuesBg ||
      !plateFg ||
      !plateBg ||
      !isActive ||
      reducedMotion
    ) {
      return;
    }
    return createPointerParallax(area, [
      { el: statuesFg, ...LAYER_FG_PARALLAX },
      { el: statuesBg, ...LAYER_BG_PARALLAX },
      { el: plateFg, ...LAYER_FG_PARALLAX },
      { el: plateBg, ...LAYER_BG_PARALLAX },
    ]);
  }, [isActive, reducedMotion]);

  // 页内滑动：块经过视口时前后景反向位移
  useEffect(() => {
    const scroller = scrollerRef.current;
    const statuesRoot = statuesRootRef.current;
    const statuesFg = statuesFgRef.current;
    const statuesBg = statuesBgRef.current;
    const plateRoot = plateRootRef.current;
    const plateFg = plateFgRef.current;
    const plateBg = plateBgRef.current;
    if (
      !scroller ||
      !statuesRoot ||
      !statuesFg ||
      !statuesBg ||
      !plateRoot ||
      !plateFg ||
      !plateBg ||
      !isActive ||
      reducedMotion
    ) {
      return;
    }
    return createScrollParallax(scroller, [
      {
        root: statuesRoot,
        fg: statuesFg,
        bg: statuesBg,
        amp: SCROLL_PARALLAX_AMP,
      },
      { root: plateRoot, fg: plateFg, bg: plateBg, amp: SCROLL_PARALLAX_AMP },
    ]);
  }, [isActive, reducedMotion]);

  const titleLabel = `${t("org.line1a")} ${t("org.line1b")}`;
  const foundedLabel = `${t("orgFounding.foundedPrefix")}${t(
    "orgFounding.foundedHighlight",
  )}`;
  const titleBar = TITLE_BAR_BY_LOCALE[locale];
  const foundedBar = { inset: 0, top: titleBar.top, height: titleBar.height };

  return (
    <div
      ref={scrollerRef}
      className="absolute inset-0 overflow-y-auto overscroll-contain md:hidden"
    >
      <div
        ref={rootRef}
        className="mx-auto flex w-full max-w-[390px] flex-col px-3 pb-3 pt-[52px]"
      >
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
            ref={statuesRootRef}
            data-sd-media
            data-sd-delay="0.55"
            className="relative aspect-square w-full overflow-hidden"
          >
            <div
              data-sd-media-inner
              className="absolute inset-0 translate-y-[105%]"
            >
              <div ref={statuesBgRef} className="absolute inset-0">
                <Image
                  src={statuesBgImg}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 366px"
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div ref={statuesFgRef} className="absolute inset-0">
                <Image
                  src={statuesFgImg}
                  alt={t("orgFounding.statuesAlt")}
                  fill
                  sizes="(max-width: 767px) 100vw, 366px"
                  unoptimized
                  className="object-cover"
                />
              </div>
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
            ref={plateRootRef}
            data-sd-media
            data-sd-delay="0.65"
            className="relative aspect-[366/488] w-full overflow-hidden"
          >
            <div
              data-sd-media-inner
              className="absolute inset-0 translate-y-[105%]"
            >
              <div ref={plateBgRef} className="absolute inset-0">
                <Image
                  src={plateBgImg}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 366px"
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div ref={plateFgRef} className="absolute inset-0">
                <Image
                  src={plateFgImg}
                  alt={t("orgFounding.plateAlt")}
                  fill
                  sizes="(max-width: 767px) 100vw, 366px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
