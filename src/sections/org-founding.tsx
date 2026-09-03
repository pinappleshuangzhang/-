"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { createPointerParallax } from "@/animations/pointer-parallax";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SplitWords } from "@/components/ui/split-words";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { OrgFoundingMobile } from "@/sections/org-founding-mobile";
import plateBgImg from "../../public/org-record/founding-plate-bg.webp";
import plateFgImg from "../../public/org-record/founding-plate-fg.webp";
import statuesBgImg from "../../public/org-record/founding-statues-bg.webp";
import statuesFgImg from "../../public/org-record/founding-statues-fg.webp";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobileViewport(callback: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileViewportServerSnapshot() {
  return false;
}

/**
 * 标题黑条几何：中文取 Figma 780:96；英文取 983:1425
 * （英文从 “To ” 之后起笔，条更长、顶略下移）
 */
const TITLE_BAR_BY_LOCALE = {
  zh: { inset: 76, extend: 133, top: 46, height: 43 },
  en: { inset: 46, extend: 220, top: 49, height: 43 },
} as const;

// 高亮条比高亮词组左移 1px 起笔，右端越过词组末尾再延伸 30px
const GREEN_BAR_SHIFT = 1;
const GREEN_BAR_EXTEND = 30;

// 鼠标视差：左下雕塑与右上铭牌均拆前后景，幅度相同
const LAYER_FG_PARALLAX = { amp: 8, scale: 1.06 };
const LAYER_BG_PARALLAX = { amp: -8, scale: 1.06 };

/**
 * 《组织记录》第二幕：工作室成立。
 * 左列标题带黑色高亮条与雕塑合影，底部成立宣言带绿色高亮条，
 * 右侧为金属铭牌装置图。设计稿 1440×800，纵向锚点按百分比换算。
 * 入场采用 Son Daven 式：文字逐字符随机浮现（高亮条反白副本与
 * 原文共享随机序），高亮条从左擦入，图片在遮罩内上滑显现。
 */
export function OrgFounding() {
  const container = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { t, locale } = useLocale();
  const isMobileViewport = useSyncExternalStore(
    subscribeMobileViewport,
    getMobileViewportSnapshot,
    getMobileViewportServerSnapshot,
  );

  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const blackBarRef = useRef<HTMLDivElement>(null);
  const foundedHighlightRef = useRef<HTMLSpanElement>(null);
  const greenBarRef = useRef<HTMLDivElement>(null);
  const greenCopyRef = useRef<HTMLDivElement>(null);
  const statuesFgParallaxRef = useRef<HTMLDivElement>(null);
  const statuesBgParallaxRef = useRef<HTMLDivElement>(null);
  const plateFgParallaxRef = useRef<HTMLDivElement>(null);
  const plateBgParallaxRef = useRef<HTMLDivElement>(null);

  // 高亮条位置与长度按实测文字宽度 + 语言几何计算；字体加载后再校准
  useEffect(() => {
    if (isMobileViewport) return;
    const bar = TITLE_BAR_BY_LOCALE[locale];
    const apply = () => {
      const line2 = titleLine2Ref.current;
      const blackBar = blackBarRef.current;
      if (line2 && blackBar) {
        blackBar.style.left = `${bar.inset}px`;
        blackBar.style.top = `${bar.top}px`;
        blackBar.style.height = `${bar.height}px`;
        blackBar.style.width = `${
          Math.max(line2.offsetWidth - bar.inset, 0) + bar.extend
        }px`;
        const copy = blackBar.querySelector<HTMLElement>("[data-sd-title-copy]");
        if (copy) {
          copy.style.left = `${-bar.inset}px`;
          copy.style.top = `${-bar.top}px`;
        }
      }
      const highlight = foundedHighlightRef.current;
      const greenBar = greenBarRef.current;
      const greenCopy = greenCopyRef.current;
      if (highlight && greenBar && greenCopy) {
        const left = highlight.offsetLeft - GREEN_BAR_SHIFT;
        greenBar.style.left = `${left}px`;
        greenBar.style.width = `${
          highlight.offsetWidth + GREEN_BAR_SHIFT + GREEN_BAR_EXTEND
        }px`;
        greenCopy.style.left = `${-left}px`;
      }
    };
    apply();
    document.fonts?.ready.then(apply);
  }, [locale, isMobileViewport]);

  // 鼠标视差：仅悬停型精准指针启用，触屏与减少动效场景不启用
  useEffect(() => {
    if (isMobileViewport) return;
    const area = container.current?.querySelector<HTMLElement>(
      "[data-founding-desktop]",
    );
    const statuesFg = statuesFgParallaxRef.current;
    const statuesBg = statuesBgParallaxRef.current;
    const plateFg = plateFgParallaxRef.current;
    const plateBg = plateBgParallaxRef.current;
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
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    return createPointerParallax(
      area,
      [
        { el: statuesFg, ...LAYER_FG_PARALLAX },
        { el: statuesBg, ...LAYER_BG_PARALLAX },
        { el: plateFg, ...LAYER_FG_PARALLAX },
        { el: plateBg, ...LAYER_BG_PARALLAX },
      ],
      { mouseOnly: true, autoDrift: true },
    );
  }, [isActive, isMobileViewport, reducedMotion]);

  const titleLabel = `${t("org.line1a")} ${t("org.line1b")}`;
  // 英文前缀带尾随空格，须落在两个 span 之间的文本节点上，否则被 inline-block 吞掉
  const foundedPrefixRaw = t("orgFounding.foundedPrefix");
  const foundedPrefix = foundedPrefixRaw.trimEnd();
  const foundedGap = foundedPrefixRaw.length > foundedPrefix.length ? " " : "";
  const foundedHighlight = t("orgFounding.foundedHighlight");
  const foundedText = `${foundedPrefixRaw}${foundedHighlight}`;

  return (
    <ScreenShell ref={container} aria-label={t("orgFounding.aria")}>
      {isMobileViewport ? (
        <OrgFoundingMobile />
      ) : (
      <div data-founding-desktop className="absolute inset-0">
      {/* 左上：小字标注 + 大标题（黑色高亮条反白） */}
      <p
        data-sd-words
        data-sd-delay="0.2"
        aria-label={t("orgFounding.designers")}
        className="absolute left-5 top-[30.5%] font-serif-sc text-12 text-grey-300"
      >
        <SplitWords text={t("orgFounding.designers")} />
      </p>
      <div className="absolute left-5 top-[33.6%] whitespace-nowrap font-serif-sc text-32 leading-[46px] text-grey-400">
        <div className="relative">
          <div
            data-sd-words
            data-sd-sync="founding-title"
            data-sd-delay="0.35"
            aria-label={titleLabel}
          >
            <p aria-hidden="true">
              <SplitWords text={t("org.line1a")} />
            </p>
            <p aria-hidden="true">
              <span ref={titleLine2Ref} className="inline-block">
                <SplitWords text={t("org.line1b")} />
              </span>
            </p>
          </div>
          {/* 高亮条：中英几何不同（英文更长、起笔更靠后），由 effect 写入尺寸 */}
          <div
            ref={blackBarRef}
            aria-hidden="true"
            className="absolute left-[76px] top-[46px] h-[43px] w-[249px] overflow-hidden"
          >
            <span
              data-sd-bar
              data-sd-delay="0.35"
              className="absolute inset-0 origin-left scale-x-0 bg-grey-400"
            />
            <div
              data-sd-words
              data-sd-sync="founding-title"
              data-sd-delay="0.35"
              data-sd-title-copy
              className="absolute left-[-76px] top-[-46px] whitespace-nowrap text-white"
            >
              <p>
                <SplitWords text={t("org.line1a")} />
              </p>
              <p>
                <SplitWords text={t("org.line1b")} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 左下：雕塑图与成立宣言同一底栏——页边距 20、图文间距 20、底对齐 */}
      <div className="absolute bottom-5 left-5 flex items-end gap-5">
      <div
        data-sd-media
        data-sd-delay="0.55"
        className="relative size-[325px] shrink-0 overflow-hidden"
      >
        <div
          data-sd-media-inner
          className="absolute inset-0 translate-y-[105%]"
        >
          {/* 视差层与入场层分离，transform 互不干扰；前后景反向移动强化立体感 */}
          <div ref={statuesBgParallaxRef} className="absolute inset-0">
            <Image
              src={statuesBgImg}
              alt=""
              fill
              sizes="325px"
              className="object-cover"
            />
          </div>
          <div ref={statuesFgParallaxRef} className="absolute inset-0">
            <Image
              src={statuesFgImg}
              alt={t("orgFounding.statuesAlt")}
              fill
              sizes="325px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="min-w-0 pb-0">
        <div className="relative h-[38px] whitespace-nowrap font-serif-sc text-24 text-grey-400">
          <p
            data-sd-words
            data-sd-sync="founding-founded"
            data-sd-delay="0.5"
            aria-label={foundedText}
          >
            <span className="inline-block">
              <SplitWords text={foundedPrefix} />
            </span>
            {foundedGap}
            <span ref={foundedHighlightRef} className="inline-block">
              <SplitWords text={foundedHighlight} />
            </span>
          </p>
          {/* 绿条位置与长度按前缀 / 高亮词组实测宽度定位，中英文均适配 */}
          <div
            ref={greenBarRef}
            aria-hidden="true"
            className="absolute left-[119px] top-[-3px] h-[33px] w-[246px] overflow-hidden"
          >
            <span
              data-sd-bar
              data-sd-delay="0.5"
              className="absolute inset-0 origin-left scale-x-0 bg-grey-400"
            />
            <div
              ref={greenCopyRef}
              data-sd-words
              data-sd-sync="founding-founded"
              data-sd-delay="0.5"
              className="absolute left-[-119px] top-[3px] whitespace-nowrap text-white"
            >
              <p>
                <span className="inline-block">
                  <SplitWords text={foundedPrefix} />
                </span>
                {foundedGap}
                <span className="inline-block">
                  <SplitWords text={foundedHighlight} />
                </span>
              </p>
            </div>
          </div>
        </div>
        <div
          data-sd-lines
          data-sd-delay="0.75"
          aria-label={`${t("orgFounding.detail1")} ${t("orgFounding.detail2")}`}
          className="mt-1 font-serif-sc text-12 text-grey-300"
        >
          <span aria-hidden="true" className="block overflow-hidden">
            <span className="sd-line block opacity-0">
              {t("orgFounding.detail1")}
            </span>
          </span>
          <span aria-hidden="true" className="block overflow-hidden">
            <span className="sd-line block opacity-0">
              {t("orgFounding.detail2")}
            </span>
          </span>
        </div>
      </div>
      </div>

      {/* 右侧：金属铭牌装置，贴 20px 右边距；前后景分层视差与左下角相同 */}
      <div
        data-sd-media
        data-sd-delay="0.35"
        className="absolute right-5 top-[7.9%] h-[305px] w-[507px] overflow-hidden"
      >
        <div
          data-sd-media-inner
          className="absolute inset-0 translate-y-[105%]"
        >
          <div ref={plateBgParallaxRef} className="absolute inset-0">
            <Image
              src={plateBgImg}
              alt=""
              fill
              sizes="507px"
              className="object-cover"
            />
          </div>
          <div ref={plateFgParallaxRef} className="absolute inset-0">
            <Image
              src={plateFgImg}
              alt={t("orgFounding.plateAlt")}
              fill
              sizes="507px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
      </div>
      )}
    </ScreenShell>
  );
}
