"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { setSondavenVisible } from "@/animations/sondaven-reveal";
import { RepelFilter } from "@/components/effects/repel-filter";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import loaderBgImg from "../../public/hero/hero-loader-bg.webp";
import mobileBgImg from "../../public/hero/hero-mobile-bg.webp";
import mobileFinalBgImg from "../../public/hero/hero-mobile-final-bg.webp";

gsap.registerPlugin(useGSAP);

/** 按第三屏相同规则拆词，供 Son Daven 随机逐词入场。 */
function segmentWords(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("zh-Hans", { granularity: "word" });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return text.split(/(\s+)/).filter(Boolean);
}

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
            className="sd-word inline-block"
          >
            {word}
          </span>
        ),
      )}
    </>
  );
}

export function Hero() {
  const container = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  const { locale, t } = useLocale();
  const { setNavigationLocked } = useSectionPager();

  useGSAP(
    () => {
      const root = container.current;
      const loader = loaderRef.current;
      const videoLayer = videoLayerRef.current;
      const video = videoRef.current;
      if (!root || !loader || !videoLayer || !video) return;

      // 临时：档案盒隐藏，跳过序幕，直接首屏 2 + 解锁切屏
      video.pause();
      gsap.set(loader, { autoAlpha: 0 });
      gsap.set(videoLayer, { autoAlpha: 0 });
      setSondavenVisible(root);
      setNavigationLocked(false);
    },
    { scope: container },
  );

  const subtitle = t("hero.subtitle");
  const highlight =
    locale === "zh" ? '"引力"的探索' : "exploration of gravity";
  const highlightIndex = subtitle.lastIndexOf(highlight);
  const subtitlePrefix =
    highlightIndex >= 0 ? subtitle.slice(0, highlightIndex) : subtitle;
  const subtitleHighlight = highlightIndex >= 0 ? highlight : "";

  return (
    <ScreenShell
      ref={container}
      data-pager-touch-surface
      className="touch-none md:touch-auto"
    >
      {/* 鼠标排斥滤镜：分屏内视频、图片、文字全部参与变形 */}
      <RepelFilter className="absolute inset-0">
      {/* Figma 949:4141：移动端加载完成后的 390×844 终态，使用 3× 无损导出。 */}
      <div className="absolute inset-0 z-10 md:hidden">
        <Image
          src={mobileFinalBgImg}
          alt=""
          fill
          priority
          unoptimized
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      {/* 全屏视频层（静态场景底图由 SharedSectionBackgrounds 提供） */}
      <div
        ref={videoLayerRef}
        className="invisible absolute inset-0 z-20 opacity-0"
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          className="size-full object-cover"
        />
      </div>

      {/* 最终首屏内容：Figma 884:2070，标题组与目录左侧光学对齐 */}
      <div className="absolute inset-0 z-30">
        <div className="absolute left-1/2 top-[113px] flex w-[290px] -translate-x-1/2 flex-col items-center gap-2 text-center md:hidden">
          <h1
            data-sd-words
            data-sd-delay="0.15"
            aria-label={t("hero.title")}
            className="whitespace-nowrap font-serif-sc text-32 font-medium uppercase leading-[48px] text-grey-400"
          >
            <SplitWords text={t("hero.title")} />
          </h1>
          <div className="flex w-full flex-col items-center gap-2">
            <p
              data-sd-words
              data-sd-delay="0.3"
              aria-label={subtitle}
              className="w-full whitespace-nowrap font-serif-sc text-12 uppercase leading-[18px] text-grey-400"
            >
              <SplitWords text={subtitlePrefix} />
            </p>
            {subtitleHighlight ? (
              <p
                data-sd-words
                data-sd-delay="0.3"
                aria-hidden="true"
                className="relative -top-px h-[17px] w-[88px] whitespace-nowrap px-2 font-serif-sc text-12 uppercase leading-[18px] text-white"
              >
                <span
                  data-sd-bar
                  data-sd-delay="0.3"
                  aria-hidden="true"
                  className="absolute inset-0 origin-left scale-x-0 bg-grey-400"
                />
                <span className="relative inline-block whitespace-nowrap">
                  <SplitWords
                    text={
                      locale === "zh"
                        ? subtitleHighlight.replace('"的', '" 的')
                        : subtitleHighlight
                    }
                  />
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <div
          className={`absolute right-[92px] top-[126px] hidden w-[432px] -translate-x-[2.6px] flex-col gap-2 md:flex ${
            locale === "zh" ? "items-start text-left" : "items-end text-right"
          }`}
        >
          <h1
            data-sd-words
            data-sd-delay="0.15"
            aria-label={t("hero.title")}
            className="whitespace-nowrap font-serif-sc text-48 font-medium uppercase text-grey-400"
          >
            <SplitWords text={t("hero.title")} />
          </h1>
          <p
            data-sd-words
            data-sd-delay="0.3"
            aria-label={subtitle}
            className={`whitespace-nowrap font-serif-sc text-16 uppercase text-grey-400 ${
              locale === "zh" ? "w-full text-left" : "text-right"
            }`}
          >
            <SplitWords text={subtitlePrefix} />
            {subtitleHighlight ? (
              <span
                className={`relative inline-block text-white ${
                  locale === "zh" ? "pr-9" : ""
                }`}
              >
                <span
                  data-sd-bar
                  data-sd-delay="0.3"
                  aria-hidden="true"
                  className="absolute inset-0 origin-left scale-x-0 bg-grey-400"
                />
                <span className="relative">
                  <SplitWords text={subtitleHighlight} />
                </span>
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* 加载序幕层：档案盒暂隐（排查 Safari 切屏）；保留 DOM 供序幕逻辑挂载 */}
      <div
        ref={loaderRef}
        className="invisible absolute inset-0 z-40 opacity-0"
        aria-hidden="true"
      >
        <Image
          src={loaderBgImg}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <Image
          src={mobileBgImg}
          alt=""
          fill
          priority
          unoptimized
          placeholder="blur"
          sizes="100vw"
          className="object-cover md:hidden"
        />
        {/* 加载进度仅向屏幕阅读器播报，视觉呈现按设计稿以静态图为准 */}
        <p ref={counterRef} className="sr-only" aria-live="polite">
          0%
        </p>
      </div>
      </RepelFilter>
    </ScreenShell>
  );
}
