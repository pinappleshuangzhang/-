"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  KeyedScrubVideo,
  type KeyedScrubVideoHandle,
} from "@/components/effects/keyed-scrub-video";
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

const FOLDER_VIDEO_SRC = "/archive/archive-folder-anim.mp4";
/** 每像素滚动推进的进度量：全程约需 1100px 滚动 */
const SCRUB_PER_PX = 0.0009;
/** 进度追踪的阻尼系数（数值越大跟手越紧） */
const SCRUB_DAMPING = 9;

/**
 * 第二屏：档案 GA_001《什么是引力？》
 * 档案夹是一段"破洞织合"视频：滚轮/触摸控制播放进度（黑底由 WebGL 实时抠除），
 * 旁边三行文字随进度由灰变黑；进度到头后继续滚动才切屏。
 */
export function ArchiveIntro() {
  const container = useRef<HTMLElement>(null);
  const videoHandleRef = useRef<KeyedScrubVideoHandle>(null);
  const textTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const targetRef = useRef(0);
  const displayRef = useRef(0);

  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { registerScrollInterceptor } = useSectionPager();

  // 屏内滚动拦截：先推进视频进度，两端到头才放行切屏
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

      // 文字灰变黑时间轴：三行依次点亮，进度由擦撦驱动
      const lines = gsap.utils.toArray<HTMLElement>("[data-scrub-text]", root);
      const timeline = gsap.timeline({ paused: true });
      lines.forEach((line) => {
        timeline.to(line, {
          color: "var(--color-grey-400)",
          duration: 1,
          ease: "none",
        });
      });
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

  const showVideo = !reducedMotion && !videoFailed;
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

          {/* 擦撦视频：画布比卡片外扩，使视频中的档案夹与卡片对齐 */}
          {showVideo && (
            <KeyedScrubVideo
              ref={videoHandleRef}
              src={FOLDER_VIDEO_SRC}
              onFirstFrame={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
              className="absolute left-[-2.52%] top-[-1.48%] h-[102.46%] w-[104.92%]"
            />
          )}

          {/* 卡片内文字 */}
          <div className="absolute left-[9.4%] top-[28.2%] flex w-[46%] flex-col gap-[1em]">
            <Image
              src="/archive/archive-logo.svg"
              alt=""
              width={48}
              height={48}
              className="size-[3em]"
            />
            <p className="font-serif-sc text-[1.75em] uppercase text-grey-400">
              我们不断看到同一种现象
            </p>
            <div className="font-serif-sc text-[1.75em] uppercase text-grey-200">
              <p>
                <span className="text-grey-400">有些品牌</span>
                <span data-scrub-text>会被记住</span>
              </p>
              <p data-scrub-text>有些产品会被选择</p>
              <p data-scrub-text>有些设计会被相信</p>
            </div>
          </div>
        </div>
      </div>
      </RepelFilter>
    </section>
  );
}
