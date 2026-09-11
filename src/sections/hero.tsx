"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  createHeroVideoSequence,
  createLoaderMaterialCycle,
  createLoaderProgress,
  LOADER_FAILSAFE_MS,
  LOADER_HOLD_MS,
  LOADER_MIN_DURATION_MS,
  revealArchiveHold,
  revealHeroFinale,
} from "@/animations/hero-intro";
import { setSondavenVisible } from "@/animations/sondaven-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { FlipHoverButton } from "@/components/ui/flip-hover-button";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useDesktopMedia } from "@/hooks/use-desktop-media";
import { useHeroPreloader } from "@/hooks/use-hero-preloader";
import { HeroLoader, LOADER_ASSET_PATHS } from "@/sections/hero-loader";
import archiveBoxImg from "../../public/hero/hero-loader-bg.webp";
import mobileFinalBgImg from "../../public/hero/hero-mobile-final-bg.webp";
import mobileFirstFrameImg from "../../public/hero/hero-mobile-first.webp";

gsap.registerPlugin(useGSAP);

const DESKTOP_VIDEO_SRC = "/hero/hero-intro.mp4?v=202609102032";
const MOBILE_VIDEO_SRC = "/hero/hero-mobile-intro.mp4?v=202609111006";
/** 是否播放开场视频；true 时视频下载进度计入加载屏 */
const SHOW_INTRO_VIDEO = true;

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
            className="sd-word inline-block opacity-0"
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
  const isDesktop = useDesktopMedia();
  const videoSrc = isDesktop ? DESKTOP_VIDEO_SRC : MOBILE_VIDEO_SRC;

  const preload = useHeroPreloader(videoSrc, LOADER_ASSET_PATHS, {
    videoEnabled: SHOW_INTRO_VIDEO,
    timeoutMs: 45000,
  });
  const preloadRef = useRef(preload);
  const { locale, t } = useLocale();
  // 分页器默认锁定；停在档案盒页后解锁，由滚动拦截器决定是否起播视频
  const { setNavigationLocked, setIntroOverlayActive, registerScrollInterceptor } =
    useSectionPager();
  const firstFrameRef = useRef<HTMLDivElement>(null);
  const introPhaseRef = useRef<"loading" | "holding" | "playing" | "done">(
    "loading",
  );
  const startIntroVideoRef = useRef<(() => void) | null>(null);
  const skipIntroVideoRef = useRef<(() => void) | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  // 加载序幕只出现一次：退场动画结束后整体卸载，释放其 DOM 与图片内存
  const [loaderDismissed, setLoaderDismissed] = useState(false);
  // 开场流程结束后档案盒首帧与视频层不再复用，一并卸载释放内存
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    preloadRef.current = preload;
  }, [preload]);

  // 导航不靠加载层遮挡，改由此信号显式隐藏，遮罩卸载后才淡入
  useEffect(() => {
    setIntroOverlayActive(!loaderDismissed);
  }, [loaderDismissed, setIntroOverlayActive]);

  const doneRef = useRef(false);
  const revealStartedRef = useRef(false);

  useEffect(() => {
    if (introPhaseRef.current !== "done") return;
    setSondavenVisible(container.current);
  }, [locale]);

  useEffect(
    () =>
      registerScrollInterceptor((deltaY) => {
        if (introPhaseRef.current === "holding" && deltaY > 0) {
          startIntroVideoRef.current?.();
          return true;
        }
        return introPhaseRef.current === "playing";
      }),
    [registerScrollInterceptor],
  );

  useEffect(() => {
    const shouldCapture = () =>
      introPhaseRef.current === "holding" || introPhaseRef.current === "playing";

    const startIfHolding = (deltaY: number) => {
      if (introPhaseRef.current === "holding" && deltaY > 0) {
        startIntroVideoRef.current?.();
        return true;
      }
      return introPhaseRef.current === "playing";
    };

    const onWheel = (event: WheelEvent) => {
      if (!shouldCapture()) return;
      if (!startIfHolding(event.deltaY) && introPhaseRef.current !== "playing") {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldCapture()) return;
      if (
        event.key !== "ArrowDown" &&
        event.key !== "PageDown" &&
        event.key !== " "
      ) {
        return;
      }
      if (startIfHolding(1) || introPhaseRef.current === "playing") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    let touchStartY: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      if (!shouldCapture() || event.touches.length !== 1) {
        touchStartY = null;
        return;
      }
      touchStartY = event.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (!shouldCapture() || touchStartY === null) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const travelled = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(travelled) < 48) return;
      if (startIfHolding(travelled) || introPhaseRef.current === "playing") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    document.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener("touchend", onTouchEnd, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchend", onTouchEnd, true);
    };
  }, []);

  // 独立于 GSAP 媒体查询的保险：即使 Safari 未触发 matchMedia 回调，
  // 也不能让加载层和分页锁永久留在页面上。
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (doneRef.current) return;
      const loader = loaderRef.current;
      const videoLayer = videoLayerRef.current;
      const firstFrame = firstFrameRef.current;
      const lastFrame = document.querySelector<HTMLElement>(
        '[data-shared-bg="studio"]',
      );
      if (loader) gsap.set(loader, { autoAlpha: 0 });
      if (videoLayer) gsap.set(videoLayer, { autoAlpha: 0 });
      if (firstFrame) gsap.set(firstFrame, { autoAlpha: 0 });
      if (lastFrame) gsap.set(lastFrame, { autoAlpha: 1 });
      setSondavenVisible(container.current);
      introPhaseRef.current = "done";
      setShowScrollHint(false);
      doneRef.current = true;
      setNavigationLocked(false);
      setLoaderDismissed(true);
      setIntroDone(true);
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
      const isSafari =
        /safari/i.test(navigator.userAgent) &&
        !/chrome|chromium|crios|edg|android/i.test(navigator.userAgent);
      // Safari 提前呈现暂停的视频首帧，起播时复用同一合成层，避免解码器
      // 冷启动丢掉前几帧后从 WebP 静帧跳到已经缩小的画面。
      const useVideoStills =
        isSafari || window.matchMedia("(max-width: 767px)").matches;

      const materials = loader.querySelector<HTMLElement>(
        "[data-loader-materials]",
      );
      const bar = loader.querySelector<HTMLElement>("[data-loader-bar]");
      const progressbar = loader.querySelector<HTMLElement>(
        "[data-loader-progressbar]",
      );
      const phaseTrack = loader.querySelector<HTMLElement>(
        "[data-loader-phase-track]",
      );
      const percent = loader.querySelector<HTMLElement>("[data-loader-percent]");
      const live = loader.querySelector<HTMLElement>("[data-loader-live]");
      if (!materials || !bar || !progressbar || !phaseTrack || !percent || !live)
        return;

      const lastFrame = document.querySelector<HTMLElement>(
        '[data-shared-bg="studio"]',
      );

      const finish = () => {
        introPhaseRef.current = "done";
        setShowScrollHint(false);
        setShowSkip(false);
        setSondavenVisible(root);
        doneRef.current = true;
        setNavigationLocked(false);
        // 手机端继续保留暂停的视频尾帧；桌面端切到静态尾帧后释放视频层。
        if (!useVideoStills) {
          setIntroDone(true);
          const objectUrl = preloadRef.current.objectUrl;
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        }
      };

      const playStillFinale = contextSafe!(() => {
        if (introPhaseRef.current === "done") return;
        introPhaseRef.current = "done";
        setShowScrollHint(false);
        setShowSkip(false);
        video.pause();
        gsap.set(videoLayer, { autoAlpha: 0 });
        revealHeroFinale({
          firstFrame: firstFrameRef.current,
          lastFrame,
          root,
          onRevealStart: () => setNavigationLocked(false),
        }).eventCallback("onComplete", finish);
      });

      const holdOnArchive = contextSafe!(() => {
        if (revealStartedRef.current) return;
        revealStartedRef.current = true;
        introPhaseRef.current = "holding";
        setShowScrollHint(true);
        doneRef.current = true;
        gsap.set(videoLayer, { autoAlpha: 0 });
        // 导航先在加载层下方就位，由双层上裁自然揭开，避免退场后再挂载造成闪现。
        setNavigationLocked(false);
        revealArchiveHold({
          loader,
          firstFrame: firstFrameRef.current,
          lastFrame,
          root,
        }).eventCallback("onComplete", () => {
          setLoaderDismissed(true);
        });
      });

      let activeVideo: {
        prepare: () => void;
        showFirstFrame: (onReady: () => void) => void;
        start: () => void;
        skip: () => void;
        kill: () => void;
      } | null = null;

      const ensureVideo = () => {
        const state = preloadRef.current;
        if (state.status !== "ready" || !state.objectUrl) return null;
        if (!activeVideo) {
          activeVideo = createHeroVideoSequence({
            video,
            videoLayer,
            firstFrame: firstFrameRef.current,
            root,
            objectUrl: state.objectUrl,
            useVideoStills,
            onPlaying: () => setShowSkip(true),
            onRevealStart: () => setShowSkip(false),
            onComplete: finish,
            onFallback: playStillFinale,
          });
          activeVideo.prepare();
        }
        return activeVideo;
      };

      const startVideo = contextSafe!(() => {
        if (introPhaseRef.current !== "holding") return;
        const sequence = ensureVideo();
        if (!sequence) {
          playStillFinale();
          return;
        }
        introPhaseRef.current = "playing";
        setShowScrollHint(false);
        sequence.start();
      });

      startIntroVideoRef.current = startVideo;
      skipIntroVideoRef.current = () => activeVideo?.skip();

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: reduce)", () => {
        revealStartedRef.current = true;
        gsap.set(loader, { autoAlpha: 0 });
        setLoaderDismissed(true);
        gsap.set(videoLayer, { autoAlpha: 0 });
        gsap.set(firstFrameRef.current, { autoAlpha: 0 });
        if (lastFrame) gsap.set(lastFrame, { autoAlpha: 1 });
        const titles = root.querySelector<HTMLElement>("[data-hero-titles]");
        if (titles) gsap.set(titles, { autoAlpha: 1 });
        setSondavenVisible(root);
        finish();
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const loaderProgress = createLoaderProgress({
          bar,
          progressbar,
          phaseTrack,
          percent,
          live,
        });
        const materialCycle = createLoaderMaterialCycle(materials);
        let gate = 0;
        let startedAt = 0;

        const releaseLoader = (next: () => void) => {
          window.clearInterval(gate);
          loaderProgress.update(100);
          materialCycle.complete(() => {
            window.setTimeout(next, LOADER_HOLD_MS);
          });
        };

        const startSequence = () => {
          window.clearInterval(gate);
          loaderProgress.reset();
          materialCycle.reset();
          startedAt = performance.now();

          gate = window.setInterval(() => {
            const state = preloadRef.current;
            const timeProgress = Math.min(
              (performance.now() - startedAt) / LOADER_MIN_DURATION_MS,
              1,
            );

            if (state.status === "error") {
              loaderProgress.update(timeProgress * 100);
              if (timeProgress >= 1) releaseLoader(holdOnArchive);
              return;
            }

            loaderProgress.update(Math.min(state.progress, timeProgress) * 100);
            if (state.status === "ready" && timeProgress >= 1) {
              releaseLoader(() => {
                if (SHOW_INTRO_VIDEO) ensureVideo();
                holdOnArchive();
              });
            }
          }, 50);
        };

        startSequence();

        return () => {
          window.clearInterval(gate);
          loaderProgress.kill();
          materialCycle.kill();
          activeVideo?.kill();
        };
      });

      return () => {
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

      {/* 01首屏-1 档案盒与视频层：开场流程结束后不再复用，整体卸载 */}
      {introDone ? null : (
        <>
          {/* 档案盒静帧：加载层退场后停在此页，下滑再播视频 */}
          <div
            ref={firstFrameRef}
            className="invisible absolute inset-0 z-[25] opacity-0 motion-reduce:hidden"
          >
            <Image
              src={archiveBoxImg}
              alt=""
              fill
              priority
              unoptimized
              placeholder="blur"
              sizes="100vw"
              className="hidden object-cover md:block"
            />
            <Image
              src={mobileFirstFrameImg}
              alt=""
              fill
              priority
              unoptimized
              placeholder="blur"
              sizes="(max-width: 767px) 100vw, 1px"
              className="object-cover md:hidden"
            />
          </div>

          {/* 全屏视频层：盖住共享尾帧底图，避免播片时静帧露出来闪一下 */}
          <div
            ref={videoLayerRef}
            className="invisible absolute inset-0 z-20 bg-white opacity-0"
          >
            {/* translateZ(0) 强制视频始终走 GPU 合成路径，避免硬件叠加层来回切换造成亮度闪烁 */}
            <video
              ref={videoRef}
              muted
              playsInline
              preload="none"
              aria-hidden="true"
              className="size-full origin-center object-cover [transform:translateZ(0)]"
            />
          </div>
        </>
      )}

      {/* 最终首屏内容：Figma 884:2070，标题组与目录左侧光学对齐 */}
      <div data-hero-titles className="invisible absolute inset-0 z-30 opacity-0">
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

      {/* 不用 mix-blend-difference：混合模式会阻止视频进入硬件叠加层，引发亮度闪烁 */}
      {showScrollHint ? (
        <div className="absolute right-5 bottom-5 z-[35]">
          <p
            aria-hidden="true"
            className={`shrink-0 whitespace-nowrap text-12 font-normal uppercase leading-none text-grey-400 ${
              locale === "en" ? "font-bodoni" : "font-serif-sc"
            }`}
          >
            {t("hero.scrollDown")}
          </p>
        </div>
      ) : null}

      {showSkip ? (
        <div className="absolute right-5 bottom-5 z-[35]">
          <FlipHoverButton
            label={t("hero.skipVideo")}
            onClick={() => skipIntroVideoRef.current?.()}
            markOffsetY={locale === "en" ? -1 : 0}
            className={`shrink-0 whitespace-nowrap text-12 font-normal uppercase leading-none text-grey-400 focus-visible:outline-none ${
              locale === "en" ? "font-bodoni" : "font-serif-sc"
            }`}
          />
        </div>
      ) : null}

      {/* 加载序幕：材质铭牌渐隐切换，顶部进度条跟真实加载；退场后整体卸载 */}
      {loaderDismissed ? null : (
        <>
          {/* 加载层与首屏之间的错位跟随层：参考黄色层并替换为 grey-400 */}
          <div
            data-loader-curtain
            aria-hidden="true"
            className="invisible absolute inset-0 z-[55] bg-grey-400 opacity-0 motion-reduce:hidden"
          />
          <div
            ref={loaderRef}
            className="absolute inset-0 z-[60] bg-white motion-reduce:hidden"
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
        </>
      )}
    </ScreenShell>
  );
}
