"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type FlipHoverButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 默认可见文案 */
  label: string;
  /** hover 时翻入的文案；不传则与 label 相同（自翻滚） */
  hoverLabel?: string;
  /** 关闭翻滚动画，仅作普通按钮 */
  disableFlip?: boolean;
  /** hover / 焦点时在文案前显示 12px 黑色方块（Figma 893:2761） */
  showHoverMark?: boolean;
  /** 为外部入场时间轴按词提供分组，不改变内部逐字 hover 结构 */
  groupEntryWords?: boolean;
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
    hoverLabel,
    disableFlip = false,
    showHoverMark = true,
    groupEntryWords = false,
    className,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    children,
    ...props
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotion = useReducedMotion();
  const outCharsList = Array.from(label);
  const inCharsList = Array.from(hoverLabel ?? label);
  const flipEnabled = !disableFlip && !reducedMotion;
  let outCharIndex = 0;
  const outContent = groupEntryWords
    ? label
        .split(/(\s+)/)
        .filter(Boolean)
        .map((token, tokenIndex) => {
          const chars = Array.from(token);
          const content = chars.map((char) => {
            const index = outCharIndex++;
            return (
              <span
                key={`out-${index}-${char}`}
                data-flip-out
                className="inline-block origin-center will-change-transform"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          });

          return token.trim() === "" ? (
            content
          ) : (
            <span
              key={`entry-word-${tokenIndex}-${token}`}
              data-category-entry-word
              className="inline-flex origin-center"
            >
              {content}
            </span>
          );
        })
    : outCharsList.map((char, index) => (
        <span
          key={`out-${index}-${char}`}
          data-flip-out
          className="inline-block origin-center will-change-transform"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ));

  useEffect(() => {
    // 始终用本地 ref 查 DOM，避免外部 closeRef 尚未写入时时间轴建失败
    const el = localRef.current;
    if (!el) return;

    const outChars = el.querySelectorAll<HTMLElement>("[data-flip-out]");
    const inChars = el.querySelectorAll<HTMLElement>("[data-flip-in]");
    const mark = el.querySelector<HTMLElement>("[data-flip-mark]");
    if (!outChars.length) return;
    if (!inChars.length && !mark) return;

    gsap.set(outChars, { yPercent: 0, scale: 1, opacity: 1, force3D: true });
    if (inChars.length) {
      gsap.set(inChars, {
        yPercent: 75,
        scale: 0,
        opacity: 0,
        force3D: true,
      });
    }
    if (mark) {
      gsap.set(mark, {
        yPercent: 75,
        scale: 0,
        opacity: 0,
        force3D: true,
      });
    }

    if (!flipEnabled) {
      timelineRef.current = null;
      return;
    }

    const inTargets = mark
      ? [mark, ...Array.from(inChars)]
      : Array.from(inChars);

    const timeline = gsap.timeline({ paused: true });
    timeline.to(
      outChars,
      {
        yPercent: -75,
        scale: 0,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.04,
      },
      0,
    );
    if (inTargets.length) {
      timeline.to(
        inTargets,
        {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.04,
        },
        0.15,
      );
    }
    timelineRef.current = timeline;

    return () => {
      timeline.kill();
      timelineRef.current = null;
    };
  }, [disableFlip, flipEnabled, hoverLabel, label, reducedMotion, showHoverMark]);

  const setRefs = (node: HTMLButtonElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const play = () => {
    if (!flipEnabled) return;
    timelineRef.current?.play();
  };
  const reverse = () => {
    if (!flipEnabled) return;
    timelineRef.current?.reverse();
  };

  return (
    <button
      ref={setRefs}
      type="button"
      {...props}
      aria-label={props["aria-label"] ?? label}
      className={`group relative inline-flex items-center overflow-visible ${className ?? ""}`}
      onMouseEnter={(event) => {
        play();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        reverse();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        play();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        reverse();
        onBlur?.(event);
      }}
    >
      <span className="relative inline-block overflow-visible" aria-hidden="true">
        {/* 绝对定位在文字左侧：默认不占位，hover 翻入且文字不位移 */}
        {showHoverMark && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-0.5 flex -translate-y-1/2 items-center md:mr-1">
            <span
              data-flip-mark
              className={
                flipEnabled
                  ? "block size-2 origin-center bg-grey-400 will-change-transform md:size-3"
                  : "block size-2 origin-center bg-grey-400 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:size-3"
              }
            />
          </span>
        )}
        <span className="inline-flex whitespace-nowrap">
          {outContent}
        </span>
        {!disableFlip && (
          <span className="absolute inset-0 inline-flex whitespace-nowrap">
            {inCharsList.map((char, index) => (
              <span
                key={`in-${index}-${char}`}
                data-flip-in
                className="inline-block origin-center will-change-transform"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        )}
      </span>
      {children}
    </button>
  );
});
