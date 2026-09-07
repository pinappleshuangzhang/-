"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/** 服务端按移动端处理，避免手机下载桌面 WebGL 分包 */
function getServerSnapshot() {
  return false;
}

export function useDesktopMedia() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
