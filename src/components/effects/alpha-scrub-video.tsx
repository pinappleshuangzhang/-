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
  /** 从当前位置原生播放至结尾，可指定完整播放时长。 */
  playToEnd: (durationSeconds?: number) => void;
  pause: () => void;
};

type AlphaScrubVideoProps = {
  /** VP9 WebM（Chrome / Firefox / Edge，带 alpha） */
  srcWebm: string;
  /** HEVC + alpha MP4（Safari） */
  srcHevc: string;
  className?: string;
  /** 首帧就绪（可隐藏静态占位图） */
  onFirstFrame?: () => void;
  /** 视频不可用时回调（保留静态占位图） */
  onError?: () => void;
};

/** Safari 不支持 VP9 alpha，需走 HEVC + alpha；其余浏览器走 WebM */
function pickSource(srcWebm: string, srcHevc: string): string {
  if (typeof navigator === "undefined") return srcWebm;
  const ua = navigator.userAgent;
  const isSafari = /safari/i.test(ua) && !/chrome|chromium|crios|edg|android/i.test(ua);
  return isSafari ? srcHevc : srcWebm;
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
    playToEnd(durationSeconds) {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate =
        durationSeconds &&
        durationSeconds > 0 &&
        Number.isFinite(video.duration)
          ? video.duration / durationSeconds
          : 1;
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
    const onLoadedData = () => {
      if (!firstFrameDone) {
        firstFrameDone = true;
        onFirstFrame?.();
      }
    };
    const onVideoError = () => {
      console.warn("[alpha-scrub-video] 视频加载失败:", video.error?.message);
      onError?.();
    };
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onVideoError);
    video.load();

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
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
