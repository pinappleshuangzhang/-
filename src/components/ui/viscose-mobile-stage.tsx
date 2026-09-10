"use client";

import type gsap from "gsap";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  playViscoseMobileReveal,
  playViscoseMobileSwap,
  setViscoseMobileHidden,
} from "@/animations/viscose-mobile-reveal";
import {
  MobileArrowIcon,
  MobileCategoryChips,
  MobileWords,
} from "@/components/ui/viscose-mobile-parts";

export type ViscoseMobileWork = { title: string; description: string };

export type ViscoseMobileStageHandle = {
  /** 进入本屏时调用：大图上滑、标题逐词、chip 底色左→右擦入、文案整段上浮 */
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
  /** 大图（可点击），渲染在版式流内的 1.6:1 槽位里 */
  media: ReactNode;
  /** 大图内层（外层需 overflow-hidden），随文案一起按第三屏方式上滑入场 */
  mediaRef?: RefObject<HTMLElement | null>;
  onPickCategory: (index: number) => void;
  onViewDetails: (index: number) => void;
};

/**
 * Figma 947-3937 投影：304.9 × 47，距左 42.1，顶边 511.8（390 画板）。
 * 换算到卡片（左 12.25、宽 365.5、底 533.4）坐标：左 8.17%、宽 83.4%、底边探出 25.4px。
 */
const SHADOW = {
  left: "8.17%",
  width: "83.4%",
  belowCard: 25.4,
  height: 47,
  blur: 14,
};

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
    media,
    mediaRef,
    onPickCategory,
    onViewDetails,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const work = works[active] ?? { title: "", description: "" };
  const number = `(${String(active + 1).padStart(2, "0")})`;

  useImperativeHandle(
    ref,
    () => ({
      reveal() {
        const root = rootRef.current;
        if (!root) return;
        revealedRef.current = true;
        timelineRef.current?.kill();
        timelineRef.current = playViscoseMobileReveal(root, mediaRef?.current);
      },
      hide() {
        const root = rootRef.current;
        if (!root) return;
        revealedRef.current = false;
        timelineRef.current?.kill();
        timelineRef.current = null;
        setViscoseMobileHidden(root, mediaRef?.current);
      },
    }),
    [mediaRef],
  );

  // 切换分类：编号逐词、文案整段重新上浮
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !revealedRef.current) return;
    return playViscoseMobileSwap(root);
  }, [active]);

  const shadowPad = SHADOW.blur * 3;

  return (
    // 纵向流式排布；各段间距按 844 高画板等比取 dvh 并设下限，短屏先压缩间距，
    // 按钮始终贴底，保证全部内容落在可视高度内
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col px-3 pb-[clamp(16px,4.976dvh,42px)] pt-[clamp(64px,12.915dvh,109px)] md:hidden"
    >
      <div className="flex h-[46px] shrink-0 items-center justify-between text-grey-400">
        <p className="font-serif-sc text-32 leading-[46px]">
          <MobileWords text={heading} />
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
        className="mt-[clamp(12px,4.265dvh,36px)] h-px shrink-0 origin-left scale-x-0 bg-grey-100"
      />

      <MobileCategoryChips
        label={heading}
        categoryLabels={categoryLabels}
        active={active}
        className="mt-[clamp(16px,4.147dvh,35px)] shrink-0"
        onPick={onPickCategory}
      />

      {/* 大图槽位：与画板同宽（365.5/390），投影挂在卡片底边 */}
      <div className="relative mt-[clamp(12px,3.318dvh,28px)] w-full shrink-0">
        {/* Safari 会把 filter 裁在元素框内，模糊放在带外扩的透明壳上 */}
        <span
          data-mobile-block=""
          aria-hidden="true"
          className="absolute opacity-0"
          style={{
            left: `calc(${SHADOW.left} - ${shadowPad}px)`,
            bottom: -(SHADOW.belowCard + shadowPad),
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
        <div className="relative aspect-[1.6/1] w-full">{media}</div>
      </div>

      {/* 标题与详情整段上浮（外层裁切，内层从下方滑入），切换分类时重播 */}
      <div className="mx-auto mt-[clamp(20px,4.976dvh,42px)] flex w-[312px] max-w-full flex-col gap-3">
        <div className="overflow-hidden">
          <p
            key={`title-${active}`}
            data-mobile-copy=""
            className="font-bodoni text-18 font-medium leading-6 text-grey-400 opacity-0"
          >
            {work.title}
          </p>
        </div>
        <div className="overflow-hidden">
          <p
            key={`desc-${active}`}
            data-mobile-copy=""
            className="font-serif-sc text-12 leading-6 text-grey-300 opacity-0"
          >
            {work.description}
          </p>
        </div>
      </div>

      {/* 按钮贴底：mt-auto 吃掉剩余高度，pt 保底与文案的最小距离 */}
      <div className="mt-auto flex shrink-0 justify-center pt-5">
        <button
          type="button"
          data-mobile-block=""
          onClick={() => onViewDetails(active)}
          className="pointer-events-auto flex h-9 items-center gap-0.5 bg-grey-400 py-1.5 pl-7 pr-5 text-white opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
        >
          <span className="whitespace-nowrap font-serif-sc text-16 leading-[23px]">
            <MobileWords text={viewDetailsLabel} />
          </span>
          <MobileArrowIcon />
        </button>
      </div>
    </div>
  );
});
