"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  buildFallbackReveal,
  buildHeroReveal,
  buildLoaderExit,
  createCounter,
} from "@/animations/hero-intro";
import { RepelFilter } from "@/components/effects/repel-filter";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { SectionBackground } from "@/components/ui/section-background";
import { useVideoPreloader } from "@/hooks/use-video-preloader";
import galleryBgImg from "../../public/hero/hero-display-bg.png";
import loaderFirstImg from "../../public/hero/hero-loader-first.webp";

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
  // 分页器默认锁定，序幕结束后由此放行切屏
  const { setNavigationLocked, registerTopOverscroll, runWithCurtain } =
    useSectionPager();

  useEffect(() => {
    preloadRef.current = preload;
  }, [preload]);

  const doneRef = useRef(false);
  const revealStartedRef = useRef(false);
  // 序幕重播函数由动画上下文注入；在首屏继续向上滑时触发
  const replayRef = useRef<(() => void) | null>(null);

  useEffect(
    () => registerTopOverscroll(() => replayRef.current?.()),
    [registerTopOverscroll],
  );

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
        setNavigationLocked(false);
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
        buildHeroReveal({ titleLines, ornaments }).eventCallback(
          "onComplete",
          finish,
        );
      });

      // 阶段二：播放全屏视频
      const startVideo = contextSafe!(() => {
        const state = preloadRef.current;
        if (state.status !== "ready" || !state.objectUrl) {
          runFallback();
          return;
        }
        video.src = state.objectUrl;
        video.currentTime = 0;
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
        // 阶段一：计数器由真实下载进度驱动，并保证最短节奏时长
        const counter = createCounter(counterEl);
        let gate = 0;

        const startSequence = () => {
          window.clearInterval(gate);
          counter.reset();
          const startedAt = performance.now();

          gate = window.setInterval(() => {
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
        };

        startSequence();

        // 首屏继续向上滑时重播：走一次幕布过场，铺满时重置下层并重新走流程
        replayRef.current = contextSafe!(() => {
          if (!doneRef.current) return;
          runWithCurtain(
            contextSafe!(() => {
              doneRef.current = false;
              revealStartedRef.current = false;
              setNavigationLocked(true);
              counter.reset();
              video.pause();
              gsap.set(loader, { autoAlpha: 1 });
              gsap.set(videoLayer, { autoAlpha: 0 });
              gsap.set([...titleLines, ...ornaments], { autoAlpha: 0 });
              startSequence();
            }),
          );
        });

        return () => {
          window.clearInterval(gate);
          counter.kill();
          replayRef.current = null;
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
      className="relative h-full min-h-[700px] overflow-hidden bg-grey-100"
    >
      {/* 鼠标排斥滤镜：分屏内视频、图片、文字全部参与变形 */}
      <RepelFilter className="absolute inset-0">
      {/* 静态背景：仅作视频不可用 / 减少动态时的降级兜底（正常流程视频定格末帧） */}
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
            <h1
              data-hero-title-line
              className="font-serif-sc text-52 font-medium uppercase text-grey-400 opacity-0 motion-reduce:opacity-100"
            >
              万有引力设计档案室
            </h1>
            <span
              data-hero-ornament
              className="absolute -right-10 top-0 size-[33px] opacity-0 motion-reduce:opacity-100"
            >
              <Image src="/hero/hero-mark.svg" alt="" width={33} height={33} />
            </span>
          </div>
          <p
            data-hero-title-line
            className="font-serif-sc text-18 font-light uppercase text-grey-400 opacity-0 motion-reduce:opacity-100"
          >
            请跟随设计调查记录，完成本次关于&ldquo;引力&rdquo;的探索
          </p>
        </div>
      </div>

      {/* 加载序幕层：底图为视频首帧的高清渲染版，开始播放时与视频画面无缝衔接 */}
      <div
        ref={loaderRef}
        className="absolute inset-0 z-40 motion-reduce:hidden"
      >
        <Image
          src={loaderFirstImg}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover"
        />
        {/* 文字容器：对齐视频首帧中档案册封面。
            实测（4K 帧 3840x2160）：封面包围盒 x 1520~2135 / y 635~1505
            → 容器宽 = 615/3840 ≈ 16.02% cover 宽度，
            中心相对画面中心偏移 x -2.41% / y -0.26%（均以 cover 宽度为基准），
            cover 宽度 = max(100vw, 100vh*16/9)。内部文字以 em 随封面等比缩放 */}
        <div
          className="absolute left-[calc(50%-max(100vw,177.7778vh)*0.0241)] top-[calc(50%-max(100vw,177.7778vh)*0.0026)] aspect-[615/870] w-[calc(max(100vw,177.7778vh)*0.1602)] -translate-x-1/2 -translate-y-1/2 text-[length:calc(max(100vw,177.7778vh)*0.1602/18)]"
        >
          <div className="absolute left-[15%] top-[40%] flex w-[74%] flex-col gap-[1em]">
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
            <div className="flex flex-col gap-[0.1em]">
              <p className="font-serif-sc text-[0.875em] uppercase text-grey-400">
                临时身份 - 041
              </p>
              <div className="flex flex-col gap-[0.95em]">
                <p className="font-serif-sc text-[0.875em] uppercase text-grey-400">
                  正在建立权限
                </p>
                <p
                  ref={counterRef}
                  className="font-bodoni text-[3.2em] leading-none text-grey-400"
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
