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
 * 按字节流预加载一组静态资源，进度 0~1。
 * 无 Content-Length 时按文件完成数均分。
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
    const totals = list.map(() => 0);
    const received = list.map(() => 0);
    const finished = list.map(() => false);

    const emit = (status: VideoPreloadStatus = "loading") => {
      if (cancelled) return;
      const totalSum = totals.reduce((sum, value) => sum + value, 0);
      const receivedSum = received.reduce((sum, value) => sum + value, 0);
      let progress =
        totalSum > 0
          ? receivedSum / totalSum
          : finished.filter(Boolean).length / list.length;
      if (status === "ready") progress = 1;
      else progress = Math.min(progress, 0.999);
      setState({ progress, status });
    };

    async function loadOne(src: string, index: number) {
      const response = await fetch(src, { signal: controller.signal });
      if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch asset: ${response.status}`);
      }
      totals[index] = Number(response.headers.get("content-length")) || 0;
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received[index] += value.byteLength;
        if (totals[index] === 0) totals[index] = received[index];
        emit();
      }
      finished[index] = true;
      if (totals[index] === 0) totals[index] = Math.max(received[index], 1);
      received[index] = totals[index];
    }

    Promise.all(list.map((src, index) => loadOne(src, index)))
      .then(() => emit("ready"))
      .catch(() => {
        if (!cancelled) setState((prev) => ({ ...prev, status: "error" }));
      });

    return () => {
      cancelled = true;
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
  videoSrc: string,
  extraSrcs: readonly string[],
  {
    videoEnabled,
    timeoutMs,
  }: {
    videoEnabled: boolean;
    timeoutMs?: number;
  },
): HeroPreloadState {
  const video = useVideoPreloader(videoSrc, {
    enabled: videoEnabled,
    timeoutMs,
  });
  const assets = useBytesPreloader(extraSrcs);

  return useMemo(() => {
    const progress = videoEnabled
      ? video.progress * 0.88 + assets.progress * 0.12
      : assets.progress;
    const status: VideoPreloadStatus =
      video.status === "error" || assets.status === "error"
        ? "error"
        : video.status === "ready" && assets.status === "ready"
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
  ]);
}
