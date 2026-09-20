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
  /** 跟在该层文案后的内容（如箭头 / 对勾），随字一同翻入 */
  trailing?: (layerLabel: string) => ReactNode;
  /** 在文案前、与 hover 黑方块同槽位（如导航复制对勾） */
  leading?: (layerLabel: string) => ReactNode;
  /** 占位文案；不传则取当前出入层中较长的一档 */
  reserveLabel?: string;
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
        className="inline-block h-[1em] origin-center leading-none will-change-transform"
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
            className={`inline-block h-[1em] origin-center leading-none will-change-transform ${
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
  layerLabel: string,
  trailing?: (layerLabel: string) => ReactNode,
) {
  const node = trailing?.(layerLabel);
  if (!node) return null;
  return (
    <span
      data-flip-trailing={side}
      className="inline-flex items-center origin-center will-change-transform"
    >
      {node}
    </span>
  );
}

function renderLeading(
  side: "out" | "in",
  layerLabel: string,
  leading?: (layerLabel: string) => ReactNode,
) {
  const node = leading?.(layerLabel);
  if (!node) return null;
  return (
    <span className="pointer-events-none absolute right-full top-1/2 mr-0.5 flex -translate-y-1/2 items-center md:mr-1">
      <span
        data-flip-leading={side}
        className="inline-flex items-center origin-center will-change-transform"
      >
        {node}
      </span>
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
      leading,
      reserveLabel: reserveLabelProp,
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
      reserveLabelProp ??
      (Array.from(outLabel).length >= Array.from(inLabel).length
        ? outLabel
        : inLabel);
    const charsClass = "inline-flex items-center whitespace-nowrap leading-none";
    const layerClass = trailing
      ? "inline-flex items-center gap-1.5 whitespace-nowrap leading-none md:gap-[calc(var(--su)*6)]"
      : charsClass;

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
      const outLeading = Array.from(
        el.querySelectorAll<HTMLElement>('[data-flip-leading="out"]'),
      );
      const inLeading = Array.from(
        el.querySelectorAll<HTMLElement>('[data-flip-leading="in"]'),
      );
      const mark = el.querySelector<HTMLElement>("[data-flip-mark]");
      if (!outChars.length) return;

      setFlipCharsRest(
        [...outChars, ...outTrailing, ...outLeading],
        [...inChars, ...inTrailing, ...inLeading],
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
          [...outChars, ...outTrailing, ...outLeading],
          [...inChars, ...inTrailing, ...inLeading],
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
                outChars.length + outTrailing.length + outLeading.length,
                inChars.length + inTrailing.length + inLeading.length,
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
        className={`relative inline-block overflow-visible leading-none ${className ?? ""}`}
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
          <span className={charsClass}>
            {Array.from(reserveLabel).map((char, index) => (
              <span
                key={`reserve-${index}-${char}`}
                className="inline-block h-[1em] leading-none"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          {trailing?.(reserveLabel)}
        </span>
        <span className={`absolute left-0 top-0 ${layerClass}`}>
          {renderLeading("out", outLabel, leading)}
          <span className={charsClass}>
            {renderChars(
              outLabel,
              "out",
              "data-flip-out",
              groupEntryWords,
              firstTokenClassName,
            )}
          </span>
          {renderTrailing("out", outLabel, trailing)}
        </span>
        {enabled && (
          <span className={`absolute left-0 top-0 ${layerClass}`}>
            {renderLeading("in", inLabel, leading)}
            <span className={charsClass}>
              {renderChars(
                inLabel,
                "in",
                "data-flip-in",
                groupEntryWords,
                firstTokenClassName,
              )}
            </span>
            {renderTrailing("in", inLabel, trailing)}
          </span>
        )}
      </span>
    );
  },
);
