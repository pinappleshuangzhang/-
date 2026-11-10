"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import gsap from "gsap";
import { revealParkedMediaInner } from "@/animations/sondaven-reveal";
import { SurveyEnlargeableImage } from "@/components/ui/survey-enlargeable-image";
import { SurveyVideoLightbox } from "@/components/ui/survey-video-lightbox";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** 与 sondaven 媒体入场一致：1.2s、power2.out、自 105% 上滑 */
const HOVER_REVEAL_DURATION = 1.2;
const HOVER_REVEAL_EASE = "power2.out";
const HOVER_HIDDEN = { yPercent: 105, y: 0 };
const HOVER_VISIBLE = { yPercent: 0, y: 0 };
/** 视频后黑色遮罩单独用 opacity 淡入 */
const MASK_FADE_DURATION = 0.6;
const MASK_FADE_EASE = "none";

type KeepHoverMediaBase = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  /** 第三屏入场延迟，写入 data-sd-delay */
  revealDelay: string;
  /** 图片先被裁在框外时，跳过懒加载 */
  eager?: boolean;
  className?: string;
  innerClassName?: string;
};

export type KeepHoverMediaProps =
  | (KeepHoverMediaBase & {
      hover: "video";
      videoSrc: string;
      previewLabel: string;
      expandLabel: string;
      closeLabel: string;
      /** 默认 none；抽屉打开后第一段 hover 用 auto，避免悬停才开始拉流 */
      preload?: "none" | "metadata" | "auto";
      /** 进入视口就上滑播放，不依赖悬停或聚焦 */
      playWhenVisible?: boolean;
    })
  | (KeepHoverMediaBase & {
      hover: "none";
    });

const frameClass =
  "relative aspect-[896/503] w-full cursor-auto overflow-hidden";

/**
 * 抽屉内图片公共帧：点击/悬停不关抽屉。
 * hover="video" 出黑色遮罩，视频与图片相同上滑出现；hover="none" 画面不变。
 */
export function KeepHoverMedia(props: KeepHoverMediaProps) {
  if (props.hover === "video") return <VideoKeepMedia {...props} />;
  return <StaticKeepMedia {...props} />;
}

function MediaFrame({
  revealDelay,
  className,
  innerClassName,
  frameRef,
  tabIndex,
  "aria-label": ariaLabel,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  children,
}: {
  revealDelay: string;
  className?: string;
  innerClassName?: string;
  frameRef?: Ref<HTMLDivElement>;
  tabIndex?: number;
  "aria-label"?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      ref={frameRef}
      data-survey-keep=""
      data-sd-media
      data-sd-delay={revealDelay}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      className={`${frameClass} ${className ?? ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div
        data-sd-media-inner
        className={`relative translate-y-[105%] ${innerClassName ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}

function StaticKeepMedia({
  src,
  alt,
  width,
  height,
  sizes = "896px",
  revealDelay,
  eager = false,
  className,
  innerClassName,
}: KeepHoverMediaBase) {
  return (
    <MediaFrame
      revealDelay={revealDelay}
      className={className}
      innerClassName={innerClassName}
    >
      <SurveyEnlargeableImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        eager={eager}
        className="h-auto w-full"
      />
    </MediaFrame>
  );
}

function VideoKeepMedia({
  src,
  alt,
  width,
  height,
  sizes = "896px",
  revealDelay,
  className,
  innerClassName,
  videoSrc,
  previewLabel,
  expandLabel,
  closeLabel,
  preload = "none",
  playWhenVisible = false,
}: KeepHoverMediaBase & {
  hover: "video";
  videoSrc: string;
  previewLabel: string;
  expandLabel: string;
  closeLabel: string;
  preload?: "none" | "metadata" | "auto";
  playWhenVisible?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hoverInnerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const focusedRef = useRef(false);
  const startedRef = useRef(false);
  const videoOpenRef = useRef(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const openLandscape = useCallback(() => {
    videoOpenRef.current = true;
    videoRef.current?.pause();
    setVideoOpen(true);
  }, []);

  useLayoutEffect(() => {
    const layer = hoverInnerRef.current;
    const mask = maskRef.current;
    if (layer) gsap.set(layer, HOVER_HIDDEN);
    if (mask) gsap.set(mask, { opacity: 0, force3D: false });
    return () => {
      if (layer) gsap.killTweensOf(layer);
      if (mask) gsap.killTweensOf(mask);
    };
  }, []);

  const revealHover = useCallback(
    (show: boolean) => {
      const layer = hoverInnerRef.current;
      const mask = maskRef.current;
      if (layer) {
        gsap.killTweensOf(layer);
        if (reducedMotion) {
          gsap.set(layer, show ? HOVER_VISIBLE : HOVER_HIDDEN);
        } else {
          gsap.to(layer, {
            ...(show ? HOVER_VISIBLE : HOVER_HIDDEN),
            duration: HOVER_REVEAL_DURATION,
            ease: HOVER_REVEAL_EASE,
            overwrite: "auto",
          });
        }
      }
      if (!mask) return;
      gsap.killTweensOf(mask);
      if (reducedMotion) {
        gsap.set(mask, { opacity: show ? 1 : 0, force3D: false });
        return;
      }
      gsap.to(mask, {
        opacity: show ? 1 : 0,
        duration: MASK_FADE_DURATION,
        ease: MASK_FADE_EASE,
        force3D: false,
        overwrite: "auto",
      });
    },
    [reducedMotion],
  );

  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (videoOpenRef.current) {
      video?.pause();
      return;
    }
    const active =
      playWhenVisible && reducedMotion
        ? false
        : playWhenVisible
          ? startedRef.current
          : hoveringRef.current || focusedRef.current;
    revealHover(active);
    if (!video) return;
    if (!reducedMotion && active) {
      void video
        .play()
        .then(() => {
          if (videoOpenRef.current) {
            video.pause();
            return;
          }
          const stillActive = playWhenVisible
            ? startedRef.current
            : hoveringRef.current || focusedRef.current;
          if (!stillActive) {
            video.pause();
            video.currentTime = 0;
          }
        })
        .catch(() => {
          /* 素材缺失或自动播放被拒时保留静帧占位 */
        });
      return;
    }
    video.pause();
    video.currentTime = 0;
  }, [playWhenVisible, reducedMotion, revealHover]);

  useEffect(() => {
    if (!playWhenVisible) return;
    const frame = frameRef.current;
    if (!frame) return;
    const scroller = frame.closest("[data-survey-scroller]");
    // 盖住滚动区域中线后开始循环，滑走也不停。
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        revealParkedMediaInner(frame, reducedMotion);
        syncPlayback();
      },
      {
        root: scroller instanceof HTMLElement ? scroller : null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [playWhenVisible, reducedMotion, syncPlayback]);

  return (
    <>
    <MediaFrame
      frameRef={frameRef}
      revealDelay={revealDelay}
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 ${className ?? ""}`}
      innerClassName={innerClassName}
      tabIndex={playWhenVisible ? undefined : 0}
      aria-label={playWhenVisible ? undefined : previewLabel}
      onMouseEnter={() => {
        hoveringRef.current = true;
        syncPlayback();
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
        syncPlayback();
      }}
      onFocus={() => {
        focusedRef.current = true;
        syncPlayback();
      }}
      onBlur={() => {
        focusedRef.current = false;
        syncPlayback();
      }}
    >
      <SurveyEnlargeableImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className="h-auto w-full"
        activateLabel={expandLabel}
        onActivate={openLandscape}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          ref={maskRef}
          className="absolute inset-0 bg-grey-400/50 opacity-0"
        />
        <div ref={hoverInnerRef} className="absolute inset-0">
          {/* 宽度固定、高度随视频比例自适应并垂直居中，避免 object-contain 产生黑边 */}
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload={preload}
            className="absolute left-[6.027%] top-1/2 h-auto w-[87.835%] -translate-y-1/2 motion-reduce:hidden"
          />
        </div>
      </div>
    </MediaFrame>
    {videoOpen ? (
      <SurveyVideoLightbox
        src={videoSrc}
        label={alt}
        closeLabel={closeLabel}
        onClose={() => {
          videoOpenRef.current = false;
          setVideoOpen(false);
          syncPlayback();
          const button = frameRef.current?.querySelector("button");
          if (button instanceof HTMLButtonElement) button.focus();
        }}
      />
    ) : null}
    </>
  );
}
