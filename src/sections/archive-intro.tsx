"use client";

import { useEffect, useRef, useState } from "react";
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
import { RepelFilter } from "@/components/effects/repel-filter";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import archiveFolderImg from "../../public/archive/archive-folder-cool-alpha.webp";

gsap.registerPlugin(useGSAP);

const FOLDER_VIDEO_WEBM = "/archive/archive-folder-cool-alpha.webm";
const FOLDER_VIDEO_HEVC = "/archive/archive-folder-cool-alpha-hevc.mp4";
/** 每像素滚动推进的进度量：两段文字 + 间隔 + 切换全程约需 6700px 滚动 */
const SCRUB_PER_PX = 0.00015;
/** 进度追踪的阻尼系数（数值越大跟手越紧，越小拖拽感越强） */
const SCRUB_DAMPING = 3;
/** 第一段开始退场的主时间轴节点（总时长 132） */
const FIRST_COPY_EXIT_PROGRESS = 38 / 132;

/** 按词切分：与第三屏 Son Daven 式逐词入场的规则保持一致。 */
function segmentWords(text: string): string[] {
  const attachClosingPunctuation = (segments: string[]) =>
    segments.reduce<string[]>((words, segment) => {
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
 * 档案夹是一段"破洞织合"透明视频（自带 alpha 通道）：滚轮/触摸控制播放进度，
 * 旁边三行文字随进度由灰变黑；进度到头后继续滚动才切屏。
 */
export function ArchiveIntro() {
  const container = useRef<HTMLElement>(null);
  const cornerTitlesRef = useRef<HTMLDivElement>(null);
  const videoHandleRef = useRef<AlphaScrubVideoHandle>(null);
  const textTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const targetRef = useRef(0);
  const displayRef = useRef(0);
  const hasPlayedFirstCopyEntranceRef = useRef(false);

  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  // 首屏序幕结束（导航解锁）后才开始加载视频，避免和首屏视频抢带宽
  const [videoAllowed, setVideoAllowed] = useState(false);

  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { registerScrollInterceptor, navigationLocked } = useSectionPager();
  const { t, locale } = useLocale();

  // 渲染期间锁存：一旦解锁过就保持允许（序幕重播时不重新卸载视频）
  if (!navigationLocked && !videoAllowed) {
    setVideoAllowed(true);
  }

  // 中间文案复用第三屏的 Son Daven 式随机逐词上浮入场。
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
        // 首次进入前才预设隐藏；离开后保留当前段落状态，返回时不重播第一段。
        if (!hasPlayedFirstCopyEntranceRef.current) {
          setSondavenHidden(primaryCopy);
        }
        return;
      }
      if (hasPlayedFirstCopyEntranceRef.current) {
        // locale 切换会重建词节点；第一段尚未退场时，直接恢复其最终可见状态。
        if (displayRef.current < FIRST_COPY_EXIT_PROGRESS) {
          setSondavenVisible(primaryCopy);
        }
        return;
      }

      hasPlayedFirstCopyEntranceRef.current = true;
      playSondavenReveal(primaryCopy);
    },
    { dependencies: [isActive, reducedMotion, locale], scope: container },
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

  // 屏内滚动拦截：先推进屏内进度（文字 + 切换 + 视频），两端到头才放行切屏
  useEffect(() => {
    if (!isActive || reducedMotion || videoFailed) return;
    return registerScrollInterceptor((deltaY) => {
      const target = targetRef.current;
      if (deltaY > 0 && target >= 1) return false;
      if (deltaY < 0 && target <= 0) return false;
      targetRef.current = Math.min(
        1,
        Math.max(0, target + deltaY * SCRUB_PER_PX),
      );
      return true;
    });
  }, [isActive, reducedMotion, videoFailed, registerScrollInterceptor]);

  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;

      // 主时间轴（进度由滚动擦拭驱动，单位为“进度百分点”）：
      //   0 ~ 38   第一段文字逐字由灰变黑
      //  38 ~ 50   第一段逐词缩小、下沉、淡出（第三屏入场动画的反向）
      //  50 ~ 60   两段之间的短暂停顿
      //  60 ~ 75   第二段逐词上浮入场
      //  80 ~ 114  第二段文字逐字由灰变黑
      // 124 ~ 132  收尾留白：视频最后才织合完毕（两段文字完成之后）
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
      // 第二段在切换前保持第三屏同款的逐词隐藏姿态。
      gsap.set(wordsB, { opacity: 0, yPercent: 75, scale: 0 });

      const timeline = gsap.timeline({ paused: true });
      timeline
        .to(
          charsA,
          {
            color: "var(--color-grey-400)",
            duration: 8,
            ease: "none",
            stagger: { amount: 30 },
          },
          0,
        )
        .to(
          shuffledWordsA,
          {
            opacity: 0,
            yPercent: 75,
            scale: 0,
            duration: 8,
            ease: "power2.in",
            stagger: { amount: 4 },
          },
          38,
        )
        .to(
          shuffledWordsB,
          {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            duration: 8,
            ease: "power2.out",
            stagger: 0.4,
          },
          60,
        )
        .to(
          charsB,
          {
            color: "var(--color-grey-400)",
            duration: 8,
            ease: "none",
            stagger: { amount: 26 },
          },
          80,
        )
        // 空拍占位，把时间轴总长撑到 132：文字在 124 处完成，视频擦拭到最末才结束
        .to(root, { duration: 8 }, 124);
      textTimelineRef.current = timeline;
      // locale 切换会重建文案节点；立即同步当前擦拭进度，避免新节点停在初始隐藏态。
      timeline.progress(displayRef.current);

      // 阻尼追踪：滚动只改目标值，逐帧平滑逼近后再驱动视频与文字
      const tick = (_time: number, deltaTime: number) => {
        const target = targetRef.current;
        let display = displayRef.current;
        if (display === target) return;
        const blend = 1 - Math.exp((-SCRUB_DAMPING * deltaTime) / 1000);
        display += (target - display) * blend;
        if (Math.abs(target - display) < 0.0005) display = target;
        displayRef.current = display;
        videoHandleRef.current?.seekTo(display);
        textTimelineRef.current?.progress(display);
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        textTimelineRef.current = null;
      };
    },
    { dependencies: [locale], scope: container },
  );

  const showVideo = videoAllowed && !reducedMotion && !videoFailed;
  const showPoster = !showVideo || !videoReady;

  return (
    <ScreenShell ref={container}>
      {/* 鼠标排斥滤镜：分屏内图片、文字全部参与变形 */}
      <RepelFilter className="absolute inset-0">
      <div className="absolute inset-0 z-20">
        {/* Figma 790:324 / 790:325：页面上下两处装饰性大标题 */}
        <div
          ref={cornerTitlesRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <p
            data-title-what-is
            className="absolute left-[3.0769%] top-[21.6825%] font-bodoni text-44 font-normal leading-[55px] text-grey-400 md:left-[calc(50%-615px)] md:top-[calc(50%-244px)] md:text-100 md:leading-[125px]"
          >
            WHAT IS
          </p>
          <p
            data-title-gravity
            className="absolute left-[46.9231%] top-[68.365%] font-bodoni text-44 font-normal leading-[55px] text-grey-400 md:left-[calc(50%+193px)] md:top-[calc(50%+176px)] md:text-100 md:leading-[125px]"
          >
            GRAVITY
          </p>
        </div>

        {/* 档案夹卡片：桌面 563×420；移动端 Figma 701:204 = 312×233 */}
        <div className="absolute left-[calc(50%+1px)] top-[47.69%] aspect-[563/420] w-[80%] -translate-x-1/2 -translate-y-1/2 text-14 md:left-[calc(50%+4px)] md:top-[calc(50%+18px)] md:w-[min(563px,calc(100vw-40px))] md:text-[length:calc(min(563px,100vw-40px)/35.1875)]">
          {/* 投影：设计稿手绘投影图形 1:1 还原（SVG 画布含模糊出血，按设计坐标定位） */}
          <span
            aria-hidden="true"
            className="absolute left-[-2.57%] top-[1.76%] block h-[119.8%] w-[111.64%]"
          >
            <Image src="/archive/folder-shadow.svg" alt="" fill sizes="60vw" />
          </span>

          {/* 静态占位（视频首帧就绪前 / 降级时显示） */}
          {showPoster && (
            <Image
              src={archiveFolderImg}
              alt={t("intro.folderAlt")}
              fill
              placeholder="blur"
              sizes="(min-width: 768px) 563px, 80vw"
              className="object-contain"
            />
          )}

          {/* 擦拭视频（自带 alpha 通道）：画布比卡片外扩，使视频中的档案夹与卡片对齐
              （偏移按视频 1112x834 中透明内容包围盒 x22..1094 / y8..834 计算） */}
          {showVideo && (
            <AlphaScrubVideo
              ref={videoHandleRef}
              srcWebm={FOLDER_VIDEO_WEBM}
              srcHevc={FOLDER_VIDEO_HEVC}
              onFirstFrame={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
              className="absolute left-[-2.05%] top-[-0.97%] h-[100.97%] w-[103.73%]"
            />
          )}

          {/* 卡片内文字：移动端 Figma 701:201/202 = 14px、左 67、顶 368 */}
          <div className="absolute left-[3.5256%] top-[35.2%] w-[49.4%] md:left-[36px] md:top-[35.7%] md:w-[55%]">
            <div className="relative">
              <div data-swap-a className="flex flex-col gap-3 md:gap-[1em]">
                <div className="font-serif-sc text-14 font-normal leading-[20px] text-grey-200 md:text-[1.5em] md:leading-normal">
                  <ScrubText text={t("intro.line1")} revealDelay={0.4} />
                </div>
                <div className="font-serif-sc text-14 font-normal leading-[20px] text-grey-200 md:text-[1.5em] md:leading-normal">
                  <ScrubText text={t("intro.line2a")} revealDelay={0.5} />
                  <ScrubText text={t("intro.line2b")} revealDelay={0.55} />
                  <ScrubText text={t("intro.line2c")} revealDelay={0.6} />
                </div>
              </div>
              <div
                data-swap-b
                className="absolute left-0 top-[-11px] flex w-[124.6%] flex-col gap-3 md:inset-x-0 md:top-[-10px] md:w-auto md:gap-[1em]"
              >
                <div className="font-serif-sc text-14 font-normal leading-[20px] text-grey-200 md:text-[1.5em] md:leading-normal">
                  <ScrubText text={t("intro.bridge")} />
                </div>
                <div className="font-serif-sc text-32 font-normal leading-[46px] text-grey-200 md:text-[3em] md:leading-normal">
                  <ScrubText text={t("intro.gravity")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </RepelFilter>
    </ScreenShell>
  );
}
