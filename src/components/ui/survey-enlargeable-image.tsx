"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { SurveyImageLightbox } from "@/components/ui/survey-image-lightbox";

type SurveyEnlargeableImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  /** 入场时图片被裁在框外，懒加载不会开始 */
  eager?: boolean;
  /** 点按改为播放视频，不再放大静图 */
  activateLabel?: string;
  onActivate?: () => void;
};

/** 抽屉内图片：点击后按第三屏卡片的信封翻入放大。 */
export function SurveyEnlargeableImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  eager = false,
  activateLabel,
  onActivate,
}: SurveyEnlargeableImageProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const imageLabel = `${alt} ${t("survey.imageExpand")}`;
  const playsVideo = Boolean(onActivate && activateLabel);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-survey-keep=""
        aria-label={playsVideo ? activateLabel : imageLabel}
        onClick={() => {
          if (playsVideo && onActivate) {
            onActivate();
            return;
          }
          setOpen(true);
        }}
        className="block w-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-grey-400"
        style={{ cursor: "default" }}
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className={className}
        />
      </button>
      {open ? (
        <SurveyImageLightbox
          src={src}
          alt={alt}
          width={width}
          height={height}
          closeLabel={t("nav.close")}
          onClose={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
        />
      ) : null}
    </>
  );
}
