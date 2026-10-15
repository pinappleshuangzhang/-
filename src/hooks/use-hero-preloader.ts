"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useVideoPreloader,
  type VideoPreloadState,
  type VideoPreloadStatus,
} from "@/hooks/use-video-preloader";

export type HeroPreloadState = VideoPreloadState;

type BytesState = {
  progress: number;
  status: VideoPreloadStatus;
};

/**
 * 预加载一组静态资源，进度按完成数 0~1。
 * 不用 ReadableStream：Safari 读流经常不结束，加载条会一直等不到 ready。
 */
function useBytesPreloader(srcs: readonly string[]): BytesState {
  const key = srcs.join("|");
  const [state, setState] = useState<BytesState>(() =>
    key.length === 0
      ? { progress: 1, status: "ready" }
      : { progress: 0, status: "loading" },
  );

  useEffect(() => {
    if (key.length === 0) return;
    const list = key.split("|");

    const controller = new AbortController();
    let cancelled = false;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let finished = 0;

    async function loadOne(src: string) {
      const response = await fetch(src, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.status}`);
      }
      await response.blob();
      finished += 1;
      if (!cancelled) {
        setState({
          progress: Math.min(finished / list.length, 0.999),
          status: "loading",
        });
      }
    }

    Promise.all(list.map((src) => loadOne(src)))
      .then(() => {
        if (!cancelled) setState({ progress: 1, status: "ready" });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ ...prev, status: "error" }));
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [key]);

  return state;
}

/**
 * 首屏加载进度：静态资源 +（可选）开场视频。
 * 开启视频时视频占主要权重，关闭时只跟静态资源。
 */
export function useHeroPreloader(
  videoSrc: string | null,
  extraSrcs: readonly string[],
  {
    videoEnabled,
    timeoutMs,
  }: {
    videoEnabled: boolean;
    timeoutMs?: number;
  },
): HeroPreloadState {
  const video = useVideoPreloader(videoSrc ?? "", {
    // 地址未定（桌面/手机还没在客户端判完）时不要发请求。
    // 桌面 Safari 若先下手机片再 abort，下一次 blob XHR 会永久挂起。
    enabled: videoEnabled && Boolean(videoSrc),
    timeoutMs,
  });
  const assets = useBytesPreloader(extraSrcs);

  return useMemo(() => {
    // 禁用态的 ready 没有 objectUrl。开着视频时必须等到真正的 blob，
    // 否则首帧会把“还没开始下”误判成已完成。
    const videoReady =
      !videoEnabled ||
      (video.status === "ready" && video.objectUrl !== null);
    const videoFailed = videoEnabled && video.status === "error";
    // 地址刚确定的那一帧，hook 里可能还留着「未启用 = ready」的旧状态，进度是 1 但没有 blob。
    const videoProgress =
      !videoSrc || (video.status === "ready" && video.objectUrl === null)
        ? 0
        : video.progress;
    const progress = videoEnabled
      ? videoProgress * 0.88 + assets.progress * 0.12
      : assets.progress;
    const status: VideoPreloadStatus =
      videoFailed || assets.status === "error"
        ? "error"
        : videoReady && assets.status === "ready"
          ? "ready"
          : "loading";
    return {
      progress,
      status,
      objectUrl: video.objectUrl,
    };
  }, [
    assets.progress,
    assets.status,
    video.objectUrl,
    video.progress,
    video.status,
    videoEnabled,
    videoSrc,
  ]);
}
