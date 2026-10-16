"use client";

import { useMemo, useSyncExternalStore } from "react";
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

const ASSET_LOADING: BytesState = { progress: 0, status: "loading" };

let expectedIds: readonly string[] = [];
let expectedKey = "";
const loadedIds = new Set<string>();
let assetError = false;
let assetSnapshot: BytesState = ASSET_LOADING;
const assetListeners = new Set<() => void>();

function publishAssets() {
  const total = expectedIds.length;
  let loaded = 0;
  for (const id of expectedIds) {
    if (loadedIds.has(id)) loaded += 1;
  }
  const status: VideoPreloadStatus = assetError
    ? "error"
    : total > 0 && loaded === total
      ? "ready"
      : "loading";
  const progress =
    status === "ready" ? 1 : total === 0 ? 0 : Math.min(loaded / total, 0.999);
  if (
    assetSnapshot.progress === progress &&
    assetSnapshot.status === status
  ) {
    return;
  }
  assetSnapshot = { progress, status };
  for (const listener of assetListeners) listener();
}

/**
 * 声明加载屏上真正会显示的图。进度只跟这些图的 onLoad，
 * 不再为进度单独 fetch 一遍再丢掉。
 */
export function expectLoaderImages(ids: readonly string[]) {
  const key = ids.join("|");
  if (key === expectedKey) return;
  expectedKey = key;
  expectedIds = ids;
  publishAssets();
}

export function reportLoaderImage(id: string, ok = true) {
  if (!ok) assetError = true;
  else loadedIds.add(id);
  publishAssets();
}

function subscribeAssets(listener: () => void) {
  assetListeners.add(listener);
  return () => {
    assetListeners.delete(listener);
  };
}

function getAssetSnapshot() {
  return assetSnapshot;
}

function useLoaderImageProgress(): BytesState {
  return useSyncExternalStore(
    subscribeAssets,
    getAssetSnapshot,
    () => ASSET_LOADING,
  );
}

/**
 * 首屏加载进度：静态资源 +（可选）开场视频。
 * 开启视频时视频占主要权重，关闭时只跟静态资源。
 */
export function useHeroPreloader(
  videoSrc: string | null,
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
  const assets = useLoaderImageProgress();

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
