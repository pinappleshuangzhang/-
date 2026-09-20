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
 * 以 XHR 预加载视频，暴露真实下载进度。
 * 不用 fetch + ReadableStream：Safari 读大视频流经常不吐进度甚至卡死主线程，
 * XHR 的 onprogress 在全浏览器（含 Safari）都稳定。
 * 进度到 1 且 status 为 ready 时，objectUrl 可直接赋给 <video>，
 * 播放时视频已完整在内存中，不会出现缓冲或黑屏。
 */
export function useVideoPreloader(
  src: string,
  {
    timeoutMs = 12000,
    enabled = true,
  }: { timeoutMs?: number; enabled?: boolean } = {},
): VideoPreloadState {
  const [state, setState] = useState<VideoPreloadState>(() =>
    enabled
      ? { progress: 0, status: "loading", objectUrl: null }
      : // 禁用时视为“已就绪但无视频”，调用方据此走静态降级路径
        { progress: 1, status: "ready", objectUrl: null },
  );
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", src);
    xhr.responseType = "blob";
    xhr.timeout = timeoutMs;

    xhr.onprogress = (event) => {
      if (cancelled) return;
      const progress = event.lengthComputable
        ? Math.min(event.loaded / event.total, 0.999)
        : Math.min(event.loaded / (event.loaded + 250_000), 0.9);
      setState((prev) => ({ ...prev, progress }));
    };

    xhr.onload = () => {
      if (cancelled) return;
      if (xhr.status < 200 || xhr.status >= 300 || !(xhr.response instanceof Blob)) {
        setState((prev) => ({ ...prev, status: "error" }));
        return;
      }
      const url = URL.createObjectURL(xhr.response);
      objectUrlRef.current = url;
      setState({ progress: 1, status: "ready", objectUrl: url });
    };

    const fail = () => {
      if (!cancelled) setState((prev) => ({ ...prev, status: "error" }));
    };
    xhr.onerror = fail;
    xhr.ontimeout = fail;

    xhr.send();

    return () => {
      cancelled = true;
      xhr.abort();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src, timeoutMs, enabled]);

  return state;
}
