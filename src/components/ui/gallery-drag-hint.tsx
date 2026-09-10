"use client";

import { forwardRef } from "react";

const BLOB_COUNT = 7;

type GalleryDragHintProps = {
  label: string;
  fontClassName: string;
};

/**
 * 第三阶段拖拽示意：黑方块沿弧线下行，拖尾走 goo 融合；文字单独叠一层保持水平。
 */
export const GalleryDragHint = forwardRef<HTMLDivElement, GalleryDragHintProps>(
  function GalleryDragHint({ label, fontClassName }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        data-drag-hint-root=""
        className="pointer-events-none absolute inset-0 z-50 max-md:hidden"
        style={{ opacity: 0 }}
      >
        <svg
          className="absolute h-0 w-0"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter
              id="ga004-drag-hint-goo"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="7"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
        <div
          className="absolute inset-0"
          style={{ filter: "url(#ga004-drag-hint-goo)" }}
        >
          {Array.from({ length: BLOB_COUNT }, (_, index) => (
            <span
              key={index}
              data-drag-hint-blob=""
              className="absolute left-0 top-0 size-10 rounded-full bg-grey-400"
            />
          ))}
        </div>
        <div
          data-drag-hint-square=""
          className="absolute left-0 top-0 size-12 rounded-none bg-grey-400"
        />
        <p
          data-drag-hint-label=""
          className={`absolute left-0 top-0 flex size-12 items-center justify-center text-12 leading-none text-white ${fontClassName}`}
        >
          {label}
        </p>
      </div>
    );
  },
);
