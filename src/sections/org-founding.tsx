"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createPointerParallax } from "@/animations/pointer-parallax";
import {
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import foundingPlateImg from "../../public/org-record/founding-plate.webp";
import foundingStatuesImg from "../../public/org-record/founding-statues.webp";

gsap.registerPlugin(useGSAP);

// 高亮条几何（取自 Figma 780:96，设计稿 1440×800）：
// 黑条从标题第二行左起 76px 处切入，右端越过文字末尾再延伸 133px
const BLACK_BAR_INSET = 76;
const BLACK_BAR_EXTEND = 133;
// 绿条比高亮词组左移 1px 起笔，右端越过词组末尾再延伸 30px
const GREEN_BAR_SHIFT = 1;
const GREEN_BAR_EXTEND = 30;

// 鼠标视差深度：雕塑图为近景（同向、幅度大），铭牌图为远景（反向、幅度小）
const STATUES_PARALLAX = { amp: 12, scale: 1.08 };
const PLATE_PARALLAX = { amp: -6, scale: 1.05 };

/** 按词切分：中文用 Intl.Segmenter 分词，英文按空格；不支持时整段作一个词 */
function segmentWords(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("zh-Hans", { granularity: "word" });
    return Array.from(segmenter.segment(text), (seg) => seg.segment);
  }
  return text.split(/(\s+)/).filter(Boolean);
}

/** 逐词拆分：空白保留为文本节点，词 span 由父级 aria-label 兜底语义 */
function SplitWords({ text }: { text: string }) {
  return (
    <>
      {segmentWords(text).map((word, index) =>
        word.trim() === "" ? (
          word
        ) : (
          <span
            key={`${word}-${index}`}
            aria-hidden="true"
            className="sd-word inline-block opacity-0"
          >
            {word}
          </span>
        ),
      )}
    </>
  );
}

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

  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const blackBarRef = useRef<HTMLDivElement>(null);
  const foundedHighlightRef = useRef<HTMLSpanElement>(null);
  const greenBarRef = useRef<HTMLDivElement>(null);
  const greenCopyRef = useRef<HTMLDivElement>(null);
  const statuesParallaxRef = useRef<HTMLDivElement>(null);
  const plateParallaxRef = useRef<HTMLDivElement>(null);

  // 高亮条位置与长度按实测文字宽度计算，中英文环境均自动适配；
  // 字体加载完成后宽度会变，需再校准一次
  useEffect(() => {
    const apply = () => {
      const line2 = titleLine2Ref.current;
      const blackBar = blackBarRef.current;
      if (line2 && blackBar) {
        const width =
          Math.max(line2.offsetWidth - BLACK_BAR_INSET, 0) + BLACK_BAR_EXTEND;
        blackBar.style.width = `${width}px`;
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
  }, [locale]);

  // 鼠标视差：仅悬停型精准指针启用，触屏与减少动效场景不启用
  useEffect(() => {
    const area = container.current;
    const statues = statuesParallaxRef.current;
    const plate = plateParallaxRef.current;
    if (!area || !statues || !plate || !isActive || reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    return createPointerParallax(area, [
      { el: statues, ...STATUES_PARALLAX },
      { el: plate, ...PLATE_PARALLAX },
    ]);
  }, [isActive, reducedMotion]);

  // locale 变化会重建词 span（初始隐藏），需重跑动画否则文字停在隐藏态
  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      if (reducedMotion) {
        setSondavenVisible(root);
        return;
      }
      if (!isActive) {
        setSondavenHidden(root);
        return;
      }
      playSondavenReveal(root);
    },
    { dependencies: [isActive, reducedMotion, locale], scope: container },
  );

  const titleLabel = `${t("org.line1a")} ${t("org.line1b")}`;
  // 英文前缀带尾随空格，须落在两个 span 之间的文本节点上，否则被 inline-block 吞掉
  const foundedPrefixRaw = t("orgFounding.foundedPrefix");
  const foundedPrefix = foundedPrefixRaw.trimEnd();
  const foundedGap = foundedPrefixRaw.length > foundedPrefix.length ? " " : "";
  const foundedHighlight = t("orgFounding.foundedHighlight");
  const foundedText = `${foundedPrefixRaw}${foundedHighlight}`;

  return (
    <ScreenShell ref={container} aria-label={t("orgFounding.aria")}>
      {/* 左上：小字标注 + 大标题（黑色高亮条反白） */}
      <p
        data-sd-words
        data-sd-delay="0.2"
        aria-label={t("orgFounding.designers")}
        className="absolute left-5 top-[30.5%] font-serif-sc text-12 uppercase text-grey-300"
      >
        <SplitWords text={t("orgFounding.designers")} />
      </p>
      <div className="absolute left-5 top-[33.6%] whitespace-nowrap font-serif-sc text-32 uppercase text-grey-400">
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
          {/* 高亮条压在原文上：条内是同排版的反白副本，形成切字反色效果；宽度随文字实测适配 */}
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

      {/* 左下：四位设计师雕塑合影 */}
      <div
        data-sd-media
        data-sd-delay="0.55"
        className="absolute left-5 top-[56.9%] size-[325px] overflow-hidden"
      >
        <div
          data-sd-media-inner
          className="absolute inset-0 translate-y-[105%]"
        >
          {/* 视差层与入场层分离，transform 互不干扰 */}
          <div ref={statuesParallaxRef} className="absolute inset-0">
            <Image
              src={foundingStatuesImg}
              alt={t("orgFounding.statuesAlt")}
              fill
              sizes="325px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* 底部：成立宣言（绿色高亮条反白）与补充说明，整组贴 20px 底边距 */}
      <div className="absolute bottom-5 left-[calc(25%+5px)]">
        <div className="relative h-[38px] whitespace-nowrap font-serif-sc text-24 uppercase text-grey-400">
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
              className="absolute inset-0 origin-left scale-x-0 bg-green-900"
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
          className="mt-1 font-serif-sc text-12 uppercase text-grey-300"
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

      {/* 右侧：金属铭牌装置，贴 20px 右边距 */}
      <div
        data-sd-media
        data-sd-delay="0.35"
        className="absolute right-5 top-[7.9%] h-[305px] w-[507px] overflow-hidden"
      >
        <div
          data-sd-media-inner
          className="absolute inset-0 translate-y-[105%]"
        >
          <div ref={plateParallaxRef} className="absolute inset-0">
            <Image
              src={foundingPlateImg}
              alt={t("orgFounding.plateAlt")}
              fill
              sizes="507px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
