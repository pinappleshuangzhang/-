"use client";

import { useEffect, useState } from "react";

export type VideoPreloadStatus = "loading" | "ready" | "error";

export type VideoPreloadState = {
  /** 真实下载进度 0~1 */
  progress: number;
  status: VideoPreloadStatus;
  /** 下载完成后的 Blob URL，可零缓冲播放 */
  objectUrl: string | null;
};

const INITIAL: VideoPreloadState = {
  progress: 0,
  status: "loading",
  objectUrl: null,
};

type Listener = (state: VideoPreloadState) => void;

type InflightJob = {
  listeners: Set<Listener>;
  xhr: XMLHttpRequest;
  /** 推迟 abort，躲过 Strict Mode 的卸载再挂载，避免 Safari 把下一次 blob 请求挂死 */
  abortTimer: number;
  settled: boolean;
  latest: VideoPreloadState;
  timeout: number;
};

const jobs = new Map<string, InflightJob>();

function publish(job: InflightJob, state: VideoPreloadState) {
  job.latest = state;
  for (const listener of job.listeners) listener(state);
}

function finish(job: InflightJob, src: string, state: VideoPreloadState) {
  if (job.settled) return;
  job.settled = true;
  window.clearTimeout(job.timeout);
  publish(job, state);
  if (state.status !== "ready") jobs.delete(src);
}

/**
 * 同一地址只保留一个 XHR。Safari 在 abort 掉 responseType=blob 的请求后，
 * 紧接着的下一次请求会一直 pending、既不 onprogress 也不 onload，加载条停在 0%。
 * Strict Mode 会立刻卸载再挂载，所以 abort 推迟到确认没有订阅者之后。
 */
function retainVideo(src: string, timeoutMs: number, listener: Listener) {
  let job = jobs.get(src);
  if (!job) {
    const xhr = new XMLHttpRequest();
    job = {
      listeners: new Set(),
      xhr,
      abortTimer: 0,
      settled: false,
      latest: INITIAL,
      timeout: 0,
    };
    const created = job;
    jobs.set(src, created);
    xhr.open("GET", src);
    xhr.responseType = "blob";
    // 不用 xhr.timeout：Safari 上这个计时器和 blob 响应叠在一起时，onload 可能永不触发。
    created.timeout = window.setTimeout(() => {
      if (created.settled) return;
      xhr.abort();
      finish(created, src, { progress: 0, status: "error", objectUrl: null });
    }, timeoutMs);

    xhr.onprogress = (event) => {
      if (created.settled) return;
      const progress =
        event.lengthComputable && event.total > 0
          ? Math.min(event.loaded / event.total, 0.999)
          : Math.min(event.loaded / (event.loaded + 250_000), 0.9);
      publish(created, { progress, status: "loading", objectUrl: null });
    };

    xhr.onload = () => {
      if (
        xhr.status < 200 ||
        xhr.status >= 300 ||
        !(xhr.response instanceof Blob)
      ) {
        finish(created, src, { progress: 0, status: "error", objectUrl: null });
        return;
      }
      const url = URL.createObjectURL(xhr.response);
      finish(created, src, { progress: 1, status: "ready", objectUrl: url });
    };

    xhr.onerror = () => {
      finish(created, src, { progress: 0, status: "error", objectUrl: null });
    };

    xhr.send();
  }

  window.clearTimeout(job.abortTimer);
  job.listeners.add(listener);
  listener(job.latest);

  return () => {
    const current = jobs.get(src);
    if (!current) return;
    current.listeners.delete(listener);
    if (current.listeners.size > 0 || current.settled) return;
    current.abortTimer = window.setTimeout(() => {
      if (current.listeners.size > 0 || current.settled) return;
      current.xhr.abort();
      window.clearTimeout(current.timeout);
      jobs.delete(src);
    }, 50);
  };
}

/**
 * 以 XHR 预加载视频，暴露真实下载进度。
 * 不用 fetch + ReadableStream：Safari 读大视频流经常不吐进度甚至卡死主线程。
 * 进度到 1 且 status 为 ready 时，objectUrl 可直接赋给 <video>。
 */
export function useVideoPreloader(
  src: string,
  {
    timeoutMs = 12000,
    enabled = true,
  }: { timeoutMs?: number; enabled?: boolean } = {},
): VideoPreloadState {
  const [state, setState] = useState<VideoPreloadState>(INITIAL);

  useEffect(() => {
    if (!enabled || !src) return;
    return retainVideo(src, timeoutMs, setState);
  }, [src, timeoutMs, enabled]);

  if (!enabled || !src) {
    return { progress: 1, status: "ready", objectUrl: null };
  }
  return state;
}
