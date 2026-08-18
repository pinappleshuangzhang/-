"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  EXPLORE_GROUPS,
  EXPLORE_TICK_SRC,
  type ExploreGraphicMark,
  type ExploreLabelMark,
  type ExploreMark,
  type ExploreTickMark,
} from "@/lib/archive-ga-005-marks";
import cardsImg from "../../public/archive-ga-005/cards.webp";

gsap.registerPlugin(useGSAP);

function su(value: number) {
  return `calc(var(--su) * ${value})`;
}

/**
 * 第六屏：档案 GA_005《视觉探索记录》
 * 三张空白实验卡铺满视口，周边刻度与元数据按设计稿锁定在卡片边缘。
 */
export function ArchiveGa005() {
  const container = useRef<HTMLElement>(null);
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { t } = useLocale();

  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      const groups = gsap.utils.toArray<HTMLElement>("[data-exp-group]", root);
      if (!groups.length) return;

      if (reducedMotion) {
        gsap.set(groups, { opacity: 1 });
        return;
      }
      if (!isActive) {
        gsap.set(groups, { opacity: 0 });
        return;
      }

      gsap.to(groups, {
        opacity: 1,
        delay: 0.4,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
      });
    },
    { dependencies: [isActive, reducedMotion], scope: container },
  );

  return (
    <ScreenShell ref={container} aria-label={t("ga005.aria")}>
      <div className="absolute left-1/2 top-1/2 aspect-[1440/800] w-[max(100%,calc(100vh*1440/800))] -translate-x-1/2 -translate-y-1/2 [--su:calc(100%/1440)]">
        <Image
          src={cardsImg}
          alt={t("ga005.imageAlt")}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0">
          {EXPLORE_GROUPS.map((group) => (
            <div
              key={group.id}
              data-exp-group
              role="group"
              aria-label={group.ariaLabel}
              className="absolute inset-0 opacity-0"
            >
              {group.marks.map((mark, index) => (
                <ExploreMarkItem key={`${group.id}-${index}`} mark={mark} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}

function ExploreMarkItem({ mark }: { mark: ExploreMark }) {
  if (mark.kind === "label") return <MarkLabel mark={mark} />;
  if (mark.kind === "graphic") return <MarkGraphic mark={mark} />;
  return <MarkTicks mark={mark} />;
}

function MarkLabel({ mark }: { mark: ExploreLabelMark }) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: su(mark.left),
        top: su(mark.top),
        width: su(mark.width),
        height: su(mark.height),
      }}
    >
      <p
        className="whitespace-nowrap font-bodoni text-[length:calc(var(--su)*10)] uppercase leading-normal text-grey-300"
        style={
          mark.rotate !== undefined
            ? { transform: `rotate(${mark.rotate}deg)` }
            : undefined
        }
      >
        {mark.text}
      </p>
    </div>
  );
}

function MarkGraphic({ mark }: { mark: ExploreGraphicMark }) {
  return (
    <div
      aria-hidden="true"
      className="absolute flex items-center justify-center"
      style={{
        left: su(mark.left),
        top: su(mark.top),
        width: su(mark.width),
        height: su(mark.height),
      }}
    >
      <div
        className="relative"
        style={{
          width: su(mark.innerWidth),
          height: su(mark.innerHeight),
          transform:
            mark.rotate !== undefined
              ? `rotate(${mark.rotate}deg)`
              : undefined,
        }}
      >
        <Image src={mark.src} alt="" fill sizes="40px" className="object-contain" />
      </div>
    </div>
  );
}

function MarkTicks({ mark }: { mark: ExploreTickMark }) {
  const ticks = (
    <div className="flex items-center gap-[calc(var(--su)*8)]">
      {Array.from({ length: mark.count }, (_, index) => (
        <span
          key={index}
          className="relative h-[calc(var(--su)*5.5)] w-[calc(var(--su)*8.5)]"
        >
          <Image
            src={EXPLORE_TICK_SRC}
            alt=""
            fill
            sizes="12px"
            className="object-contain"
          />
        </span>
      ))}
    </div>
  );

  if (mark.rotate === undefined) {
    return (
      <div
        aria-hidden="true"
        className="absolute"
        style={{ left: su(mark.left), top: su(mark.top) }}
      >
        {ticks}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="absolute flex items-center justify-center"
      style={{
        left: su(mark.left),
        top: su(mark.top),
        width: su(mark.boxWidth ?? 0),
        height: su(mark.boxHeight ?? 0),
      }}
    >
      <div style={{ transform: `rotate(${mark.rotate}deg)` }}>{ticks}</div>
    </div>
  );
}
