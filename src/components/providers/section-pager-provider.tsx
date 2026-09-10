"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import { AsciiCurtain } from "@/components/effects/ascii-curtain";
import { useLocale } from "@/components/providers/locale-provider";
import { SharedSectionBackgrounds } from "@/components/ui/shared-section-backgrounds";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { CurtainPhase } from "@/lib/ascii-curtain";
import type { MessageKey } from "@/lib/i18n/messages";
import type { NavVariant } from "@/lib/nav-variants";
import type { SectionBackgroundKey } from "@/lib/section-backgrounds";

/** 滚轮累计阈值（换算为像素后）；过低易误触，过高则 Safari 行模式/短手势切不动 */
const WHEEL_THRESHOLD = 8;
/** 触摸滑动超过该距离（px）才切屏 */
const TOUCH_THRESHOLD = 48;
/** reveal 结束后的冷却时长，吃掉触控板惯性避免连翻 */
const NAVIGATION_COOLDOWN_MS = 400;
/** 首屏序幕的兜底解锁时限，防止序幕异常导致全站卡死 */
const LOCK_SAFETY_TIMEOUT_MS = 15000;
/** 幕布相位卡死兜底：cover/reveal 超时强制回到 idle */
const PHASE_SAFETY_TIMEOUT_MS = 2500;
/** 作品详情抽屉与屏内延迟文案由各自时序管理，不参与整屏统一入场 */
const GLOBAL_REVEAL_EXCLUDE =
  "[data-survey-drawer], [data-sd-global-ignore]";
/** 诊断开关：需要排查切屏时置 true，Safari 控制台过滤 WHEEL / PAGER */
const DEBUG_SECTION_PAGER = false;

/** 与 Lenis 一致：把 deltaMode 行/页换算成近似像素，避免 Safari 行模式永远累计不够 */
function normalizeWheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * (100 / 6);
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/** wheel 落在文字节点上时 target 不是 Element，closest 会失效并被切屏逻辑吃掉 */
function eventClosest(target: EventTarget | null, selector: string): Element | null {
  if (target instanceof Element) return target.closest(selector);
  if (target instanceof Node) return target.parentElement?.closest(selector) ?? null;
  return null;
}

export type PagerScreen = {
  key: string;
  navVariant: NavVariant;
  /** 切屏后播报给读屏软件的屏名文案键 */
  titleKey: MessageKey;
  /** 共享背景键：同键多屏共用一份背景，不在屏内重复挂图 */
  background: SectionBackgroundKey;
  /** 特殊序幕屏可关闭统一入场，默认开启 */
  globalWordReveal?: boolean;
  node: ReactNode;
};

type SectionPagerValue = {
  index: number;
  count: number;
  phase: CurtainPhase;
  navVariant: NavVariant;
  /** 首屏序幕等场景是否锁定切屏（锁定时隐藏切屏提示） */
  navigationLocked: boolean;
  /**
   * 首屏加载序幕的遮罩是否还在场。
   * 遮罩靠 z-index 压住导航并不可靠（一旦被设 clip-path 就会失效），
   * 因此导航据此显式隐藏，等遮罩卸载后再淡入。
   */
  introOverlayActive: boolean;
  setIntroOverlayActive: (active: boolean) => void;
  /** onCovered 在幕布铺满时执行，用于把关闭覆盖层等动作藏在幕布后面 */
  goToScreen: (index: number, onCovered?: () => void) => void;
  goToNextScreen: () => void;
  goToPrevScreen: () => void;
  /** 首屏序幕等场景下暂时禁止切屏 */
  setNavigationLocked: (locked: boolean) => void;
  /**
   * 不切换屏幕，但走一次完整的幕布过场：
   * 幕布铺满视口时执行 onCovered（如重置首屏序幕），随后幕布消散。
   * 幕布正忙或处于切屏冷却期时返回 false，调用方可自行兜底。
   */
  runWithCurtain: (onCovered: () => void) => boolean;
  /** 注册“已在第一屏仍继续向上滑”的处理器（如重播首屏序幕），返回注销函数 */
  registerTopOverscroll: (handler: () => void) => () => void;
  /**
   * 注册屏内滚动拦截器（如滚动擦撦视频）：返回 true 表示本次滚动已被消费，
   * 不触发切屏；返回 false 则按正常逻辑切屏。返回注销函数。
   */
  registerScrollInterceptor: (
    handler: (deltaY: number) => boolean,
  ) => () => void;
};

/** 当前分屏是否处于激活状态（供屏组件感知自己是否可见） */
const ScreenActiveContext = createContext(false);

export function useScreenActive() {
  return useContext(ScreenActiveContext);
}

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
  const { locale, t } = useLocale();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<CurtainPhase>("idle");
  const [navigationLocked, setNavigationLockedState] = useState(true);
  // 首屏序幕遮罩一开始就在场，由 Hero 在遮罩卸载时置 false
  const [introOverlayActive, setIntroOverlayActive] = useState(true);

  const indexRef = useRef(index);
  const phaseRef = useRef(phase);
  const countRef = useRef(screens.length);
  const pendingIndexRef = useRef<number | null>(null);
  // 幕布铺满时要执行的屏内动作（不换屏，如重播首屏序幕）
  const pendingActionRef = useRef<(() => void) | null>(null);
  // 首屏序幕先占住锁，序幕结束时再放行
  const lockedRef = useRef(true);
  const cooldownUntilRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    countRef.current = screens.length;
  }, [screens.length]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const setNavigationLocked = useCallback((locked: boolean) => {
    lockedRef.current = locked;
    setNavigationLockedState(locked);
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

  const scrollInterceptorRef = useRef<((deltaY: number) => boolean) | null>(
    null,
  );
  const registerScrollInterceptor = useCallback(
    (handler: (deltaY: number) => boolean) => {
      scrollInterceptorRef.current = handler;
      return () => {
        if (scrollInterceptorRef.current === handler) {
          scrollInterceptorRef.current = null;
        }
      };
    },
    [],
  );

  // 相位与索引同步写入 ref：事件回调据此判定，不必等 React 提交
  const goToScreen = useCallback((next: number, onCovered?: () => void) => {
    if (lockedRef.current) return;
    if (phaseRef.current !== "idle") return;
    if (performance.now() < cooldownUntilRef.current) return;

    // 已在第一屏仍向上滑：交给注册的处理器；未注册则忽略
    if (next < 0 && indexRef.current === 0) {
      topOverscrollRef.current?.();
      return;
    }

    const target = Math.min(Math.max(next, 0), countRef.current - 1);
    if (target === indexRef.current) return;

    pendingIndexRef.current = target;
    if (onCovered) pendingActionRef.current = onCovered;
    phaseRef.current = "cover";
    setPhase("cover");
  }, []);

  const runWithCurtain = useCallback((onCovered: () => void) => {
    if (phaseRef.current !== "idle") return false;
    if (performance.now() < cooldownUntilRef.current) return false;

    pendingActionRef.current = onCovered;
    phaseRef.current = "cover";
    setPhase("cover");
    return true;
  }, []);

  /** 切屏前先询问屏内拦截器，被消费则不切屏 */
  const navigate = useCallback(
    (deltaY: number) => {
      if (
        !lockedRef.current &&
        phaseRef.current === "idle" &&
        performance.now() >= cooldownUntilRef.current &&
        scrollInterceptorRef.current?.(deltaY)
      ) {
        return;
      }
      if (Math.abs(deltaY) < WHEEL_THRESHOLD) return;
      goToScreen(indexRef.current + (deltaY > 0 ? 1 : -1));
    },
    [goToScreen],
  );

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
    const action = pendingActionRef.current;
    if (action) {
      pendingActionRef.current = null;
      action();
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
      setNavigationLockedState(false);
    }, LOCK_SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // 幕布相位卡死兜底（Safari Canvas/ticker 异常时 cover 永不结束）
  useEffect(() => {
    if (phase === "idle") return;
    const timer = window.setTimeout(() => {
      if (DEBUG_SECTION_PAGER) {
        console.warn("PAGER phase safety unlock", phaseRef.current);
      }
      if (phaseRef.current === "cover") {
        handleCoverComplete();
        return;
      }
      if (phaseRef.current === "reveal") {
        handleRevealComplete();
      }
    }, PHASE_SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, handleCoverComplete, handleRevealComplete]);

  // 分页模式下页面本身不滚动；Safari 需额外 fixed 锁，单靠 overflow:hidden 不够。
  // 不要给 body 设 touch-action:none：iOS WebKit 沿祖先链直接求交、不在滚动容器处重置，
  // 会把屏内 touch-pan-y 一并抹掉，导致原生滚动完全失效。回弹由 touchmove 里 preventDefault 处理。
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.setAttribute("data-section-pager", "");

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyInset: body.style.inset,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.inset = "0";
    body.style.width = "100%";
    body.style.height = "100%";

    return () => {
      html.removeAttribute("data-section-pager");
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.inset = prev.bodyInset;
      body.style.width = prev.bodyWidth;
      body.style.height = prev.bodyHeight;
    };
  }, []);

  useEffect(() => {
    const WHEEL_ACCUM_RESET_MS = 200;
    let wheelAccum = 0;
    let wheelResetTimer = 0;
    // 同一手势可能同时触发 touch 与 pointer，短暂互斥避免连翻两屏
    let gestureLockUntil = 0;

    const onWheel = (event: WheelEvent) => {
      if (
        eventClosest(event.target, "[data-survey-drawer]") ||
        document.querySelector("[data-survey-drawer]")
      ) {
        return;
      }
      // 始终吃掉滚轮，避免锁定期间浏览器仍做原生滚动
      event.preventDefault();
      const normalized = normalizeWheelDeltaY(event);
      // Safari 触控板/鼠标常发很小的 delta 或 deltaMode=行；需换算后累计
      wheelAccum += normalized;
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAccum = 0;
      }, WHEEL_ACCUM_RESET_MS);

      if (DEBUG_SECTION_PAGER) {
        // 临时诊断：Safari 控制台过滤 WHEEL
        console.warn(
          "WHEEL",
          event.deltaY,
          event.deltaMode,
          "norm",
          normalized,
          "accum",
          wheelAccum,
          "page",
          indexRef.current,
          "phase",
          phaseRef.current,
          "locked",
          lockedRef.current,
        );
      }

      if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
      const delta = wheelAccum;
      wheelAccum = 0;
      navigate(delta);
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
          navigate(WHEEL_THRESHOLD + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          navigate(-(WHEEL_THRESHOLD + 1));
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

    let touchStartY: number | null = null;
    let touchCurrentY: number | null = null;
    let touchScrollContainer: HTMLElement | null = null;
    let touchHandledByNativeScroll = false;
    // 手势起点是否已贴在滚动容器的顶/底，用于松手时兜底判定切屏
    let touchStartAtTop = false;
    let touchStartAtBottom = false;
    // 首个 touchmove 常带亚像素抖动，未超过死区前不下判断
    const TOUCH_DECISION_DEADZONE = 4;

    const isAtTop = (el: HTMLElement) => el.scrollTop <= 1;
    const isAtBottom = (el: HTMLElement) =>
      el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    const findScrollableAncestor = (target: EventTarget | null) => {
      let element = target instanceof HTMLElement ? target : null;
      while (element && element !== document.body) {
        const overflowY = window.getComputedStyle(element).overflowY;
        if (
          (overflowY === "auto" || overflowY === "scroll") &&
          element.scrollHeight > element.clientHeight
        ) {
          return element;
        }
        element = element.parentElement;
      }
      return null;
    };

    const commitSwipe = (travelled: number) => {
      if (Math.abs(travelled) < TOUCH_THRESHOLD) return;
      if (performance.now() < gestureLockUntil) return;
      gestureLockUntil = performance.now() + 350;
      navigate(travelled);
    };

    const onTouchStart = (event: TouchEvent) => {
      const target = event.target;
      if (
        eventClosest(target, "[data-survey-drawer]") &&
        !eventClosest(target, "[data-survey-scroller]")
      ) {
        touchStartY = null;
        touchCurrentY = null;
        touchScrollContainer = null;
        touchHandledByNativeScroll = false;
        return;
      }
      if (event.touches.length !== 1) {
        touchStartY = null;
        touchCurrentY = null;
        touchScrollContainer = null;
        touchHandledByNativeScroll = false;
        return;
      }
      touchStartY = event.touches[0]?.clientY ?? null;
      touchCurrentY = touchStartY;
      touchScrollContainer = findScrollableAncestor(event.target);
      touchHandledByNativeScroll = false;
      touchStartAtTop = touchScrollContainer
        ? isAtTop(touchScrollContainer)
        : false;
      touchStartAtBottom = touchScrollContainer
        ? isAtBottom(touchScrollContainer)
        : false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY === null) return;
      // 本手势已判定为屏内原生滚动后，绝不再 preventDefault，避免打断惯性
      if (touchHandledByNativeScroll) return;
      touchCurrentY = event.touches[0]?.clientY ?? touchCurrentY;
      const travelled =
        touchCurrentY === null ? 0 : touchStartY - touchCurrentY;
      if (touchScrollContainer && Math.abs(travelled) < TOUCH_DECISION_DEADZONE) {
        return;
      }
      const canScrollNatively =
        touchScrollContainer &&
        (travelled > 0
          ? !isAtBottom(touchScrollContainer)
          : !isAtTop(touchScrollContainer));
      if (canScrollNatively) {
        touchHandledByNativeScroll = true;
        return;
      }
      if (
        touchCurrentY !== null &&
        Math.abs(travelled) >= WHEEL_THRESHOLD &&
        event.cancelable
      ) {
        // 阻止 Safari / Chrome 将纵向手势接管为页面回弹或工具栏手势。
        event.preventDefault();
      }
    };

    const finishTouch = (event: TouchEvent) => {
      if (touchStartY === null) return;
      const endY =
        event.changedTouches[0]?.clientY ?? touchCurrentY ?? touchStartY;
      const travelled = touchStartY - endY;
      const container = touchScrollContainer;
      touchStartY = null;
      touchCurrentY = null;
      touchScrollContainer = null;
      if (touchHandledByNativeScroll) {
        touchHandledByNativeScroll = false;
        // iOS 回弹/惯性阶段可能误判为原生滚动：起点与终点都贴边、
        // 且滚动位置没变时，视为在边缘继续滑，放行切屏
        const stuckAtEdge =
          container &&
          (travelled > 0
            ? touchStartAtBottom && isAtBottom(container)
            : touchStartAtTop && isAtTop(container));
        if (!stuckAtEdge) return;
      }
      commitSwipe(travelled);
    };

    // 注意：不要再挂 pointer* 触控切屏。
    // iOS Safari 会同时派发 touch 与 pointer；原先 pointermove 无条件
    // preventDefault，并在 pointerup 再次 commitSwipe → scrollTop 叠滚，
    // 屏内原生滑动会严重掉帧。触控只走上方 touch* 路径。

    // Safari：capture 阶段挂在 document，避免部分版本 window 冒泡收不到 wheel
    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", finishTouch, { passive: true });
    window.addEventListener("touchcancel", finishTouch, { passive: true });

    return () => {
      window.clearTimeout(wheelResetTimer);
      document.removeEventListener("wheel", onWheel, {
        capture: true,
      } as EventListenerOptions);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", finishTouch);
      window.removeEventListener("touchcancel", finishTouch);
    };
  }, [goToScreen, navigate]);

  const activeScreen = screens[index];

  // 所有普通分屏共用同一套逐词入场：新屏在幕布揭开期间保持隐藏，
  // 幕布完全退场后统一播放；作品详情抽屉不在扫描范围内。
  useLayoutEffect(() => {
    const root = stageRef.current?.querySelector<HTMLElement>(
      `[data-pager-screen="${activeScreen?.key ?? ""}"]`,
    );
    if (!root || activeScreen?.globalWordReveal === false) return;

    const options = { exclude: GLOBAL_REVEAL_EXCLUDE };
    if (reducedMotion) {
      setSondavenVisible(root, options);
      return;
    }
    if (phase === "cover") return;
    if (phase === "reveal") {
      setSondavenHidden(root, options);
      return;
    }

    setSondavenHidden(root, options);
    const timeline = playSondavenReveal(root, options);
    return () => {
      timeline.kill();
    };
  }, [
    activeScreen?.globalWordReveal,
    activeScreen?.key,
    locale,
    phase,
    reducedMotion,
  ]);

  const value = useMemo<SectionPagerValue>(
    () => ({
      index,
      count: screens.length,
      phase,
      navVariant: activeScreen?.navVariant ?? "studio",
      navigationLocked,
      goToScreen,
      goToNextScreen,
      goToPrevScreen,
      setNavigationLocked,
      introOverlayActive,
      setIntroOverlayActive,
      runWithCurtain,
      registerTopOverscroll,
      registerScrollInterceptor,
    }),
    [
      index,
      screens.length,
      phase,
      activeScreen?.navVariant,
      navigationLocked,
      goToScreen,
      goToNextScreen,
      goToPrevScreen,
      setNavigationLocked,
      introOverlayActive,
      runWithCurtain,
      registerTopOverscroll,
      registerScrollInterceptor,
    ],
  );

  return (
    <SectionPagerContext.Provider value={value}>
      <div
        ref={stageRef}
        data-pager-touch-surface
        className="fixed inset-x-0 top-0 h-[100dvh] overflow-hidden md:inset-0 md:h-auto"
      >
        <SharedSectionBackgrounds
          active={activeScreen?.background ?? null}
        />
        {screens.map((screen, screenIndex) => {
          const isActive = screenIndex === index;
          return (
            <div
              key={screen.key}
              data-pager-screen={screen.key}
              className={`absolute inset-0 ${isActive ? "" : "invisible"}`}
              inert={!isActive}
            >
              <ScreenActiveContext.Provider value={isActive}>
                {screen.node}
              </ScreenActiveContext.Provider>
            </div>
          );
        })}
      </div>
      {children}
      <p aria-live="polite" className="sr-only">
        {activeScreen ? t(activeScreen.titleKey) : ""}
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
