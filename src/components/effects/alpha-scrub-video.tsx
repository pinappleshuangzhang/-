"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

export type AlphaScrubVideoHandle = {
  /** 把视频定位到 0~1 进度处 */
  seekTo: (progress: number) => void;
  /** 从当前位置按原速播到结尾。透明视频不改倍速，改了会掉帧、发顿。 */
  playToEnd: () => void;
  pause: () => void;
};

type AlphaScrubVideoProps = {
  /** VP9 WebM（Chrome / Firefox / Edge，带 alpha） */
  srcWebm: string;
  /** HEVC + alpha MP4（Safari / iOS WebKit，含 iPhone Chrome） */
  srcHevc: string;
  className?: string;
  /** 首帧就绪（可隐藏静态占位图） */
  onFirstFrame?: () => void;
  /** 视频不可用时回调（保留静态占位图） */
  onError?: () => void;
};

/** Safari 与全部 iOS 浏览器都是 WebKit，不支持 VP9 alpha。 */
function isWebKitAlphaClient() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari =
    /safari/i.test(ua) && !/chrome|chromium|crios|edg|android/i.test(ua);
  return isIos || isSafari;
}

/** WebKit 走 HEVC alpha，其余走 VP9 WebM */
export function pickSource(srcWebm: string, srcHevc: string): string {
  return isWebKitAlphaClient() ? srcHevc : srcWebm;
}

/**
 * 原生透明视频擦拭组件：视频自带 alpha 通道，浏览器直接合成透明背景。
 * 不自动播放，帧位置完全由 seekTo 驱动（全关键帧编码，跳帧流畅）。
 */
export const AlphaScrubVideo = forwardRef<
  AlphaScrubVideoHandle,
  AlphaScrubVideoProps
>(function AlphaScrubVideo(
  { srcWebm, srcHevc, className, onFirstFrame, onError },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = useMemo(() => pickSource(srcWebm, srcHevc), [srcWebm, srcHevc]);

  useImperativeHandle(ref, () => ({
    seekTo(progress) {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }
      // 收尾帧留一点余量，避免 currentTime == duration 时部分浏览器回跳
      const clamped = Math.min(Math.max(progress, 0), 0.999);
      video.currentTime = clamped * video.duration;
    },
    playToEnd() {
      const video = videoRef.current;
      if (!video) return;
      // WebKit 的 HEVC alpha 改 playbackRate 会卡死解码。原速就不要再赋值。
      if (!isWebKitAlphaClient()) video.playbackRate = 1;
      if (!video.paused && !video.ended) return;
      void video.play().catch(() => {
        // 静音内联视频通常允许自动播放；若浏览器仍拦截则保留当前帧。
      });
    },
    pause() {
      videoRef.current?.pause();
    },
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let firstFrameDone = false;
    let fallbackTimer = 0;
    const markReady = () => {
      if (firstFrameDone) return;
      firstFrameDone = true;
      window.clearTimeout(fallbackTimer);
      onFirstFrame?.();
    };
    // loadeddata 只说明帧已解码，还没画上屏幕。等真正提交一帧再撤占位图，
    // 否则会闪一帧空白。暂停时部分浏览器不派发 requestVideoFrameCallback，先静音播一下。
    // WebKit 不在这里播：等 loadeddata 再播，占位图会静置数秒。开播由文字就绪触发。
    const onLoadedData = () => {
      if (isWebKitAlphaClient()) return;
      fallbackTimer = window.setTimeout(markReady, 500);
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(() => markReady());
        if (video.paused) {
          void video.play().catch(() => markReady());
        }
        return;
      }
      requestAnimationFrame(() => markReady());
    };
    // 画面一开始动就撤占位图，不再额外等解码事件。
    const onPlaying = () => markReady();
    const onVideoError = () => {
      console.warn("[alpha-scrub-video] 视频加载失败:", video.error?.message);
      onError?.();
    };
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onVideoError);
    video.load();

    return () => {
      window.clearTimeout(fallbackTimer);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onVideoError);
    };
    // 回调通过闭包引用最新值即可，仅随视频源重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="auto"
      className={className}
      aria-hidden="true"
    />
  );
});
