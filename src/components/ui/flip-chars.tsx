"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import {
  buildFlipTimeline,
  FLIP_CHAR_TWEEN,
  setFlipCharsRest,
} from "@/animations/flip-chars";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export type FlipCharsHandle = {
  play: () => void;
  reverse: () => void;
};

type FlipCharsProps = {
  label: string;
  hoverLabel?: string;
  disabled?: boolean;
  /** 文案切换时播一次逐字翻入，再回到 hover 时间轴 */
  flipOnChange?: boolean;
  showHoverMark?: boolean;
  markOffsetY?: number;
  groupEntryWords?: boolean;
  firstTokenClassName?: string;
  /** 跟在文案后的内容（如箭头），随字一同翻入，不随宽度收缩而平移 */
  trailing?: () => ReactNode;
  className?: string;
};

function renderChars(
  text: string,
  keyPrefix: string,
  dataAttr: "data-flip-out" | "data-flip-in",
  groupEntryWords: boolean,
  firstTokenClassName?: string,
) {
  if (!groupEntryWords) {
    return Array.from(text).map((char, index) => (
      <span
        key={`${keyPrefix}-${index}-${char}`}
        {...{ [dataAttr]: "" }}
        className="inline-block origin-center will-change-transform"
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }

  const firstTokenLength = Array.from(
    text.trimStart().split(/\s+/)[0] ?? "",
  ).length;
  let charIndex = 0;
  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((token, tokenIndex) => {
      const chars = Array.from(token).map((char) => {
        const index = charIndex++;
        return (
          <span
            key={`${keyPrefix}-${index}-${char}`}
            {...{ [dataAttr]: "" }}
            className={`inline-block origin-center will-change-transform ${
              index < firstTokenLength ? (firstTokenClassName ?? "") : ""
            }`}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      });
      if (token.trim() === "") return chars;
      return (
        <span
          key={`${keyPrefix}-word-${tokenIndex}-${token}`}
          data-category-entry-word={dataAttr === "data-flip-out" ? "" : undefined}
          className={`inline-flex origin-center ${
            tokenIndex === 0 ? (firstTokenClassName ?? "") : ""
          }`}
        >
          {chars}
        </span>
      );
    });
}

function renderTrailing(
  side: "out" | "in",
  trailing?: () => ReactNode,
) {
  if (!trailing) return null;
  return (
    <span
      data-flip-trailing={side}
      className="inline-flex origin-center will-change-transform"
    >
      {trailing()}
    </span>
  );
}

/**
 * 双层逐字翻滚：hover 自翻，或在 label 变化时从旧文案翻到新文案。
 */
export const FlipChars = forwardRef<FlipCharsHandle, FlipCharsProps>(
  function FlipChars(
    {
      label,
      hoverLabel,
      disabled = false,
      flipOnChange = false,
      showHoverMark = false,
      markOffsetY = 0,
      groupEntryWords = false,
      firstTokenClassName,
      trailing,
      className,
    },
    forwardedRef,
  ) {
    const rootRef = useRef<HTMLSpanElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const changingRef = useRef(false);
    const committedRef = useRef(label);
    const reducedMotion = useReducedMotion();
    const enabled = !disabled && !reducedMotion;
    const [changeFrom, setChangeFrom] = useState<string | null>(null);

    useLayoutEffect(() => {
      if (!flipOnChange || !enabled) {
        committedRef.current = label;
        setChangeFrom(null);
        return;
      }
      if (label === committedRef.current) return;
      setChangeFrom(committedRef.current);
      committedRef.current = label;
    }, [enabled, flipOnChange, label]);

    changingRef.current = changeFrom !== null;
    const outLabel = changeFrom ?? label;
    const inLabel = changeFrom ? label : (hoverLabel ?? label);
    const reserveLabel =
      Array.from(outLabel).length >= Array.from(inLabel).length
        ? outLabel
        : inLabel;
    const layerClass = trailing
      ? "inline-flex items-center gap-1.5 whitespace-nowrap md:gap-[calc(var(--su)*6)]"
      : "inline-flex whitespace-nowrap";

    useEffect(() => {
      const el = rootRef.current;
      if (!el) return;

      const outChars = Array.from(
        el.querySelectorAll<HTMLElement>("[data-flip-out]"),
      );
      const inChars = Array.from(
        el.querySelectorAll<HTMLElement>("[data-flip-in]"),
      );
      const outTrailing = Array.from(
        el.querySelectorAll<HTMLElement>('[data-flip-trailing="out"]'),
      );
      const inTrailing = Array.from(
        el.querySelectorAll<HTMLElement>('[data-flip-trailing="in"]'),
      );
      const mark = el.querySelector<HTMLElement>("[data-flip-mark]");
      if (!outChars.length) return;

      setFlipCharsRest(
        [...outChars, ...outTrailing],
        [...inChars, ...inTrailing],
        changeFrom ? null : mark,
      );
      if (changeFrom && mark) {
        mark.style.opacity = "0";
      }

      if (!enabled) {
        timelineRef.current = null;
        return;
      }

      if (changeFrom) {
        const timeline = buildFlipTimeline(
          [...outChars, ...outTrailing],
          [...inChars, ...inTrailing],
          {
            paused: true,
          },
        );
        timelineRef.current = timeline;
        const total =
          FLIP_CHAR_TWEEN.overlap +
          FLIP_CHAR_TWEEN.duration +
          FLIP_CHAR_TWEEN.stagger *
            Math.max(
              0,
              Math.max(
                outChars.length + outTrailing.length,
                inChars.length + inTrailing.length,
              ) - 1,
            );
        const playId = window.requestAnimationFrame(() => {
          timeline.play(0);
        });
        const finish = () => {
          setChangeFrom((current) => (current === changeFrom ? null : current));
        };
        timeline.eventCallback("onComplete", finish);
        const fallback = window.setTimeout(finish, total * 1000 + 80);
        return () => {
          window.cancelAnimationFrame(playId);
          window.clearTimeout(fallback);
          timeline.eventCallback("onComplete", null);
          timeline.kill();
          timelineRef.current = null;
        };
      }

      const inTargets = mark ? [mark, ...inChars] : inChars;
      if (!inTargets.length) {
        timelineRef.current = null;
        return;
      }
      const timeline = buildFlipTimeline(outChars, inTargets);
      timelineRef.current = timeline;
      return () => {
        timeline.kill();
        timelineRef.current = null;
      };
    }, [changeFrom, enabled, inLabel, outLabel, showHoverMark]);

    useImperativeHandle(forwardedRef, () => ({
      play: () => {
        if (!enabled || changingRef.current) return;
        timelineRef.current?.play();
      },
      reverse: () => {
        if (!enabled || changingRef.current) return;
        timelineRef.current?.reverse();
      },
    }));

    return (
      <span
        ref={rootRef}
        aria-hidden="true"
        className={`relative inline-block overflow-visible ${className ?? ""}`}
      >
        {showHoverMark && (
          <span
            className="pointer-events-none absolute right-full top-1/2 mr-0.5 flex -translate-y-1/2 items-center md:mr-1"
            style={markOffsetY ? { marginTop: `${markOffsetY}px` } : undefined}
          >
            <span
              data-flip-mark
              className={
                enabled
                  ? "block size-2 origin-center bg-current will-change-transform md:size-[calc(var(--su)*12)]"
                  : "block size-2 origin-center bg-current opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 md:size-[calc(var(--su)*12)]"
              }
            />
          </span>
        )}
        <span className={`invisible ${layerClass}`}>
          {Array.from(reserveLabel).map((char, index) => (
            <span key={`reserve-${index}-${char}`}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
          {trailing?.()}
        </span>
        <span className={`absolute left-0 top-0 ${layerClass}`}>
          {renderChars(
            outLabel,
            "out",
            "data-flip-out",
            groupEntryWords,
            firstTokenClassName,
          )}
          {renderTrailing("out", trailing)}
        </span>
        {enabled && (
          <span className={`absolute left-0 top-0 ${layerClass}`}>
            {renderChars(
              inLabel,
              "in",
              "data-flip-in",
              groupEntryWords,
              firstTokenClassName,
            )}
            {renderTrailing("in", trailing)}
          </span>
        )}
      </span>
    );
  },
);
