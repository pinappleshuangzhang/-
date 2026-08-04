"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import {
  buildFallbackReveal,
  buildHeroReveal,
  buildLoaderExit,
  createCounter,
} from "@/animations/hero-intro";
import { RepelFilter } from "@/components/effects/repel-filter";
import { SectionBackground } from "@/components/ui/section-background";
import { useVideoPreloader } from "@/hooks/use-video-preloader";
import archiveBoxImg from "../../public/hero/archive-box.png";
import galleryBgImg from "../../public/hero/hero-display-bg.png";
import loaderBgImg from "../../public/hero/loader-bg.png";

gsap.registerPlugin(useGSAP);

const VIDEO_SRC = "/hero/hero-intro.mp4";
const MIN_LOADING_MS = 2000;
/** 距视频结尾多少秒触发标题入场，保证与最后一帧同步 */
const REVEAL_BEFORE_END_S = 0.15;

export function Hero() {
  const container = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  const preload = useVideoPreloader(VIDEO_SRC);
  const preloadRef = useRef(preload);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);

  useEffect(() => {
    preloadRef.current = preload;
  }, [preload]);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const doneRef = useRef(false);
  const revealStartedRef = useRef(false);
  const reduceRef = useRef(false);

  // 进入时回到页面顶部：关闭浏览器滚动位置恢复，保证序幕从首屏开始
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (!doneRef.current) {
      window.scrollTo(0, 0);
    }
  }, []);

  // 序幕期间锁定滚动
  useEffect(() => {
    if (!lenis || doneRef.current || reduceRef.current) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis]);

  useGSAP(
    (_, contextSafe) => {
      const root = container.current;
      const loader = loaderRef.current;
      const videoLayer = videoLayerRef.current;
      const video = videoRef.current;
      const counterEl = counterRef.current;
      if (!root || !loader || !videoLayer || !video || !counterEl) return;

      const titleLines = gsap.utils.toArray<HTMLElement>(
        "[data-hero-title-line]",
        root,
      );
      const ornaments = gsap.utils.toArray<HTMLElement>(
        "[data-hero-ornament]",
        root,
      );

      const finish = () => {
        doneRef.current = true;
        lenisRef.current?.start();
      };

      // 降级路径：跳过（或中断）视频，直接交叉淡化到静态首屏
      const runFallback = contextSafe!(() => {
        if (revealStartedRef.current) return;
        revealStartedRef.current = true;
        video.pause();
        gsap.set(videoLayer, { autoAlpha: 0 });
        buildFallbackReveal({ loader, titleLines, ornaments }).eventCallback(
          "onComplete",
          finish,
        );
      });

      // 阶段三：最后一帧同步入场
      const runReveal = contextSafe!(() => {
        if (revealStartedRef.current) return;
        revealStartedRef.current = true;
        buildHeroReveal({
          video: videoLayer,
          titleLines,
          ornaments,
        }).eventCallback("onComplete", finish);
      });

      // 阶段二：播放全屏视频
      const startVideo = contextSafe!(() => {
        const state = preloadRef.current;
        if (state.status !== "ready" || !state.objectUrl) {
          runFallback();
          return;
        }
        video.src = state.objectUrl;
        gsap.set(videoLayer, { autoAlpha: 1 });
        buildLoaderExit(loader);
        video
          .play()
          .catch(() => runFallback());
      });

      const onTimeUpdate = () => {
        if (
          video.duration > 0 &&
          video.duration - video.currentTime <= REVEAL_BEFORE_END_S
        ) {
          runReveal();
        }
      };
      const onEnded = () => runReveal();
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("ended", onEnded);

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: reduce)", () => {
        reduceRef.current = true;
        revealStartedRef.current = true;
        gsap.set(loader, { autoAlpha: 0 });
        gsap.set(videoLayer, { autoAlpha: 0 });
        gsap.set([...titleLines, ...ornaments], {
          opacity: 1,
          yPercent: 0,
          clearProps: "transform",
        });
        finish();
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(titleLines, { yPercent: 110 });

        // 阶段一：计数器由真实下载进度驱动，并保证最短节奏时长
        const counter = createCounter(counterEl);
        const startedAt = performance.now();

        const gate = window.setInterval(() => {
          const state = preloadRef.current;
          if (state.status === "error") {
            window.clearInterval(gate);
            counter.update(100);
            window.setTimeout(runFallback, 700);
            return;
          }
          const timeCap = Math.min(
            (performance.now() - startedAt) / MIN_LOADING_MS,
            1,
          );
          const target = Math.min(state.progress, timeCap) * 100;
          counter.update(target);
          if (state.status === "ready" && timeCap >= 1) {
            window.clearInterval(gate);
            counter.update(100);
            window.setTimeout(startVideo, 650);
          }
        }, 120);

        return () => {
          window.clearInterval(gate);
          counter.kill();
        };
      });

      return () => {
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("ended", onEnded);
        media.revert();
      };
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      data-nav-variant="studio"
      className="relative h-screen min-h-[700px] overflow-hidden bg-grey-100"
    >
      {/* 鼠标排斥滤镜：分屏内视频、图片、文字全部参与变形 */}
      <RepelFilter className="absolute inset-0">
      {/* 最终首屏背景（与视频最后一帧一致，全屏铺满） */}
      <SectionBackground src={galleryBgImg} priority className="z-10" />

      {/* 全屏视频层 */}
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

      {/* 最终首屏内容：大小标题 + 滚动提示 */}
      <div className="absolute inset-0 z-30">
        {/* 标题组：导航（top 30 + 高 40）下方 44px */}
        <div className="absolute inset-x-0 top-[114px] flex flex-col items-center gap-2 px-10">
          <div className="relative">
            <div className="overflow-hidden">
              <h1
                data-hero-title-line
                className="font-serif-sc text-52 font-medium uppercase text-grey-400 opacity-0 motion-reduce:opacity-100"
              >
                万有引力设计档案室
              </h1>
            </div>
            <span
              data-hero-ornament
              className="absolute -right-10 top-0 size-[33px] opacity-0 motion-reduce:opacity-100"
            >
              <Image src="/hero/hero-mark.svg" alt="" width={33} height={33} />
            </span>
          </div>
          <div className="overflow-hidden">
            <p
              data-hero-title-line
              className="font-serif-sc text-18 font-light uppercase text-grey-400 opacity-0 motion-reduce:opacity-100"
            >
              请跟随设计调查记录，完成本次关于&ldquo;引力&rdquo;的探索
            </p>
          </div>
        </div>
      </div>

      {/* 加载序幕层 */}
      <div
        ref={loaderRef}
        className="absolute inset-0 z-40 motion-reduce:hidden"
      >
        <Image
          src={loaderBgImg}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover"
        />
        {/* 档案盒：尺寸随视口收缩，内部文字以 em 随盒等比缩放（基准 533px = 16px 字号） */}
        <div
          className="absolute left-1/2 top-1/2 h-[min(533px,64vh)] w-[min(533px,64vh)] -translate-x-1/2 -translate-y-1/2 text-[length:calc(min(533px,64vh)/33.3125)]"
        >
          <span className="absolute -left-[5.8%] top-[0.4%] block h-[123.6%] w-[115.4%]">
            <Image src="/hero/archive-shadow.svg" alt="" fill sizes="50vw" />
          </span>
          <Image
            src={archiveBoxImg}
            alt="万有引力档案盒"
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 533px, 64vh"
            className="object-contain"
          />
          <div className="absolute left-[31.3%] top-[43.2%] flex w-[39%] flex-col gap-[1em]">
            <div className="flex flex-col gap-[0.5em]">
              <Image
                src="/hero/loader-mark.svg"
                alt=""
                width={20}
                height={18}
                className="h-[1.125em] w-[1.25em]"
              />
              <p className="font-serif-sc text-[1.25em] font-medium uppercase text-grey-400">
                万有引力设计档案室
              </p>
            </div>
            {/* 0.5px 细密点线（1px 段 + 1px 空），复刻设计稿 Vector 20 */}
            <div className="h-[0.5px] w-full bg-[repeating-linear-gradient(to_right,var(--color-grey-300)_0,var(--color-grey-300)_1px,transparent_1px,transparent_2px)]" />
            <div className="flex flex-col gap-[0.5em]">
              <p className="font-serif-sc text-[0.875em] uppercase text-grey-400">
                临时身份 - 041
              </p>
              <div className="flex flex-col gap-[0.75em]">
                <p className="font-serif-sc text-[0.875em] uppercase text-grey-400">
                  正在建立权限
                </p>
                <p
                  ref={counterRef}
                  className="font-bodoni text-[3.25em] leading-none text-grey-400"
                  aria-live="polite"
                >
                  0%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </RepelFilter>
    </section>
  );
}
