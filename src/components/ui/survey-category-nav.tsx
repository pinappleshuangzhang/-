"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDissolveHoverFill } from "@/hooks/use-dissolve-hover-fill";
import {
  SURVEY_CATEGORIES,
  type SurveyCategory,
  type SurveyCategoryCode,
} from "@/lib/survey-details";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2";
const hoverColor =
  "transition-colors duration-[600ms] group-hover:text-white motion-reduce:transition-none";

type SurveyCategoryNavProps = {
  activeCode: SurveyCategoryCode;
  onSelect: (code: SurveyCategoryCode) => void;
  "aria-label": string;
};

/**
 * 作品详情左侧调查类型导航。
 * 未选中项 hover 使用站内斑块溶解黑底；点击切换对应作品（无内容则留空）。
 */
export function SurveyCategoryNav({
  activeCode,
  onSelect,
  "aria-label": ariaLabel,
}: SurveyCategoryNavProps) {
  const [hoverEpoch, setHoverEpoch] = useState(0);

  return (
    <nav aria-label={ariaLabel}>
      <ul className="inline-flex w-max flex-col gap-6">
        {SURVEY_CATEGORIES.map((item) => (
          <li key={item.code} className="w-full">
            <CategoryItem
              item={item}
              active={item.code === activeCode}
              hoverEpoch={hoverEpoch}
              onSelect={() => {
                setHoverEpoch((epoch) => epoch + 1);
                onSelect(item.code);
              }}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CategoryItem({
  item,
  active,
  hoverEpoch,
  onSelect,
}: {
  item: SurveyCategory;
  active: boolean;
  hoverEpoch: number;
  onSelect: () => void;
}) {
  const {
    fillRef,
    reset,
    onMouseEnter: onDissolveEnter,
    onMouseLeave: onDissolveLeave,
  } = useDissolveHoverFill();

  useEffect(() => {
    reset();
  }, [hoverEpoch, active, reset]);

  return (
    <button
      type="button"
      aria-current={active ? "true" : undefined}
      onClick={onSelect}
      onMouseEnter={() => {
        if (!active) onDissolveEnter();
      }}
      onMouseLeave={() => {
        if (!active) onDissolveLeave();
      }}
      className={`group relative flex w-full items-center justify-between gap-7 overflow-hidden rounded-rs-4 py-1 text-left font-bodoni text-20 capitalize leading-normal ${focusRing} ${
        active ? "bg-grey-400 text-white" : "text-grey-300"
      }`}
    >
      <div
        ref={fillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-grey-400 opacity-0"
      />
      <span className="relative z-10 flex min-w-0 items-center gap-7">
        <span className={`whitespace-nowrap ${active ? "" : hoverColor}`}>
          {item.letter}
        </span>
        <span
          className={`whitespace-nowrap ${active ? "font-medium" : hoverColor}`}
        >
          {item.label}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 flex size-7 shrink-0 items-center justify-center transition-opacity duration-[600ms] motion-reduce:transition-none ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Image
          src="/archive-index/arrow.png"
          alt=""
          width={48}
          height={48}
          className="size-full object-contain"
        />
      </span>
    </button>
  );
}
