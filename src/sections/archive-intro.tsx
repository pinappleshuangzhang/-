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
/** 手机无分段滚轮：第一段停留此时长后自动换第二段。 */
const MOBILE_TEXT_SWAP_DELAY = 5;
/** 换段后至少吞掉这么久的向下滚动，抵消触控板惯性。 */
const SWAP_ABSORB_MS = 900;
/** 滚轮事件间隔小于此值视为同一次手势，继续吞掉；停顿后再滑才切屏。 */
const GESTURE_GAP_MS = 400;
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

/** 逐词入场、逐字变色文本：外层词 span 供入场动画，内层字 span 供滚动点亮。 */
function ScrubText({
  text,
  revealDelay,
}: {
  text: string;
  revealDelay?: number;
}) {
  return (
    <p aria-label={text} data-sd-words data-sd-delay={revealDelay}>
      {segmentWords(text).map((word, wordIndex) =>
        word.trim() === "" ? (
          word
        ) : (
          <span
            key={`${word}-${wordIndex}`}
            aria-hidden="true"
            className="sd-word inline-block opacity-0"
          >
            {Array.from(word).map((char, charIndex) => (
              <span key={charIndex} data-scrub-char>
                {char}
              </span>
            ))}
          </span>
        ),
      )}
    </p>
  );
}

/**
 * 第二屏：档案 GA_001《什么是引力？》
 * 视频与文字解耦：进屏后书本视频自顾自播到结束；
 * 桌面第一次向下滑换第二段文案，再向下滑才切屏，向上滑随时回上一屏；
 * 手机无分段滚轮，第一段停留数秒后自动换段。
 */
export function ArchiveIntro() {
  const container = useRef<HTMLElement>(null);
  const cornerTitlesRef = useRef<HTMLDivElement>(null);
  const videoHandleRef = useRef<AlphaScrubVideoHandle>(null);
  const textTimelineRef = useRef<gsap.core.Timeline | null>(null);

  /** 0 = 第一段文案在屏，1 = 已换第二段 */
  const copyStageRef = useRef<0 | 1>(0);
  const swapAbsorbUntilRef = useRef(0);
  const lastAbsorbedDownAtRef = useRef(0);
  const hasPlayedFirstCopyEntranceRef = useRef(false);
  const swapCallRef = useRef<gsap.core.Tween | null>(null);

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
  const { registerScrollInterceptor, navigationLocked } = useSectionPager();
  const { t, locale } = useLocale();
  const isEnglish = locale === "en";

  // 渲染期间锁存：一旦解锁过就保持允许（序幕重播时不重新卸载视频）
  if (!navigationLocked && !videoAllowed) {
    setVideoAllowed(true);
  }

  // 书内第一段由本屏自己入场；两段都排除整屏统一入场，避免第二段被一起点亮后叠字。
  useGSAP(
    () => {
      const root = container.current;
      const primaryCopy = root?.querySelector<HTMLElement>("[data-swap-a]");
      if (!primaryCopy) return;

      if (reducedMotion) {
        setSondavenVisible(primaryCopy);
        return;
      }
      if (!isActive) {
        if (!hasPlayedFirstCopyEntranceRef.current) {
          setSondavenHidden(primaryCopy);
        }
        return;
      }
      if (hasPlayedFirstCopyEntranceRef.current) {
        if (copyStageRef.current === 0) {
          setSondavenVisible(primaryCopy);
        }
        return;
      }

      hasPlayedFirstCopyEntranceRef.current = true;
      playSondavenReveal(primaryCopy);
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

  // 桌面滚动状态机：第一次向下滑换第二段文案，第二次才放行切屏；
  // 向上滑始终直接回上一屏。只管文字，不碰视频。
  useEffect(() => {
    if (!isActive || isMobileViewport || reducedMotion) {
      return;
    }
    return registerScrollInterceptor((deltaY) => {
      if (deltaY < 0) return false;
      const now = performance.now();
      if (copyStageRef.current === 0) {
        copyStageRef.current = 1;
        swapAbsorbUntilRef.current = now + SWAP_ABSORB_MS;
        lastAbsorbedDownAtRef.current = now;
        textTimelineRef.current?.play();
        return true;
      }
      // 换段后：最小吞噬窗口内，或滚轮事件仍连续（同一次手势的惯性）都不放行
      if (
        now < swapAbsorbUntilRef.current ||
        now - lastAbsorbedDownAtRef.current < GESTURE_GAP_MS
      ) {
        lastAbsorbedDownAtRef.current = now;
        return true;
      }
      return false;
    });
  }, [isActive, isMobileViewport, reducedMotion, registerScrollInterceptor]);

  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;

      // 换段时间轴（真实秒数，触发后一次性播完）：
      //   0 ~ 0.7   第一段逐词退场
      //   0.6 起    切到第二段并逐词入场
      const charsA = gsap.utils.toArray<HTMLElement>(
        "[data-swap-a] [data-scrub-char]",
        root,
      );
      const wordsA = gsap.utils.toArray<HTMLElement>(
        "[data-swap-a] .sd-word",
        root,
      );
      const charsB = gsap.utils.toArray<HTMLElement>(
        "[data-swap-b] [data-scrub-char]",
        root,
      );
      const wordsB = gsap.utils.toArray<HTMLElement>(
        "[data-swap-b] .sd-word",
        root,
      );
      const shuffledWordsA = gsap.utils.shuffle([...wordsA]);
      const shuffledWordsB = gsap.utils.shuffle([...wordsB]);
      const swapA = root.querySelector<HTMLElement>("[data-swap-a]");
      const swapB = root.querySelector<HTMLElement>("[data-swap-b]");
      gsap.set(wordsA, { opacity: 1, yPercent: 0, scale: 1 });
      gsap.set(wordsB, { opacity: 0, yPercent: 75, scale: 0 });
      if (swapB) gsap.set(swapB, { autoAlpha: 0 });
      if (swapA) gsap.set(swapA, { autoAlpha: 1 });
      gsap.set([charsA, charsB], { color: "var(--color-grey-400)" });

      const timeline = gsap.timeline({ paused: true });
      timeline
        .to(
          shuffledWordsA,
          {
            opacity: 0,
            yPercent: 75,
            scale: 0,
            duration: 0.45,
            ease: "power2.in",
            stagger: { amount: 0.25 },
          },
          0,
        )
        .to(swapA, { autoAlpha: 0, duration: 0.01 }, 0.6)
        .to(swapB, { autoAlpha: 1, duration: 0.01 }, 0.6)
        .to(
          shuffledWordsB,
          {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.04,
          },
          0.65,
        );
      textTimelineRef.current = timeline;
      // locale 切换会重建文案节点；若已换到第二段，直接落到终态。
      if (copyStageRef.current === 1) timeline.progress(1);

      return () => {
        textTimelineRef.current = null;
      };
    },
    { dependencies: [locale], scope: container },
  );

  // 进屏后视频自顾自整段播完；手机额外挂定时换段。离屏复位。
  useEffect(() => {
    swapCallRef.current?.kill();
    swapCallRef.current = null;
    videoHandleRef.current?.pause();

    if (!isActive) {
      copyStageRef.current = 0;
      swapAbsorbUntilRef.current = 0;
      lastAbsorbedDownAtRef.current = 0;
      hasPlayedFirstCopyEntranceRef.current = false;
      textTimelineRef.current?.pause().progress(0);
      videoHandleRef.current?.seekTo(0);
      return;
    }

    if (reducedMotion) {
      copyStageRef.current = 1;
      textTimelineRef.current?.progress(1);
      videoHandleRef.current?.seekTo(1);
      return;
    }

    if (isMobileViewport && copyStageRef.current === 0) {
      swapCallRef.current = gsap.delayedCall(MOBILE_TEXT_SWAP_DELAY, () => {
        copyStageRef.current = 1;
        textTimelineRef.current?.play();
        swapCallRef.current = null;
      });
    }

    const videoHandle = videoHandleRef.current;
    if (videoReady) {
      videoHandle?.playToEnd(AUTO_DURATION);
    }

    return () => {
      swapCallRef.current?.kill();
      swapCallRef.current = null;
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

          {/* 卡片内文字：移动端 Figma 701:201/202 = 14px、左 67、顶 368 */}
          <div
            className={`absolute left-[8.6538%] top-[35.2%] w-[49.4%] ${
              isEnglish
                ? "-translate-y-4 md:left-[calc(var(--su)*52)] md:top-[calc(35.7%-var(--su)*36)] md:w-[calc(var(--su)*308)]"
                : "md:left-[calc(var(--su)*52)] md:top-[35.7%] md:w-[55%]"
            }`}
          >
            <div className="relative">
              <div
                data-swap-a
                data-sd-global-ignore
                className={`flex flex-col gap-3 md:gap-[calc(var(--su)*24)] ${
                  isEnglish
                    ? "md:relative md:top-[calc(var(--su)*26)] md:translate-y-5"
                    : ""
                }`}
              >
                <div
                  className={`font-serif-sc text-14 font-normal leading-[20px] text-grey-200/40 ${
                    isEnglish
                      ? "md:text-[length:calc(var(--su)*24)] md:leading-[calc(var(--su)*30)]"
                      : "md:text-[length:calc(var(--su)*24)] md:leading-normal"
                  }`}
                >
                  <ScrubText text={t("intro.line1")} revealDelay={0.4} />
                </div>
                <div
                  className={`font-serif-sc text-14 font-normal leading-[20px] text-grey-200/40 ${
                    isEnglish
                      ? "md:w-[calc(var(--su)*308)] md:text-[length:calc(var(--su)*24)] md:leading-[calc(var(--su)*36)]"
                      : "md:text-[length:calc(var(--su)*24)] md:leading-normal"
                  }`}
                >
                  <ScrubText text={t("intro.line2a")} revealDelay={0.5} />
                  <ScrubText text={t("intro.line2b")} revealDelay={0.55} />
                  <ScrubText text={t("intro.line2c")} revealDelay={0.6} />
                </div>
              </div>
              <div
                data-swap-b
                data-sd-global-ignore
                className={`absolute left-0 top-[-11px] flex w-[124.6%] flex-col gap-3 md:inset-x-0 ${
                  isEnglish
                    ? "md:top-0 md:w-[calc(var(--su)*308)] md:gap-2 md:translate-y-2.5"
                    : "md:top-[calc(var(--su)*-10)] md:w-auto md:gap-[calc(var(--su)*24)]"
                }`}
              >
                <div
                  className={`font-serif-sc text-14 font-normal leading-[20px] text-grey-200/40 ${
                    isEnglish
                      ? "md:text-[length:calc(var(--su)*24)] md:leading-[calc(var(--su)*40)]"
                      : "md:text-[length:calc(var(--su)*24)] md:leading-normal"
                  }`}
                >
                  {t("intro.bridge")
                    .split("\n")
                    .map((line, lineIndex) => (
                      <ScrubText
                        key={`${line}-${lineIndex}`}
                        text={line}
                      />
                    ))}
                </div>
                <div
                  className={`font-serif-sc text-32 font-normal leading-[46px] text-grey-200/40 ${
                    isEnglish
                      ? "md:relative md:-top-1 md:text-[length:calc(var(--su)*48)] md:leading-[calc(var(--su)*70)]"
                      : "md:text-[length:calc(var(--su)*48)] md:leading-normal"
                  }`}
                >
                  <ScrubText text={t("intro.gravity")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
