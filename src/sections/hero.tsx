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
import { ScreenShell } from "@/components/ui/screen-shell";
import { useVideoPreloader } from "@/hooks/use-video-preloader";
import loaderBgImg from "../../public/hero/hero-loader-bg.webp";

gsap.registerPlugin(useGSAP);

const VIDEO_SRC = "/hero/hero-intro.mp4";
/** 是否播放开场视频；false 时加载计数结束后直接淡出到静态首屏 */
const SHOW_INTRO_VIDEO = false;
/** 距视频结尾多少秒触发标题入场，保证与最后一帧同步 */
const REVEAL_BEFORE_END_S = 0.15;

export function Hero() {
  const container = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  const preload = useVideoPreloader(VIDEO_SRC, { enabled: SHOW_INTRO_VIDEO });
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

      // 阶段三：最后一帧同步入场；同时交叉淡出视频层，
      // 露出下方 4K 静态图（Figma 01首屏-2 指定画面，比视频末帧更干净）
      const runReveal = contextSafe!(() => {
        if (revealStartedRef.current) return;
        revealStartedRef.current = true;
        gsap.to(videoLayer, { autoAlpha: 0, duration: 1, ease: "power2.out" });
        buildHeroReveal({ titleLines, ornaments }).eventCallback(
          "onComplete",
          finish,
        );
      });

      // 阶段二：等视频首帧解码就绪后先亮出定格画面（与加载层底图同画面，避免闪烁），
      // 加载层文字退场完毕后才真正开播，避免静止底图叠在动态画面上产生重影
      const startVideo = contextSafe!(() => {
        const state = preloadRef.current;
        if (state.status !== "ready" || !state.objectUrl) {
          runFallback();
          return;
        }
        const beginPlayback = contextSafe!(() => {
          gsap.set(videoLayer, { autoAlpha: 1 });
          buildLoaderExit(loader).eventCallback("onComplete", () => {
            video.play().catch(() => runFallback());
          });
        });
        video.addEventListener("loadeddata", beginPlayback, { once: true });
        video.addEventListener("error", () => runFallback(), { once: true });
        video.src = state.objectUrl;
        video.load();
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
        // 阶段一：计数器只反映真实加载进度，就绪即放行，无人为最短时长
        const counter = createCounter(counterEl);
        let gate = 0;

        const startSequence = () => {
          window.clearInterval(gate);
          counter.reset();

          gate = window.setInterval(() => {
            const state = preloadRef.current;
            if (state.status === "error") {
              window.clearInterval(gate);
              counter.update(100);
              window.setTimeout(runFallback, 700);
              return;
            }
            counter.update(state.progress * 100);
            if (state.status === "ready") {
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
    <ScreenShell ref={container}>
      {/* 鼠标排斥滤镜：分屏内视频、图片、文字全部参与变形 */}
      <RepelFilter className="absolute inset-0">
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

      {/* 最终首屏内容：大小标题 + 滚动提示 */}
      <div className="absolute inset-0 z-30">
        {/* 标题组：Figma 01首屏-2（483:48）距顶 136px */}
        <div className="absolute inset-x-0 top-[136px] flex flex-col items-center gap-2 px-10">
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
            className="font-serif-sc text-18 uppercase text-grey-400 opacity-0 motion-reduce:opacity-100"
          >
            请跟随设计调查记录，完成本次关于&ldquo;引力&rdquo;的探索
          </p>
        </div>
      </div>

      {/* 加载序幕层：Figma 01首屏-1 透视视角档案盒，册子封面文字已烘焙在图中 */}
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
        {/* 加载进度仅向屏幕阅读器播报，视觉呈现按设计稿以静态图为准 */}
        <p ref={counterRef} className="sr-only" aria-live="polite">
          0%
        </p>
      </div>
      </RepelFilter>
    </ScreenShell>
  );
}
