"use client";

import { useEffect, useRef, useState } from "react";

export type VideoPreloadStatus = "loading" | "ready" | "error";

export type VideoPreloadState = {
  /** 真实下载进度 0~1 */
  progress: number;
  status: VideoPreloadStatus;
  /** 下载完成后的 Blob URL，可零缓冲播放 */
  objectUrl: string | null;
};

/**
 * 以流式 fetch 预加载视频，暴露真实下载进度。
 * 进度到 1 且 status 为 ready 时，objectUrl 可直接赋给 <video>，
 * 播放时视频已完整在内存中，不会出现缓冲或黑屏。
 */
export function useVideoPreloader(
  src: string,
  { timeoutMs = 12000 }: { timeoutMs?: number } = {},
): VideoPreloadState {
  const [state, setState] = useState<VideoPreloadState>({
    progress: 0,
    status: "loading",
    objectUrl: null,
  });
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok || !response.body) {
          throw new Error(`Failed to fetch video: ${response.status}`);
        }

        const total = Number(response.headers.get("content-length")) || 0;
        const reader = response.body.getReader();
        const chunks: BlobPart[] = [];
        let received = 0;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          if (!cancelled && total > 0) {
            setState((prev) => ({
              ...prev,
              progress: Math.min(received / total, 0.999),
            }));
          }
        }

        const blob = new Blob(chunks, { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        if (!cancelled) {
          setState({ progress: 1, status: "ready", objectUrl: url });
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, status: "error" }));
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src, timeoutMs]);

  return state;
}
