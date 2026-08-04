"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AsciiCurtain } from "@/components/effects/ascii-curtain";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { CurtainPhase } from "@/lib/ascii-curtain";
import type { NavVariant } from "@/lib/nav-variants";

/** 滚轮增量低于该值视为误触，不触发切屏 */
const WHEEL_THRESHOLD = 8;
/** 触摸滑动超过该距离（px）才切屏 */
const TOUCH_THRESHOLD = 48;
/** reveal 结束后的冷却时长，吃掉触控板惯性避免连翻 */
const NAVIGATION_COOLDOWN_MS = 400;
/** 首屏序幕的兜底解锁时限，防止序幕异常导致全站卡死 */
const LOCK_SAFETY_TIMEOUT_MS = 15000;

export type PagerScreen = {
  key: string;
  navVariant: NavVariant;
  /** 切屏后播报给读屏软件的屏名 */
  title: string;
  node: ReactNode;
};

type SectionPagerValue = {
  index: number;
  count: number;
  phase: CurtainPhase;
  navVariant: NavVariant;
  goToScreen: (index: number) => void;
  goToNextScreen: () => void;
  goToPrevScreen: () => void;
  /** 首屏序幕等场景下暂时禁止切屏 */
  setNavigationLocked: (locked: boolean) => void;
  /** 注册“已在第一屏仍继续向上滑”的处理器（如重播首屏序幕），返回注销函数 */
  registerTopOverscroll: (handler: () => void) => () => void;
};

const SectionPagerContext = createContext<SectionPagerValue | null>(null);

export function useSectionPager() {
  const value = useContext(SectionPagerContext);
  if (!value) {
    throw new Error("useSectionPager 必须在 SectionPagerProvider 内使用");
  }
  return value;
}

type SectionPagerProviderProps = {
  screens: PagerScreen[];
  /** 全局固定 UI（导航、切屏提示等），渲染在分屏舞台之上 */
  children?: ReactNode;
};

/**
 * 整屏分页：页面不滚动，滚轮、键盘与触摸都被接管为“切一屏”。
 * 每次切屏先由 ASCII 幕布铺满视口，铺满后替换分屏内容，再让幕布消散。
 */
export function SectionPagerProvider({
  screens,
  children,
}: SectionPagerProviderProps) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<CurtainPhase>("idle");

  const indexRef = useRef(index);
  const phaseRef = useRef(phase);
  const countRef = useRef(screens.length);
  const pendingIndexRef = useRef<number | null>(null);
  // 首屏序幕先占住锁，序幕结束时再放行
  const lockedRef = useRef(true);
  const cooldownUntilRef = useRef(0);

  useEffect(() => {
    countRef.current = screens.length;
  }, [screens.length]);

  const setNavigationLocked = useCallback((locked: boolean) => {
    lockedRef.current = locked;
  }, []);

  const topOverscrollRef = useRef<(() => void) | null>(null);
  const registerTopOverscroll = useCallback((handler: () => void) => {
    topOverscrollRef.current = handler;
    return () => {
      if (topOverscrollRef.current === handler) {
        topOverscrollRef.current = null;
      }
    };
  }, []);

  // 相位与索引同步写入 ref：事件回调据此判定，不必等 React 提交
  const goToScreen = useCallback((next: number) => {
    if (lockedRef.current) return;
    if (phaseRef.current !== "idle") return;
    if (performance.now() < cooldownUntilRef.current) return;

    // 已在第一屏仍向上滑：交给注册的处理器（重播首屏序幕）
    if (next < 0 && indexRef.current === 0) {
      topOverscrollRef.current?.();
      return;
    }

    const target = Math.min(Math.max(next, 0), countRef.current - 1);
    if (target === indexRef.current) return;

    pendingIndexRef.current = target;
    phaseRef.current = "cover";
    setPhase("cover");
  }, []);

  const goToNextScreen = useCallback(() => {
    goToScreen(indexRef.current + 1);
  }, [goToScreen]);

  const goToPrevScreen = useCallback(() => {
    goToScreen(indexRef.current - 1);
  }, [goToScreen]);

  const handleCoverComplete = useCallback(() => {
    const target = pendingIndexRef.current;
    if (target !== null) {
      pendingIndexRef.current = null;
      indexRef.current = target;
      setIndex(target);
    }
    phaseRef.current = "reveal";
    setPhase("reveal");
  }, []);

  const handleRevealComplete = useCallback(() => {
    cooldownUntilRef.current = performance.now() + NAVIGATION_COOLDOWN_MS;
    phaseRef.current = "idle";
    setPhase("idle");
  }, []);

  // 序幕异常时的兜底解锁
  useEffect(() => {
    const timer = window.setTimeout(() => {
      lockedRef.current = false;
    }, LOCK_SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // 分页模式下页面本身不滚动，由属性驱动全局样式
  useEffect(() => {
    document.documentElement.setAttribute("data-section-pager", "");
    return () => document.documentElement.removeAttribute("data-section-pager");
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      // 始终吃掉滚轮，避免锁定期间浏览器仍做原生滚动
      event.preventDefault();
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
      goToScreen(indexRef.current + (event.deltaY > 0 ? 1 : -1));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // 焦点位于可输入控件时让位给原生输入行为
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          event.preventDefault();
          goToScreen(indexRef.current + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          goToScreen(indexRef.current - 1);
          break;
        case "Home":
          event.preventDefault();
          goToScreen(0);
          break;
        case "End":
          event.preventDefault();
          goToScreen(countRef.current - 1);
          break;
        default:
          break;
      }
    };

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const travelled = touchStartY - endY;
      if (Math.abs(travelled) < TOUCH_THRESHOLD) return;
      goToScreen(indexRef.current + (travelled > 0 ? 1 : -1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goToScreen]);

  const activeScreen = screens[index];
  const value = useMemo<SectionPagerValue>(
    () => ({
      index,
      count: screens.length,
      phase,
      navVariant: activeScreen?.navVariant ?? "studio",
      goToScreen,
      goToNextScreen,
      goToPrevScreen,
      setNavigationLocked,
      registerTopOverscroll,
    }),
    [
      index,
      screens.length,
      phase,
      activeScreen?.navVariant,
      goToScreen,
      goToNextScreen,
      goToPrevScreen,
      setNavigationLocked,
      registerTopOverscroll,
    ],
  );

  return (
    <SectionPagerContext.Provider value={value}>
      <div className="fixed inset-0 overflow-hidden">
        {screens.map((screen, screenIndex) => {
          const isActive = screenIndex === index;
          return (
            <div
              key={screen.key}
              className={`absolute inset-0 ${isActive ? "" : "invisible"}`}
              inert={!isActive}
            >
              {screen.node}
            </div>
          );
        })}
      </div>
      {children}
      <p aria-live="polite" className="sr-only">
        {activeScreen?.title ?? ""}
      </p>
      <AsciiCurtain
        phase={phase}
        reducedMotion={reducedMotion}
        onCoverComplete={handleCoverComplete}
        onRevealComplete={handleRevealComplete}
      />
    </SectionPagerContext.Provider>
  );
}
