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

/** 斜切照片遮罩（已按稿水平镜像：斜边朝左上） */
const CARD_MASK_STYLE = {
  WebkitMaskImage: "url(/studio-intro/card-mask.svg)",
  maskImage: "url(/studio-intro/card-mask.svg)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

const CAPTION_CLASS =
  "absolute font-bodoni text-[length:calc(var(--su)*8)] leading-[calc(var(--su)*14)] tracking-[0.08em] text-grey-300";

/** 逐行入场通用：overflow-hidden 行容器 + .sd-line 初始隐藏 */
function RevealLine({ text }: { text: string }) {
  return (
    <span aria-hidden="true" className="block overflow-hidden">
      <span className="sd-line block opacity-0">{text}</span>
    </span>
  );
}

/**
 * 《工作室简介》图二（设计稿 1486:63）：一张 1440×800 大卡版面，
 * 内含四块斜切玻璃形 + 铭牌照片裁片 + 文案。整张大卡
 * （data-studio-card-group）作为一个整体做信封式 3D 翻入/退场。
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
        <div
          data-studio-card-group
          className="absolute left-1/2 top-1/2 ml-[calc(var(--su)*-720)] mt-[calc(var(--su)*-400)] h-[calc(var(--su)*800)] w-[calc(var(--su)*1440)]"
        >
          {/* 左上玻璃形 + 想做的事 */}
          <div className="absolute left-[calc(var(--su)*109)] top-[calc(var(--su)*129)] h-[calc(var(--su)*279)] w-[calc(var(--su)*753.3)]">
            <Image src={cardTlImg} alt="" fill unoptimized sizes="53vw" />
            <div
              data-sd-lines
              aria-label={`${t("studioIntro.card1Title")} ${t("studioIntro.card1Body")}`}
              className="absolute left-[calc(var(--su)*180)] top-[calc(var(--su)*117)] font-serif-sc text-[length:calc(var(--su)*14)] leading-[calc(var(--su)*24)] text-grey-400"
            >
              <RevealLine text={t("studioIntro.card1Title")} />
              <RevealLine text={t("studioIntro.card1Body")} />
            </div>
          </div>
          {/* 右上铭牌照片：按稿斜切裁片（斜边朝左上） */}
          <div
            className="absolute left-[calc(var(--su)*726.5)] top-[calc(var(--su)*129)] h-[calc(var(--su)*279)] w-[calc(var(--su)*604.5)] overflow-hidden"
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
          </div>
          {/* 左下玻璃形（垂直翻转）+ GRAVA 竖排与 G 标 */}
          <div className="absolute left-[calc(var(--su)*109)] top-[calc(var(--su)*417)] h-[calc(var(--su)*279)] w-[calc(var(--su)*600.5)]">
            <Image
              src={cardBlImg}
              alt=""
              fill
              unoptimized
              sizes="42vw"
              className="-scale-y-100"
            />
            {/* vertical-rl + rotate180 = 西文侧躺、自下而上读（对稿 -90°） */}
            <p
              className="absolute left-[calc(var(--su)*17)] top-[calc(var(--su)*119)] rotate-180 font-bodoni text-[length:calc(var(--su)*12)] tracking-[0.3em] text-grey-400"
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
          </div>
          {/* 右下玻璃形（旋转 180°）+ 工作方式 */}
          <div className="absolute left-[calc(var(--su)*569)] top-[calc(var(--su)*417)] h-[calc(var(--su)*279)] w-[calc(var(--su)*753.3)]">
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
          </div>
          {/* Bodoni 小注：按稿置于画布层（白卡区，非照片内） */}
          <p
            className={`${CAPTION_CLASS} left-[calc(var(--su)*129)] top-[calc(var(--su)*149)]`}
          >
            39.9042° N 116.4074° E
          </p>
          <p
            className={`${CAPTION_CLASS} left-[calc(var(--su)*740)] top-[calc(var(--su)*149)]`}
          >
            Real · Tangible
          </p>
          <p
            className={`${CAPTION_CLASS} left-[calc(var(--su)*616)] top-[calc(var(--su)*662)]`}
          >
            Strategy · Systems · Visuals · Experience
          </p>
          <p
            className={`${CAPTION_CLASS} left-[calc(var(--su)*1203)] top-[calc(var(--su)*662)]`}
          >
            Complete · Sustainable
          </p>
        </div>
      </div>
    );
  },
);
