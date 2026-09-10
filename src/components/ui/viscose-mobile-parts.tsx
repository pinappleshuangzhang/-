"use client";

import { segmentWords } from "@/components/ui/split-words";

/**
 * 逐词拆分；`swap` 标记随分类切换而更换的文字，切换时单独重播入场。
 * 词以 opacity-0 类隐藏，GSAP 行内样式接管后才可见，所以新渲染的词天然处于隐藏态。
 */
export function MobileWords({
  text,
  swap = false,
  className,
}: {
  text: string;
  swap?: boolean;
  className?: string;
}) {
  return (
    <>
      {segmentWords(text).map((word, index) =>
        word.trim() === "" ? (
          " "
        ) : (
          <span
            key={`${index}-${word}`}
            data-mobile-word=""
            data-mobile-swap={swap ? "" : undefined}
            className={`inline-block origin-center opacity-0 ${className ?? ""}`}
          >
            {word}
          </span>
        ),
      )}
    </>
  );
}

export function MobileArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path d="M7 17.5 17.5 7" stroke="currentColor" strokeWidth="1" />
      <path d="M8.5 7h9v9" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

type MobileCategoryChipsProps = {
  label: string;
  categoryLabels: string[];
  active: number;
  className?: string;
  onPick: (index: number) => void;
};

/** 五个调查类型 chip：底色独立成层，像第三屏高亮条一样从左向右擦入 */
export function MobileCategoryChips({
  label,
  categoryLabels,
  active,
  className,
  onPick,
}: MobileCategoryChipsProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`grid grid-cols-3 gap-2 ${className ?? ""}`}
    >
      {categoryLabels.map((text, index) => {
        const isActive = index === active;
        return (
          <button
            key={text}
            type="button"
            aria-pressed={isActive}
            onClick={() => onPick(index)}
            className={`relative flex h-[21px] gap-1 px-2 py-0.5 text-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 ${
              isActive ? "items-center text-white" : "items-end text-grey-300"
            }`}
          >
            <span
              data-mobile-bar=""
              aria-hidden="true"
              className={`absolute inset-0 origin-left scale-x-0 ${
                isActive ? "bg-grey-400" : "bg-grey-50"
              }`}
            />
            {isActive ? (
              <span
                data-mobile-word=""
                data-mobile-swap=""
                aria-hidden="true"
                className="relative size-2.5 shrink-0 bg-white opacity-0"
              />
            ) : null}
            <span
              data-mobile-word=""
              className="relative inline-block origin-center font-bodoni leading-[15px] opacity-0"
            >
              {String(index + 1).padStart(3, "0")}
            </span>
            <span className="relative whitespace-nowrap font-serif-sc leading-[17px]">
              <MobileWords text={text} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
