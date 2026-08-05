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
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { SectionBackground } from "@/components/ui/section-background";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import archiveBgImg from "../../public/archive/archive-bg.png";
import archiveFolderImg from "../../public/archive/archive-folder.png";

gsap.registerPlugin(useGSAP);

const FOLDER_VIDEO_WEBM = "/archive/archive-folder-anim.webm";
const FOLDER_VIDEO_HEVC = "/archive/archive-folder-anim-hevc.mp4";
/** 每像素滚动推进的进度量：两段文字 + 切换全程约需 3000px 滚动 */
const SCRUB_PER_PX = 0.00033;
/** 进度追踪的阻尼系数（数值越大跟手越紧，越小拖拽感越强） */
const SCRUB_DAMPING = 6;

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

  // 渲染期间锁存：一旦解锁过就保持允许（序幕重播时不重新卸载视频）
  if (!navigationLocked && !videoAllowed) {
    setVideoAllowed(true);
  }

  // 进屏入场：logo 与文字逐行带角度浮现（参考 museosansevero.it 的文字入场）
  useGSAP(
    () => {
      const root = container.current;
      if (!root || !isActive || reducedMotion) return;
      const lines = gsap.utils.toArray<HTMLElement>(
        "[data-intro-line], [data-swap-a] p",
        root,
      );
      if (!lines.length) return;
      gsap.from(lines, {
        autoAlpha: 0,
        y: 20,
        rotate: 5,
        transformOrigin: "50% 50%",
        duration: 1,
        ease: "expo.out",
        delay: 0.4,
        stagger: 0.07,
      });
    },
    { dependencies: [isActive, reducedMotion], scope: container },
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
      //  0 ~ 38  第一段文字逐字由灰变黑
      // 38 ~ 56  文案切换：第一段上滑淡出、第二段（引力）上滑淡入
      // 56 ~ 90  第二段文字逐字由灰变黑
      // 90 ~ 100 收尾留白：视频最后才织合完毕（两段文字完成之后）
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
            duration: 10,
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
          44,
        )
        .to(
          charsB,
          {
            color: "var(--color-grey-400)",
            duration: 8,
            ease: "none",
            stagger: { amount: 26 },
          },
          56,
        )
        // 空拍占位，把时间轴总长撑到 100：文字在 90% 处完成，视频擦拭到 100% 才结束
        .to(root, { duration: 10 }, 90);
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
    { scope: container },
  );

  const showVideo = videoAllowed && !reducedMotion && !videoFailed;
  const showPoster = !showVideo || !videoReady;

  return (
    <section
      ref={container}
      className="relative h-full min-h-[700px] overflow-hidden bg-white"
    >
      {/* 鼠标排斥滤镜：分屏内图片、文字全部参与变形 */}
      <RepelFilter className="absolute inset-0">
      <SectionBackground src={archiveBgImg} className="z-10" />

      <div className="absolute inset-0 z-20">
        {/* 档案夹卡片：设计稿 670x500，垂直中心略低于屏幕中心 11px */}
        <div className="absolute left-1/2 top-[calc(50%+11px)] aspect-[670/500] w-[min(670px,calc(100vw-60px))] -translate-x-1/2 -translate-y-1/2 text-[length:calc(min(670px,100vw-60px)/41.875)]">
          {/* 投影：设计稿手绘投影图形 1:1 还原（SVG 画布含模糊出血，按设计坐标定位） */}
          <span
            aria-hidden="true"
            className="absolute left-[-2.57%] top-[1.76%] block h-[119.8%] w-[111.64%]"
          >
            <Image src="/archive/folder-shadow.svg" alt="" fill sizes="70vw" />
          </span>

          {/* 静态占位（视频首帧就绪前 / 降级时显示） */}
          {showPoster && (
            <Image
              src={archiveFolderImg}
              alt="档案 GA_001 档案夹"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 670px, 100vw"
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

          {/* 卡片内文字：擦拭阶段文案与终段文案（引力）叠放，滚动到头后丝滑切换 */}
          <div className="absolute left-[9.4%] top-[28.2%] flex w-[46%] flex-col gap-[1em]">
            <Image
              src="/archive/archive-logo.svg"
              alt=""
              width={48}
              height={48}
              data-intro-line
              className="size-[3em]"
            />
            <div className="relative">
              <div data-swap-a className="flex flex-col gap-[1em]">
                <div className="font-serif-sc text-[1.75em] uppercase text-grey-200">
                  <ScrubText text="我们不断看到同一种现象" />
                </div>
                <div className="font-serif-sc text-[1.75em] uppercase text-grey-200">
                  <ScrubText text="有些品牌会被记住" />
                  <ScrubText text="有些产品会被选择" />
                  <ScrubText text="有些设计会被相信" />
                </div>
              </div>
              <div
                data-swap-b
                className="absolute inset-x-0 top-0 flex flex-col gap-[0.5em]"
              >
                <div className="font-serif-sc text-[1.75em] text-grey-200 opacity-0">
                  <ScrubText text="人与品牌、产品与体验之间，始终存在一种看不见的连接，我们称它为——" />
                </div>
                <div className="font-serif-sc text-[3.5em] text-grey-200 opacity-0">
                  <ScrubText text="引力" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </RepelFilter>
    </section>
  );
}
