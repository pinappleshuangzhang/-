"use client";

import type gsap from "gsap";
import Image from "next/image";
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
  MobileArrowIcon,
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
  viewDetailsLabel: string;
  onPickTab: (index: number) => void;
  onOpenWork: (categoryIndex: number) => void;
};

const SHADOW = {
  left: "8.17%",
  width: "83.4%",
  belowCard: 25.4,
  height: 47,
  blur: 14,
};

/** 第五屏移动端：一件大图（1183:525）或多件网格（1269:1720）。 */
export const ViscoseMobileStage = forwardRef<
  ViscoseMobileStageHandle,
  ViscoseMobileStageProps
>(function ViscoseMobileStage(
  {
    tab,
    cards = [],
    heading,
    categoryLabels,
    viewDetailsLabel,
    onPickTab,
    onOpenWork,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const single = cards.length === 1 ? cards[0] : null;
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

  const localeCopy = `${heading}\0${viewDetailsLabel}\0${categoryLabels.join("\0")}`;
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !revealedRef.current) return;
    setViscoseMobileShown(root, null);
  }, [localeCopy]);

  const shadowPad = SHADOW.blur * 3;

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

        {single ? (
          <>
            <div className="relative mt-7 aspect-[1.6/1] w-full">
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
              <div className="relative size-full">
                <button
                  type="button"
                  onClick={() => onOpenWork(single.categoryIndex)}
                  className="absolute inset-0 overflow-hidden rounded-rs-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
                  aria-label={single.alt}
                >
                  <span
                    data-mobile-media=""
                    className="absolute inset-0 translate-y-[105%]"
                  >
                    <Image
                      src={single.src}
                      alt={single.alt}
                      fill
                      sizes="94vw"
                      priority={tab === 1}
                      className="object-cover"
                    />
                  </span>
                </button>
              </div>
            </div>

            <div className="mx-auto mt-[26px] w-[312px] max-w-full overflow-hidden">
              <div
                key={`copy-${single.categoryIndex}`}
                data-mobile-copy=""
                className="flex flex-col gap-3 opacity-0"
              >
                <p className="font-bodoni text-18 font-medium leading-6 text-grey-400">
                  {single.title}
                </p>
                <p className="font-serif-sc text-12 leading-6 text-grey-300">
                  {single.description}
                </p>
              </div>
            </div>
          </>
        ) : (
          <ViscoseMobileWorkGrid cards={cards} onOpen={onOpenWork} />
        )}
      </div>

      {single ? (
        <div className="shrink-0 bg-[var(--mobile-browser-bottom)] px-9 py-4">
          <button
            type="button"
            data-mobile-block=""
            onClick={() => onOpenWork(single.categoryIndex)}
            className="flex w-full items-center justify-center gap-0.5 bg-grey-400 px-7 py-2.5 text-white opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
          >
            <span className="whitespace-nowrap font-serif-sc text-16 leading-[23px]">
              <MobileWords text={viewDetailsLabel} />
            </span>
            <MobileArrowIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
});
