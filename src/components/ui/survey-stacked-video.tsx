"use client";

import { useState } from "react";
import Image from "next/image";
import { SurveyVideoLightbox } from "@/components/ui/survey-video-lightbox";

type SurveyStackedVideoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  revealDelay: string;
  innerClassName?: string;
  videoSrc: string;
  expandLabel: string;
  closeLabel: string;
};

const frameClass = "relative aspect-[896/503] w-full overflow-hidden";

/**
 * 手机端抽屉：静图在上，下方为「点击查看视频」帧（Figma 1248:1185）。
 * 点按后以横屏放大播放，不走桌面 hover。
 */
export function SurveyStackedVideo({
  src,
  alt,
  width,
  height,
  sizes = "94vw",
  revealDelay,
  innerClassName,
  videoSrc,
  expandLabel,
  closeLabel,
}: SurveyStackedVideoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        data-survey-keep=""
        data-sd-media
        data-sd-delay={revealDelay}
        className={frameClass}
      >
        <div
          data-sd-media-inner
          className={`relative translate-y-[105%] ${innerClassName ?? ""}`}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className="h-auto w-full"
          />
        </div>
      </div>

      <button
        type="button"
        data-survey-keep=""
        data-sd-media
        data-sd-delay={revealDelay}
        aria-label={expandLabel}
        onClick={() => setOpen(true)}
        className={`${frameClass} cursor-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2`}
      >
        <span
          data-sd-media-inner
          className={`relative block translate-y-[105%] ${innerClassName ?? ""}`}
        >
          <Image
            src={src}
            alt=""
            width={width}
            height={height}
            sizes={sizes}
            className="h-auto w-full"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-grey-400/50"
          />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-white/30 px-3 py-1 font-serif-sc text-16 font-medium uppercase leading-normal text-white">
            {expandLabel}
          </span>
        </span>
      </button>

      {open ? (
        <SurveyVideoLightbox
          src={videoSrc}
          label={alt}
          closeLabel={closeLabel}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
