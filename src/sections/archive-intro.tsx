"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { createCornerTitleSweep } from "@/animations/archive-ga-004-title-sweep";
import {
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import {
  AlphaScrubVideo,
  type AlphaScrubVideoHandle,
} from "@/components/effects/alpha-scrub-video";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import archiveFolderImg from "../../public/archive/archive-folder-yellow-alpha.webp";

gsap.registerPlugin(useGSAP);

// 桌面版全关键帧；手机用普通帧间压缩的小文件（约为桌面版体积的 1/20）。
const FOLDER_VIDEO_WEBM = "/archive/archive-folder-yellow-alpha.webm?v=in1";
const FOLDER_VIDEO_HEVC = "/archive/archive-folder-yellow-alpha-hevc.mp4?v=in1";
const FOLDER_VIDEO_MOBILE_WEBM =
  "/archive/archive-folder-yellow-alpha-mobile.webm?v=raw1";
const FOLDER_VIDEO_MOBILE_HEVC =
  "/archive/archive-folder-yellow-alpha-mobile-hevc.mp4?v=raw1";
/** 进屏后书本视频一次性播完的总时长（与文字无关）。 */
const AUTO_DURATION = 9;
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

/** 按词切分：与第三屏 Son Daven 式逐词入场的规则保持一致。 */
function segmentWords(text: string): string[] {
  const attachClosingPunctuation = (segments: string[]) =>
    segments.reduce<string[]>((words, segment) => {
      // 不间断空格把前后词绑在同一行，避免 “Trust” 落到 “Earn” 下一行。
      if (segment === "\u00A0") {
        if (words.length > 0) words[words.length - 1] += "\u00A0";
        else words.push("\u00A0");
        return words;
      }
      if (words.length > 0 && words[words.length - 1].endsWith("\u00A0")) {
        words[words.length - 1] += segment;
        return words;
      }
      // 标点作为独立 inline-block 时可能被换到下一行行首；将其并回前词。
      if (
        /^[，。！？；：、】【）》〉〕］｝”’]+$/u.test(segment) &&
        words.length > 0
      ) {
        words[words.length - 1] += segment;
      } else {
        words.push(segment);
      }
      return words;
    }, []);

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("zh-Hans", { granularity: "word" });
    return attachClosingPunctuation(
      Array.from(segmenter.segment(text), (segment) => segment.segment),
    );
  }
  return attachClosingPunctuation(text.split(/(\s+)/).filter(Boolean));
}

/** 逐词入场文本：词 span 供 Son Daven 式入场动画。 */
function RevealText({
  text,
  revealDelay,
  className,
}: {
  text: string;
  revealDelay?: number;
  className?: string;
}) {
  return (
    <p
      aria-label={text}
      data-sd-words
      data-sd-delay={revealDelay}
      className={className}
    >
      {segmentWords(text).map((word, wordIndex) =>
        word.trim() === "" ? (
          word
        ) : (
          <span
            key={`${word}-${wordIndex}`}
            aria-hidden="true"
            className="sd-word inline-block opacity-0"
          >
            {word}
          </span>
        ),
      )}
    </p>
  );
}

/**
 * 第二屏：档案 GA_001《什么是引力？》
 * 视频与文字解耦：进屏后书本视频自顾自播到结束，文案整段逐词入场
 * （Figma 1397:305 / 1397:436）。
 */
export function ArchiveIntro() {
  const container = useRef<HTMLElement>(null);
  const cornerTitlesRef = useRef<HTMLDivElement>(null);
  const videoHandleRef = useRef<AlphaScrubVideoHandle>(null);
  const hasPlayedCopyEntranceRef = useRef(false);

  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  // 首屏序幕结束（导航解锁）后才开始加载视频，避免和首屏视频抢带宽
  const [videoAllowed, setVideoAllowed] = useState(false);

  const reducedMotion = useReducedMotion();
  const isMobileViewport = useSyncExternalStore(
    subscribeMobileViewport,
    getMobileViewportSnapshot,
    getMobileViewportServerSnapshot,
  );
  const isActive = useScreenActive();
  const { navigationLocked } = useSectionPager();
  const { t, locale } = useLocale();
  const isEnglish = locale === "en";

  // 渲染期间锁存：一旦解锁过就保持允许（序幕重播时不重新卸载视频）
  if (!navigationLocked && !videoAllowed) {
    setVideoAllowed(true);
  }

  // 书内文案由本屏自己入场，并排除整屏统一入场，避免重复点亮。
  useGSAP(
    () => {
      const copy = container.current?.querySelector<HTMLElement>(
        "[data-intro-copy]",
      );
      if (!copy) return;

      if (reducedMotion) {
        setSondavenVisible(copy);
        return;
      }
      if (!isActive) {
        if (!hasPlayedCopyEntranceRef.current) setSondavenHidden(copy);
        return;
      }
      if (hasPlayedCopyEntranceRef.current) {
        setSondavenVisible(copy);
        return;
      }

      hasPlayedCopyEntranceRef.current = true;
      playSondavenReveal(copy);
    },
    {
      dependencies: [isActive, isMobileViewport, reducedMotion, locale],
      scope: container,
    },
  );

  // 页面角标大字与第六屏 DESIGN / WORKS 共用横穿后回位的出场节奏。
  useGSAP(
    () => {
      const root = cornerTitlesRef.current;
      if (!root) return;
      const whatIs = root.querySelector<HTMLElement>("[data-title-what-is]");
      const gravity = root.querySelector<HTMLElement>("[data-title-gravity]");
      if (!whatIs || !gravity) return;

      if (reducedMotion) {
        gsap.set([whatIs, gravity], { x: 0 });
        return;
      }
      if (!isActive) return;
      createCornerTitleSweep(whatIs, gravity);
    },
    {
      dependencies: [isActive, reducedMotion],
      revertOnUpdate: true,
      scope: container,
    },
  );

  // 进屏后视频自顾自整段播完；离屏复位。
  useEffect(() => {
    videoHandleRef.current?.pause();

    if (!isActive) {
      hasPlayedCopyEntranceRef.current = false;
      videoHandleRef.current?.seekTo(0);
      return;
    }

    if (reducedMotion) {
      videoHandleRef.current?.seekTo(1);
      return;
    }

    const videoHandle = videoHandleRef.current;
    if (videoReady) {
      videoHandle?.playToEnd(AUTO_DURATION);
    }

    return () => {
      videoHandle?.pause();
    };
  }, [isActive, isMobileViewport, reducedMotion, videoReady]);

  const showVideo = videoAllowed && !reducedMotion && !videoFailed;
  const showPoster = !showVideo || !videoReady;

  return (
    <ScreenShell ref={container}>
      <div className="absolute inset-0 z-20">
        {/* Figma 790:324 / 790:325：页面上下两处装饰性大标题 */}
        <div
          ref={cornerTitlesRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <p
            data-title-what-is
            className="absolute left-[3.0769%] top-[calc(47.69%-80vw*420/563/2-103px)] font-bodoni text-44 font-normal leading-[55px] text-grey-400 md:left-[calc(50%-var(--su)*615)] md:top-[calc(50%-var(--su)*244)] md:text-[length:calc(var(--su)*100)] md:leading-[calc(var(--su)*125)]"
          >
            WHAT IS
          </p>
          <p
            data-title-gravity
            className="absolute left-[46.9231%] top-[calc(47.69%+80vw*420/563/2+58px)] font-bodoni text-44 font-normal leading-[55px] text-grey-400 md:left-[calc(50%+var(--su)*193)] md:top-[calc(50%+var(--su)*176)] md:text-[length:calc(var(--su)*100)] md:leading-[calc(var(--su)*125)]"
          >
            GRAVITY
          </p>
        </div>

        {/* 档案夹卡片：桌面 563×420；移动端 Figma 701:204 = 312×233 */}
        <div className="absolute left-[calc(50%+1px)] top-[47.69%] aspect-[563/420] w-[80%] -translate-x-1/2 -translate-y-1/2 text-14 md:left-[calc(50%+var(--su)*4)] md:top-[calc(50%+var(--su)*18)] md:w-[calc(var(--su)*563)] md:text-[length:calc(var(--su)*16)]">
          {/* 投影：设计稿手绘投影图形 1:1 还原（SVG 画布含模糊出血，按设计坐标定位） */}
          <span
            aria-hidden="true"
            className="absolute left-[-2.57%] top-[1.76%] block h-[119.8%] w-[111.64%] md:left-[calc(-2.57%-var(--su)*16)]"
          >
            <Image src="/archive/folder-shadow.svg" alt="" fill sizes="60vw" />
          </span>

          {/* 桌面向内收 1px 去黑边；手机不用矩形裁切，避免顶/底切到标签 */}
          <div className="absolute inset-0 overflow-hidden max-md:overflow-visible">
            <div className="absolute -inset-px max-md:inset-0">
              {/* 静态占位（视频首帧就绪前 / 降级时显示） */}
              {showPoster && (
                <Image
                  src={archiveFolderImg}
                  alt={t("intro.folderAlt")}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 768px) calc(100vw * 563 / 1440), 80vw"
                  className="object-contain"
                />
              )}

              {/* 擦拭视频：桌面按 1112x834 / x31..1096,y8..829；
                  手机按 1080x810 / x24..1065,y6..804 */}
              {showVideo && (
                <AlphaScrubVideo
                  ref={videoHandleRef}
                  srcWebm={
                    isMobileViewport
                      ? FOLDER_VIDEO_MOBILE_WEBM
                      : FOLDER_VIDEO_WEBM
                  }
                  srcHevc={
                    isMobileViewport
                      ? FOLDER_VIDEO_MOBILE_HEVC
                      : FOLDER_VIDEO_HEVC
                  }
                  onFirstFrame={() => setVideoReady(true)}
                  onError={() => setVideoFailed(true)}
                  className={
                    isMobileViewport
                      ? "absolute left-[-2.31%] top-[-0.75%] h-[101.50%] w-[103.75%]"
                      : "absolute left-[-2.91%] top-[-0.97%] h-[101.58%] w-[104.41%]"
                  }
                />
              )}
            </div>
          </div>

          {/* 卡片内文字：桌面 Figma 1397:315 / 1397:448；移动端沿用 701:204 卡片内左缘 */}
          <div
            data-intro-copy
            data-sd-global-ignore
            className={`absolute left-[8.6538%] top-[26%] flex w-[55%] flex-col gap-1 font-serif-sc font-normal text-grey-400 ${
              isEnglish
                ? "md:left-[calc(var(--su)*52)] md:top-[calc(var(--su)*130)] md:w-[calc(var(--su)*280)] md:gap-[calc(var(--su)*4)]"
                : "md:left-[calc(var(--su)*64)] md:top-[calc(var(--su)*116)] md:w-[calc(var(--su)*256)] md:gap-[calc(var(--su)*8)]"
            }`}
          >
            <div
              className={`flex flex-col gap-1.5 ${
                isEnglish
                  ? "md:gap-[calc(var(--su)*8)]"
                  : "md:gap-[calc(var(--su)*10)]"
              }`}
            >
              <RevealText
                text={t("intro.line1")}
                revealDelay={0.4}
                className={`text-12 leading-[18px] md:leading-normal ${
                  isEnglish
                    ? "md:text-[length:calc(var(--su)*18)]"
                    : "md:text-[length:calc(var(--su)*20)]"
                }`}
              />
              <div
                className={
                  isEnglish
                    ? "text-10 leading-[16px] md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*28)]"
                    : "text-12 leading-[18px] md:text-[length:calc(var(--su)*18)] md:leading-[calc(var(--su)*32)]"
                }
              >
                <RevealText text={t("intro.line2a")} revealDelay={0.5} />
                <RevealText text={t("intro.line2b")} revealDelay={0.55} />
                <RevealText text={t("intro.line2c")} revealDelay={0.6} />
                <RevealText text={t("intro.bridge")} revealDelay={0.65} />
              </div>
            </div>
            <RevealText
              text={t("intro.gravity")}
              revealDelay={0.7}
              className={`text-24 leading-normal ${
                isEnglish
                  ? "md:text-[length:calc(var(--su)*40)]"
                  : "md:text-[length:calc(var(--su)*44)]"
              }`}
            />
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
