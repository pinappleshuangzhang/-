"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
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
import archiveFolderImg from "../../public/archive/archive-folder.webp";

gsap.registerPlugin(useGSAP);

const FOLDER_VIDEO_WEBM = "/archive/archive-folder-anim.webm";
const FOLDER_VIDEO_HEVC = "/archive/archive-folder-anim-hevc.mp4";
/** 每像素滚动推进的进度量：两段文字 + 间隔 + 切换全程约需 6700px 滚动 */
const SCRUB_PER_PX = 0.00015;
/** 进度追踪的阻尼系数（数值越大跟手越紧，越小拖拽感越强） */
const SCRUB_DAMPING = 3;

/** 逐字变色文本：每个字一个 span，供擦撦时间轴按字点亮 */
function ScrubText({ text }: { text: string }) {
  return (
    <p aria-label={text}>
      {Array.from(text).map((char, charIndex) => (
        <span key={charIndex} data-scrub-char aria-hidden="true">
          {char}
        </span>
      ))}
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
  const videoHandleRef = useRef<AlphaScrubVideoHandle>(null);
  const textTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const targetRef = useRef(0);
  const displayRef = useRef(0);

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
      //  38 ~ 57   第一段带角度上滑淡出（与入场动效同款，完全退场）
      //  57 ~ 72   空档：两段之间的停顿，继续滚动才带出第二段（阻尼间隔）
      //  72 ~ 88   第二段（引力）带角度上滑淡入
      //  90 ~ 124  第二段文字逐字由灰变黑
      // 124 ~ 132  收尾留白：视频最后才织合完毕（两段文字完成之后）
      const charsA = gsap.utils.toArray<HTMLElement>(
        "[data-swap-a] [data-scrub-char]",
        root,
      );
      const charsB = gsap.utils.toArray<HTMLElement>(
        "[data-swap-b] [data-scrub-char]",
        root,
      );
      const blocksA = gsap.utils.toArray<HTMLElement>("[data-swap-a] > *", root);
      const blocksB = gsap.utils.toArray<HTMLElement>("[data-swap-b] > *", root);
      gsap.set(blocksB, { autoAlpha: 0, y: "1.2em", rotate: 5 });

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
          blocksA,
          {
            autoAlpha: 0,
            y: "-0.9em",
            rotate: -5,
            transformOrigin: "0% 50%",
            duration: 16,
            ease: "power2.in",
            stagger: 3,
          },
          38,
        )
        .to(
          blocksB,
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            duration: 12,
            ease: "power3.out",
            stagger: 4,
          },
          72,
        )
        .to(
          charsB,
          {
            color: "var(--color-grey-400)",
            duration: 8,
            ease: "none",
            stagger: { amount: 26 },
          },
          90,
        )
        // 空拍占位，把时间轴总长撑到 132：文字在 124 处完成，视频擦拭到最末才结束
        .to(root, { duration: 8 }, 124);
      textTimelineRef.current = timeline;

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
        {/* 档案夹卡片：Figma 486:210 = 563×420，垂直中心略低于屏幕中心 18px；内部字号基准 16px */}
        <div className="absolute left-1/2 top-[calc(50%+18px)] aspect-[563/420] w-[min(563px,calc(100vw-60px))] -translate-x-1/2 -translate-y-1/2 text-[length:calc(min(563px,100vw-60px)/35.1875)]">
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
              sizes="(min-width: 1024px) 563px, 100vw"
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

          {/* 卡片内文字：Figma 486:211 — Regular 24px / logo 36px / gap 16px */}
          <div className="absolute left-[9.2%] top-[25.7%] w-[55%]">
            <div className="relative">
              <div data-swap-a className="flex flex-col gap-[1em]">
                <Image
                  src="/archive/archive-logo.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="size-[2.25em]"
                />
                <div className="font-serif-sc text-[1.5em] font-normal uppercase text-grey-200">
                  <ScrubText text={t("intro.line1")} />
                </div>
                <div className="font-serif-sc text-[1.5em] font-normal uppercase text-grey-200">
                  <ScrubText text={t("intro.line2a")} />
                  <ScrubText text={t("intro.line2b")} />
                  <ScrubText text={t("intro.line2c")} />
                </div>
              </div>
              <div
                data-swap-b
                className="absolute inset-x-0 top-0 flex flex-col gap-[1em]"
              >
                <Image
                  src="/archive/archive-logo.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="size-[2.25em] opacity-0"
                />
                <div className="font-serif-sc text-[1.5em] font-normal text-grey-200 opacity-0">
                  <ScrubText text={t("intro.bridge")} />
                </div>
                <div className="font-serif-sc text-[3em] font-normal text-grey-200 opacity-0">
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
