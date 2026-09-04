"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  buildFallbackReveal,
  buildHeroReveal,
  buildLoaderExit,
  createLoaderProgress,
  LOADER_FAILSAFE_MS,
  LOADER_HOLD_MS,
  LOADER_MIN_DURATION_MS,
} from "@/animations/hero-intro";
import {
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import { RepelFilter } from "@/components/effects/repel-filter";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useHeroPreloader } from "@/hooks/use-hero-preloader";
import { HeroLoader, LOADER_ASSET_PATHS } from "@/sections/hero-loader";
import mobileFinalBgImg from "../../public/hero/hero-mobile-final-bg.webp";

gsap.registerPlugin(useGSAP);

const VIDEO_SRC = "/hero/hero-intro.mp4";
/** 是否播放开场视频；true 时视频下载进度计入加载屏 */
const SHOW_INTRO_VIDEO = false;
/** 距视频结尾多少秒触发标题入场，保证与最后一帧同步 */
const REVEAL_BEFORE_END_S = 0.15;

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

  const preload = useHeroPreloader(VIDEO_SRC, LOADER_ASSET_PATHS, {
    videoEnabled: SHOW_INTRO_VIDEO,
  });
  const preloadRef = useRef(preload);
  const { locale, t } = useLocale();
  // 分页器默认锁定，序幕结束后由此放行切屏
  const { setNavigationLocked, registerTopOverscroll, runWithCurtain } =
    useSectionPager();
  const firstFrameRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!doneRef.current) return;
    setSondavenVisible(container.current);
  }, [locale]);

  // 独立于 GSAP 媒体查询的保险：即使 Safari 未触发 matchMedia 回调，
  // 也不能让加载层和分页锁永久留在页面上。
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (doneRef.current) return;
      const loader = loaderRef.current;
      const videoLayer = videoLayerRef.current;
      if (loader) gsap.set(loader, { autoAlpha: 0 });
      if (videoLayer) gsap.set(videoLayer, { autoAlpha: 0 });
      setSondavenVisible(container.current);
      doneRef.current = true;
      setNavigationLocked(false);
    }, LOADER_FAILSAFE_MS);

    return () => window.clearTimeout(timeout);
  }, [setNavigationLocked]);

  useGSAP(
    (_, contextSafe) => {
      const root = container.current;
      const loader = loaderRef.current;
      const videoLayer = videoLayerRef.current;
      const video = videoRef.current;
      if (!root || !loader || !videoLayer || !video) return;

      const wipe = loader.querySelector<HTMLElement>("[data-loader-wipe]");
      const status = loader.querySelector<HTMLElement>("[data-loader-status]");
      const phase = loader.querySelector<HTMLElement>("[data-loader-phase]");
      const percent = loader.querySelector<HTMLElement>("[data-loader-percent]");
      if (!wipe || !status || !phase || !percent) return;

      const finish = () => {
        setSondavenVisible(root);
        doneRef.current = true;
        setNavigationLocked(false);
      };

      // 首帧静帧淡入：加载层退场时露出 Figma 01首屏-1 画面
      const showFirstFrame = () => {
        const firstFrame = firstFrameRef.current;
        if (firstFrame) {
          gsap.to(firstFrame, {
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      };

      // 降级路径：跳过（或中断）视频，直接交叉淡化到静态首屏
      const runFallback = contextSafe!(() => {
        if (revealStartedRef.current) return;
        revealStartedRef.current = true;
        video.pause();
        gsap.set(videoLayer, { autoAlpha: 0 });
        showFirstFrame();
        buildFallbackReveal({ loader, root }).eventCallback("onComplete", finish);
      });

      // 阶段三：最后一帧同步入场；同时交叉淡出视频层，
      // 露出下方 4K 静态图（Figma 01首屏-2 指定画面，比视频末帧更干净）
      const runReveal = contextSafe!(() => {
        if (revealStartedRef.current) return;
        revealStartedRef.current = true;
        gsap.to(videoLayer, { autoAlpha: 0, duration: 1, ease: "power2.out" });
        showFirstFrame();
        buildHeroReveal(root).eventCallback("onComplete", finish);
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
        gsap.set(firstFrameRef.current, { autoAlpha: 1 });
        setSondavenVisible(root);
        finish();
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const loaderProgress = createLoaderProgress({
          wipe,
          status,
          phase,
          percent,
        });
        let gate = 0;
        let startedAt = 0;

        const releaseLoader = (next: () => void) => {
          window.clearInterval(gate);
          loaderProgress.update(100);
          window.setTimeout(next, LOADER_HOLD_MS);
        };

        const startSequence = () => {
          window.clearInterval(gate);
          loaderProgress.reset();
          startedAt = performance.now();

          gate = window.setInterval(() => {
            const state = preloadRef.current;
            const timeProgress = Math.min(
              (performance.now() - startedAt) / LOADER_MIN_DURATION_MS,
              1,
            );

            if (state.status === "error") {
              loaderProgress.update(timeProgress * 100);
              if (timeProgress >= 1) releaseLoader(runFallback);
              return;
            }

            loaderProgress.update(Math.min(state.progress, timeProgress) * 100);
            if (state.status === "ready" && timeProgress >= 1) {
              releaseLoader(SHOW_INTRO_VIDEO ? startVideo : runFallback);
            }
          }, 50);
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
              loaderProgress.reset();
              video.pause();
              gsap.set(loader, { autoAlpha: 1 });
              gsap.set(videoLayer, { autoAlpha: 0 });
              gsap.set(firstFrameRef.current, { autoAlpha: 0 });
              setSondavenHidden(root);
              startSequence();
            }),
          );
        });

        return () => {
          window.clearInterval(gate);
          loaderProgress.kill();
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

  const subtitle = t("hero.subtitle");
  const highlight =
    locale === "zh" ? '"引力"的探索' : "Explore Gravity Together";
  const highlightIndex = subtitle.lastIndexOf(highlight);
  const subtitlePrefix =
    highlightIndex >= 0 ? subtitle.slice(0, highlightIndex) : subtitle;
  const subtitleHighlight = highlightIndex >= 0 ? highlight : "";

  return (
    <ScreenShell ref={container}>
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

      {/* 首屏首帧：Figma 01首屏-1 静帧，加载层退场时淡入 */}
      <div
        ref={firstFrameRef}
        className="invisible absolute inset-0 z-20 opacity-0"
      >
        <Image
          src="/hero/hero-loader-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
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
        <div
          className={`absolute left-1/2 top-[103px] flex -translate-x-1/2 flex-col items-center gap-2 text-center md:hidden ${
            locale === "zh" ? "w-[290px]" : "w-[366px]"
          }`}
        >
          <h1
            data-sd-words
            data-sd-delay="0.15"
            aria-label={t("hero.title")}
            className={`whitespace-nowrap font-serif-sc font-medium uppercase text-grey-400 ${
              locale === "zh"
                ? "text-32 leading-[48px]"
                : "text-28 leading-[48px]"
            }`}
          >
            <SplitWords text={t("hero.title")} />
          </h1>
          <div className="flex w-full flex-col items-center gap-2">
            <p
              data-sd-words
              data-sd-delay="0.3"
              aria-label={subtitle}
              className={`w-full whitespace-nowrap font-serif-sc uppercase text-grey-400 ${
                locale === "zh"
                  ? "text-12 leading-[18px]"
                  : "text-14 leading-[20px]"
              }`}
            >
              <SplitWords text={subtitlePrefix} />
            </p>
            {subtitleHighlight ? (
              <p
                data-sd-words
                data-sd-delay="0.3"
                aria-hidden="true"
                className={`relative -top-px whitespace-nowrap font-serif-sc uppercase text-white ${
                  locale === "zh"
                    ? "h-[17px] w-[88px] px-2 text-12 leading-[18px]"
                    : "h-[20px] w-auto px-2.5 text-14 leading-[20px]"
                }`}
              >
                <span
                  data-sd-bar
                  data-sd-delay="0.3"
                  aria-hidden="true"
                  className={`absolute inset-0 origin-left bg-grey-400 ${
                    locale === "zh" ? "scale-x-0" : "scale-x-100"
                  }`}
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
          className={`absolute top-[126px] hidden items-start gap-2 text-left ${
            locale === "zh"
              ? "right-[92px] w-[432px] -translate-x-[2.6px] flex-col md:flex"
              : "left-[calc(100%-527px)] w-max grid-cols-[max-content] md:grid"
          }`}
        >
          <h1
            data-sd-words
            data-sd-delay="0.15"
            aria-label={t("hero.title")}
            className={`whitespace-nowrap font-serif-sc font-medium uppercase text-grey-400 ${
              locale === "zh" ? "text-48" : "text-40"
            }`}
          >
            <SplitWords text={t("hero.title")} />
          </h1>
          <p
            data-sd-words
            data-sd-delay="0.3"
            aria-label={subtitle}
            className={`whitespace-nowrap font-serif-sc uppercase text-grey-400 ${
              locale === "zh"
                ? "w-full text-left text-16"
                : "flex w-full items-stretch text-left text-14"
            }`}
          >
            <span className={locale === "zh" ? undefined : "mr-1 shrink-0"}>
              <SplitWords
                text={
                  locale === "zh" ? subtitlePrefix : subtitlePrefix.trimEnd()
                }
              />
            </span>
            {subtitleHighlight ? (
              <span
                className={`relative inline-block text-white ${
                  locale === "zh" ? "pr-9" : "min-w-0 flex-1"
                }`}
              >
                <span
                  data-sd-bar
                  data-sd-delay="0.3"
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 top-0 origin-left bg-grey-400 ${
                    locale === "zh"
                      ? "right-0 scale-x-0"
                      : "right-0 scale-x-100"
                  }`}
                />
                <span className="relative">
                  <SplitWords text={subtitleHighlight} />
                </span>
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* 加载序幕：浅色渐变按进度铺开，裁切露出证件 */}
      <div
        ref={loaderRef}
        className="absolute inset-0 z-40 bg-grey-400 motion-reduce:hidden"
      >
        <HeroLoader
          roleLabel={t("loader.role")}
          idLabel={t("loader.id")}
          applyLabel={t("loader.apply")}
          reviewLabel={t("loader.review")}
          approvedLabel={t("loader.approved")}
          cardAlt={t("loader.cardAlt")}
        />
      </div>
      </RepelFilter>
    </ScreenShell>
  );
}
