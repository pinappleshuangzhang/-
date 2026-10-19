"use client";

import type gsap from "gsap";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import {
  playViscoseMobileReveal,
  playViscoseMobileSwap,
  setViscoseMobileHidden,
  setViscoseMobileShown,
} from "@/animations/viscose-mobile-reveal";
import {
  MobileCategoryChips,
  MobileWords,
} from "@/components/ui/viscose-mobile-parts";
import {
  ViscoseMobileWorkGrid,
  type ViscoseMobileCard,
} from "@/components/ui/viscose-mobile-work-grid";

export type ViscoseMobileStageHandle = {
  reveal: () => void;
  hide: () => void;
};

type ViscoseMobileStageProps = {
  /** chip 下标：0 = 全部项目，1–4 = 网站 / 品牌 / 创意 / 动态 */
  tab: number;
  cards: ViscoseMobileCard[];
  heading: string;
  categoryLabels: string[];
  onPickTab: (index: number) => void;
  onOpenWork: (categoryIndex: number) => void;
};

/** 第五屏移动端：作品一律两列小卡，一件时也只占半行。 */
export const ViscoseMobileStage = forwardRef<
  ViscoseMobileStageHandle,
  ViscoseMobileStageProps
>(function ViscoseMobileStage(
  {
    tab,
    cards = [],
    heading,
    categoryLabels,
    onPickTab,
    onOpenWork,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  // 大数字跟随类型编号：000 全部项目、001 网站设计……
  const number = `(${String(tab).padStart(3, "0")})`;

  useImperativeHandle(
    ref,
    () => ({
      reveal() {
        const root = rootRef.current;
        if (!root) return;
        revealedRef.current = true;
        timelineRef.current?.kill();
        timelineRef.current = playViscoseMobileReveal(root, null);
      },
      hide() {
        const root = rootRef.current;
        if (!root) return;
        revealedRef.current = false;
        timelineRef.current?.kill();
        timelineRef.current = null;
        setViscoseMobileHidden(root, null);
      },
    }),
    [],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !revealedRef.current) return;
    return playViscoseMobileSwap(root, null);
  }, [tab]);

  const localeCopy = `${heading}\0${categoryLabels.join("\0")}`;
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !revealedRef.current) return;
    setViscoseMobileShown(root, null);
  }, [localeCopy]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto absolute inset-0 z-10 flex flex-col md:hidden"
    >
      <div
        data-lenis-prevent=""
        className="min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-scroll overscroll-y-contain px-3 pb-9 pt-[109px]"
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
          className="mt-9 block h-px origin-left scale-x-0 bg-grey-100"
        />

        <MobileCategoryChips
          label={heading}
          categoryLabels={categoryLabels}
          active={tab}
          className="mt-9"
          onPick={onPickTab}
        />

        <ViscoseMobileWorkGrid cards={cards} onOpen={onOpenWork} />
      </div>
    </div>
  );
});
