"use client";

import gsap from "gsap";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { segmentWords } from "@/components/ui/split-words";

export type ViscoseMobileWork = { title: string; description: string };

export type ViscoseMobileStageHandle = {
  /** 大图落位时调用：所有文字逐词出现，chip、分隔线、投影、按钮一并显现 */
  reveal: () => void;
  /** 回到入场前的隐藏态（重播入场时使用） */
  hide: () => void;
};

type ViscoseMobileStageProps = {
  /** 当前展示的卡片（0..4，对应五个调查类型） */
  active: number;
  heading: string;
  categoryLabels: string[];
  works: ViscoseMobileWork[];
  viewDetailsLabel: string;
  onPickCategory: (index: number) => void;
  onViewDetails: (index: number) => void;
};

const HIDDEN = { opacity: 0, yPercent: 75, scale: 0 };
const SHOWN = { opacity: 1, yPercent: 0, scale: 1 };
/** Figma 947-3937 投影：304.9 × 47，距左 42.1，顶边 511.8（390 画板） */
const SHADOW = { left: "10.8%", width: "78.2%", top: 512, height: 47, blur: 14 };

/**
 * 逐词拆分；`swap` 标记随分类切换而更换的文字，切换时单独重播入场。
 * 词以 opacity-0 类隐藏，GSAP 行内样式接管后才可见，所以新渲染的词天然处于隐藏态。
 */
function Words({
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

function ArrowIcon() {
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

/** 第五屏移动端第三阶段版式（Figma 947-3937）；大图本体由 WebGL 卡片放大而来。 */
export const ViscoseMobileStage = forwardRef<
  ViscoseMobileStageHandle,
  ViscoseMobileStageProps
>(function ViscoseMobileStage(
  {
    active,
    heading,
    categoryLabels,
    works,
    viewDetailsLabel,
    onPickCategory,
    onViewDetails,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const work = works[active] ?? { title: "", description: "" };
  const number = `(${String(active + 1).padStart(2, "0")})`;

  const collect = useCallback(
    (selector: string) =>
      rootRef.current
        ? Array.from(rootRef.current.querySelectorAll<HTMLElement>(selector))
        : [],
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      reveal() {
        revealedRef.current = true;
        const words = collect("[data-mobile-word]");
        const blocks = collect("[data-mobile-block]");
        const lines = collect("[data-mobile-line]");
        gsap.killTweensOf([...words, ...blocks, ...lines]);
        gsap.fromTo(words, HIDDEN, {
          ...SHOWN,
          duration: 0.8,
          ease: "power2.out",
          stagger: { amount: 1.6, from: "random" },
        });
        gsap.fromTo(
          blocks,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.06 },
        );
        gsap.fromTo(
          lines,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power2.out" },
        );
      },
      hide() {
        revealedRef.current = false;
        const words = collect("[data-mobile-word]");
        const blocks = collect("[data-mobile-block]");
        const lines = collect("[data-mobile-line]");
        gsap.killTweensOf([...words, ...blocks, ...lines]);
        gsap.set(words, HIDDEN);
        gsap.set(blocks, { opacity: 0 });
        gsap.set(lines, { scaleX: 0 });
      },
    }),
    [collect],
  );

  useEffect(() => {
    if (!revealedRef.current) return;
    const words = collect("[data-mobile-swap]");
    gsap.killTweensOf(words);
    gsap.fromTo(words, HIDDEN, {
      ...SHOWN,
      duration: 0.6,
      ease: "power2.out",
      stagger: { amount: 0.8, from: "random" },
    });
    return () => {
      gsap.killTweensOf(words);
    };
  }, [active, collect]);

  const shadowPad = SHADOW.blur * 3;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-10 md:hidden"
    >
      <div className="absolute inset-x-3 top-[109px] flex h-[46px] items-center justify-between text-grey-400">
        <p className="font-serif-sc text-32 leading-[46px]">
          <Words text={heading} />
        </p>
        <p className="font-bodoni text-32 leading-10">
          <span
            key={number}
            data-mobile-word=""
            data-mobile-swap=""
            className="inline-block origin-center opacity-0"
          >
            {number}
          </span>
        </p>
      </div>

      <span
        data-mobile-line=""
        aria-hidden="true"
        className="absolute inset-x-3 top-[191px] h-px origin-left scale-x-0 bg-grey-100"
      />

      <div
        role="group"
        aria-label={heading}
        className="pointer-events-auto absolute inset-x-3 top-[227px] grid grid-cols-3 gap-2"
      >
        {categoryLabels.map((label, index) => {
          const isActive = index === active;
          return (
            <button
              key={label}
              type="button"
              data-mobile-block=""
              aria-pressed={isActive}
              onClick={() => onPickCategory(index)}
              className={`flex h-[21px] gap-1 px-2 py-0.5 text-12 opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 ${
                isActive
                  ? "items-center bg-grey-400 text-white"
                  : "items-end bg-grey-50 text-grey-300"
              }`}
            >
              {isActive ? (
                <span aria-hidden="true" className="size-2.5 shrink-0 bg-white" />
              ) : null}
              <span
                data-mobile-word=""
                className="inline-block origin-center font-bodoni leading-[15px] opacity-0"
              >
                {String(index + 1).padStart(3, "0")}
              </span>
              <span className="whitespace-nowrap font-serif-sc leading-[17px]">
                <Words text={label} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Safari 会把 filter 裁在元素框内，模糊放在带外扩的透明壳上 */}
      <span
        data-mobile-block=""
        aria-hidden="true"
        className="absolute opacity-0"
        style={{
          left: `calc(${SHADOW.left} - ${shadowPad}px)`,
          top: SHADOW.top - shadowPad,
          width: `calc(${SHADOW.width} + ${shadowPad * 2}px)`,
          height: SHADOW.height + shadowPad * 2,
          filter: `blur(${SHADOW.blur}px)`,
        }}
      >
        <span
          className="absolute bg-grey-400 opacity-10"
          style={{
            left: shadowPad,
            top: shadowPad,
            right: shadowPad,
            height: SHADOW.height,
          }}
        />
      </span>

      <div className="absolute left-1/2 top-[575px] flex w-[312px] -translate-x-1/2 flex-col gap-3">
        <p className="font-bodoni text-18 font-medium leading-6 text-grey-400">
          <Words text={work.title} swap />
        </p>
        <p className="font-serif-sc text-12 leading-6 text-grey-300">
          <Words text={work.description} swap />
        </p>
      </div>

      <button
        type="button"
        data-mobile-block=""
        onClick={() => onViewDetails(active)}
        className="pointer-events-auto absolute left-1/2 top-[766px] flex h-9 -translate-x-1/2 items-center gap-0.5 bg-grey-400 py-1.5 pl-7 pr-5 text-white opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
      >
        <span className="whitespace-nowrap font-serif-sc text-16 leading-[23px]">
          <Words text={viewDetailsLabel} />
        </span>
        <ArrowIcon />
      </button>
    </div>
  );
});
