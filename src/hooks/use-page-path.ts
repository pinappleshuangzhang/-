import { useEffect, useRef } from "react";
import {
  isSameLocation,
  normalizePath,
  pathForView,
  resolvePathname,
  screenIndexForLocation,
} from "@/lib/page-paths";

type ScreenKey = { key: string };

type UsePagePathSyncOptions = {
  screens: readonly ScreenKey[];
  index: number;
  workRouteIndex: number | null;
  setWorkRouteIndex: (workIndex: number | null) => void;
  /** 首屏加载幕还在时地址保持 /，结束后再换成「档案室首页」 */
  introOverlayActive: boolean;
  playIntro: boolean;
  goToScreen: (index: number) => void;
};

/**
 * 把当前屏、作品抽屉写进地址栏，并在浏览器后退时切回去。
 * 用 history.pushState，不走路由跳转，分页器不会整页重载。
 */
export function usePagePathSync({
  screens,
  index,
  workRouteIndex,
  setWorkRouteIndex,
  introOverlayActive,
  playIntro,
  goToScreen,
}: UsePagePathSyncOptions) {
  const fromHistoryRef = useRef(false);
  const goToScreenRef = useRef(goToScreen);
  const setWorkRef = useRef(setWorkRouteIndex);
  const indexRef = useRef(index);
  const screensRef = useRef(screens);

  useEffect(() => {
    goToScreenRef.current = goToScreen;
    setWorkRef.current = setWorkRouteIndex;
    indexRef.current = index;
    screensRef.current = screens;
  });

  useEffect(() => {
    const onPopState = () => {
      fromHistoryRef.current = true;
      const location = resolvePathname(window.location.pathname);
      const keys = screensRef.current.map((screen) => screen.key);
      const nextWork = location?.type === "work" ? location.workIndex : null;
      setWorkRef.current(nextWork);
      const nextIndex = screenIndexForLocation(location, keys);
      if (nextIndex !== indexRef.current) {
        goToScreenRef.current(nextIndex);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const screenKey = screens[index]?.key;
    const holdIntro =
      playIntro && introOverlayActive && index === 0 && workRouteIndex === null;
    const path = holdIntro ? "/" : pathForView(screenKey, workRouteIndex);

    if (fromHistoryRef.current) {
      fromHistoryRef.current = false;
      return;
    }

    const current = normalizePath(window.location.pathname);
    if (current === path) return;

    // 根路径、认不出的后缀，或只是去掉空格的同一页，替换当前记录
    const known = resolvePathname(window.location.pathname);
    const replace =
      current === "/" ||
      known === null ||
      isSameLocation(known, resolvePathname(path));
    const url = path === "/" ? "/" : encodeURI(path);
    const write = replace ? window.history.replaceState : window.history.pushState;
    write.call(window.history, null, "", url);
  }, [index, introOverlayActive, playIntro, screens, workRouteIndex]);
}
