"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import cardBlImg from "../../public/studio-intro/card-bl.svg";
import cardBrImg from "../../public/studio-intro/card-br.svg";
import cardTlImg from "../../public/studio-intro/card-tl.svg";
import markG20Img from "../../public/studio-intro/mark-g-20.svg";
import plateMarkImg from "../../public/studio-intro/plate-mark.svg";
import platePhotoImg from "../../public/studio-intro/plate-photo.webp";

/** 斜切卡片遮罩（右上卡 = 铭牌照片按卡形裁切） */
const CARD_MASK_STYLE = {
  WebkitMaskImage: "url(/studio-intro/card-mask.svg)",
  maskImage: "url(/studio-intro/card-mask.svg)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

const CAPTION_CLASS =
  "font-bodoni text-[length:calc(var(--su)*8)] leading-[calc(var(--su)*14)] tracking-[0.08em] text-grey-300";

/** 两行正文通用：overflow-hidden 行容器 + .sd-line 初始隐藏 */
function RevealLine({ text }: { text: string }) {
  return (
    <span aria-hidden="true" className="block overflow-hidden">
      <span className="sd-line block opacity-0">{text}</span>
    </span>
  );
}

/**
 * 《工作室简介》图二（设计稿 1486:63）：2×2 斜切玻璃卡片。
 * 画布按 1440×800 稿面以 --su 换算、居中锚定；data-studio-card 数值
 * 即信封式入场次序（自下而上：左下 → 右下 → 左上 → 右上）。
 * data-sd-global-ignore：文字入场由 studio-intro 在 step2 手动驱动。
 */
export const StudioIntroCards = forwardRef<HTMLDivElement>(
  function StudioIntroCards(_props, ref) {
    const { t } = useLocale();
    return (
      // 对稿背景色 #E0E2E6（设计稿画板底色，非令牌刻度）
      <div
        ref={ref}
        data-sd-global-ignore
        className="invisible absolute inset-0 bg-[#E0E2E6] opacity-0"
      >
        <div className="absolute left-1/2 top-1/2 ml-[calc(var(--su)*-720)] mt-[calc(var(--su)*-400)] h-[calc(var(--su)*800)] w-[calc(var(--su)*1440)]">
          {/* 左上卡：想做的事 */}
          <div
            data-studio-card="2"
            className="absolute left-[calc(var(--su)*109)] top-[calc(var(--su)*129)] h-[calc(var(--su)*279)] w-[calc(var(--su)*753.3)] opacity-0"
          >
            <Image src={cardTlImg} alt="" fill unoptimized sizes="53vw" />
            <p
              className={`absolute left-[calc(var(--su)*20)] top-[calc(var(--su)*20)] ${CAPTION_CLASS}`}
            >
              39.9042° N 116.4074° E
            </p>
            <div
              data-sd-lines
              aria-label={`${t("studioIntro.card1Title")} ${t("studioIntro.card1Body")}`}
              className="absolute left-[calc(var(--su)*180)] top-[calc(var(--su)*117)] font-serif-sc text-[length:calc(var(--su)*14)] leading-[calc(var(--su)*24)] text-grey-400"
            >
              <RevealLine text={t("studioIntro.card1Title")} />
              <RevealLine text={t("studioIntro.card1Body")} />
            </div>
          </div>
          {/* 右上卡：铭牌照片按卡形遮罩裁切 */}
          <div
            data-studio-card="3"
            className="absolute left-[calc(var(--su)*726.5)] top-[calc(var(--su)*129)] h-[calc(var(--su)*279)] w-[calc(var(--su)*604.5)] overflow-hidden opacity-0"
            style={CARD_MASK_STYLE}
          >
            <div className="absolute left-[calc(var(--su)*-8.5)] top-[calc(var(--su)*-235)] h-[calc(var(--su)*821)] w-[calc(var(--su)*614)]">
              <Image
                src={platePhotoImg}
                alt={t("studioIntro.plateAlt")}
                fill
                sizes="(min-width: 768px) 43vw, 100vw"
                className="object-cover"
              />
            </div>
            <Image
              src={plateMarkImg}
              alt=""
              unoptimized
              className="absolute left-[calc(var(--su)*303.5)] top-[calc(var(--su)*140)] h-[calc(var(--su)*14)] w-[calc(var(--su)*13)]"
            />
            <p
              className={`absolute left-[calc(var(--su)*13.5)] top-[calc(var(--su)*20)] ${CAPTION_CLASS}`}
            >
              Real · Tangible
            </p>
          </div>
          {/* 左下卡：GRAVA 竖排 + G 标（卡形垂直翻转） */}
          <div
            data-studio-card="0"
            className="absolute left-[calc(var(--su)*109)] top-[calc(var(--su)*417)] h-[calc(var(--su)*279)] w-[calc(var(--su)*600.5)] opacity-0"
          >
            <Image
              src={cardBlImg}
              alt=""
              fill
              unoptimized
              sizes="42vw"
              className="-scale-y-100"
            />
            <p
              className="absolute left-[calc(var(--su)*17)] top-[calc(var(--su)*119)] font-bodoni text-[length:calc(var(--su)*12)] tracking-[0.3em] text-grey-400"
              style={{ writingMode: "vertical-rl" }}
            >
              GRAVA
            </p>
            <Image
              src={markG20Img}
              alt=""
              unoptimized
              className="absolute left-[calc(var(--su)*251)] top-[calc(var(--su)*130)] h-[calc(var(--su)*20)] w-[calc(var(--su)*20)]"
            />
            <p
              className={`absolute left-[calc(var(--su)*507)] top-[calc(var(--su)*245)] ${CAPTION_CLASS}`}
            >
              Strategy · Systems · Visuals · Experience
            </p>
          </div>
          {/* 右下卡：工作方式（卡形旋转 180°） */}
          <div
            data-studio-card="1"
            className="absolute left-[calc(var(--su)*569)] top-[calc(var(--su)*417)] h-[calc(var(--su)*279)] w-[calc(var(--su)*753.3)] opacity-0"
          >
            <Image
              src={cardBrImg}
              alt=""
              fill
              unoptimized
              sizes="53vw"
              className="rotate-180"
            />
            <div
              data-sd-lines
              aria-label={`${t("studioIntro.card2Title")} ${t("studioIntro.card2Body1")} ${t("studioIntro.card2Body2")}`}
              className="absolute left-[calc(var(--su)*260)] top-[calc(var(--su)*95)] font-serif-sc text-[length:calc(var(--su)*14)] leading-[calc(var(--su)*24)] text-grey-400"
            >
              <RevealLine text={t("studioIntro.card2Title")} />
              <RevealLine text={t("studioIntro.card2Body1")} />
              <RevealLine text={t("studioIntro.card2Body2")} />
            </div>
            <p
              className={`absolute left-[calc(var(--su)*634)] top-[calc(var(--su)*245)] ${CAPTION_CLASS}`}
            >
              Complete · Sustainable
            </p>
          </div>
        </div>
      </div>
    );
  },
);
