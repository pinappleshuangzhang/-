"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type ReactNode,
} from "react";
import { FlipChars, type FlipCharsHandle } from "@/components/ui/flip-chars";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * 鼠标点击同样会让元素拿到焦点，但只有键盘操作才需要焦点提示；
 * 若按 :focus 点亮方块，鼠标点完移开也收不回来。
 * Safari 15.0–15.3 不认 :focus-visible，退回“有焦点即提示”。
 */
export function shouldMarkFocus(el: Element) {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

type FlipHoverButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 传入后渲染为原生链接；适用于 mailto 等必须由浏览器直接处理的协议 */
  href?: string;
  /** 默认可见文案 */
  label: string;
  /** hover 时翻入的文案；不传则与 label 相同（自翻滚） */
  hoverLabel?: string;
  /** 关闭翻滚动画，仅作普通按钮 */
  disableFlip?: boolean;
  /** 文案切换时播一次逐字翻入（如 已复制 → 联系我们） */
  flipOnChange?: boolean;
  /** hover / 键盘焦点时在文案前显示 12px 黑色方块（Figma 893:2761） */
  showHoverMark?: boolean;
  /** 点击后立即收起方块并失焦，需再次 hover 才出现（语言切换等） */
  resetMarkOnClick?: boolean;
  /** 为外部入场时间轴按词提供分组，不改变内部逐字 hover 结构 */
  groupEntryWords?: boolean;
  /** 首个非空白词的字体等样式，出入两层保持一致 */
  firstTokenClassName?: string;
  /** hover 方块相对文字中线的垂直微调 */
  markOffsetY?: number;
  children?: ReactNode;
};

/**
 * sondaven.com 式导航 hover：双层逐字翻滚替换。
 * 旧字向上缩没，新字从下方放大顶入；stagger 自左向右，只动 transform / opacity。
 * 前方黑方块绝对定位在文字左侧（默认不占位），作为 stagger 首位与文字同套翻入。
 */
export const FlipHoverButton = forwardRef<
  HTMLButtonElement,
  FlipHoverButtonProps
>(function FlipHoverButton(
  {
    label,
    href,
    hoverLabel,
    disableFlip = false,
    flipOnChange = false,
    showHoverMark = true,
    resetMarkOnClick = false,
    groupEntryWords = false,
    firstTokenClassName,
    markOffsetY = 0,
    className,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onClick,
    children,
    ...props
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLElement>(null);
  const flipRef = useRef<FlipCharsHandle>(null);
  const reducedMotion = useReducedMotion();
  const flipEnabled = !disableFlip && !reducedMotion;

  const setRefs = (node: HTMLButtonElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };
  const setLinkRef = (node: HTMLAnchorElement | null) => {
    localRef.current = node;
  };

  const play = () => flipRef.current?.play();
  const reverse = () => flipRef.current?.reverse();
  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    if (shouldMarkFocus(event.currentTarget)) play();
  };

  useEffect(() => {
    if (!flipEnabled) return;
    const collapse = () => reverse();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") collapse();
    };
    window.addEventListener("blur", collapse);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", collapse);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [flipEnabled]);

  const content = (
    <>
      <FlipChars
        ref={flipRef}
        label={label}
        hoverLabel={hoverLabel}
        disabled={disableFlip}
        flipOnChange={flipOnChange}
        showHoverMark={showHoverMark}
        markOffsetY={markOffsetY}
        groupEntryWords={groupEntryWords}
        firstTokenClassName={firstTokenClassName}
      />
      {children}
    </>
  );

  const controlClassName = `group relative inline-flex items-center overflow-visible ${className ?? ""}`;

  if (href) {
    return (
      <a
        ref={setLinkRef}
        href={href}
        aria-label={props["aria-label"] ?? label}
        className={controlClassName}
        onMouseEnter={play}
        onMouseLeave={reverse}
        onFocus={handleFocus}
        onBlur={reverse}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={setRefs}
      type="button"
      {...props}
      aria-label={props["aria-label"] ?? label}
      className={controlClassName}
      onMouseEnter={(event) => {
        play();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        reverse();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        handleFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        reverse();
        onBlur?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!resetMarkOnClick || event.defaultPrevented) return;
        reverse();
        localRef.current?.blur();
      }}
    >
      {content}
    </button>
  );
});
