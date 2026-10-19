"use client";

import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import {
  OPS_ARTICLE_EN,
  OPS_ARTICLE_ZH,
  type OpsBlock,
} from "@/lib/ops-article";

const kickerClass =
  "font-bodoni text-12 font-normal leading-normal text-grey-300 md:text-[length:calc(var(--su)*12)]";
const titleClass =
  "font-serif-sc text-28 font-medium leading-[36px] text-grey-400 max-md:font-bodoni max-md:text-18 max-md:leading-6 md:text-[length:calc(var(--su)*28)] md:leading-[calc(var(--su)*36)]";
const subtitleClass =
  "font-bodoni text-12 font-normal italic leading-normal text-grey-300 md:text-[length:calc(var(--su)*12)]";
const bodyClass =
  "font-serif-sc text-14 font-normal leading-5 text-grey-300 max-md:text-12 max-md:leading-6 md:text-[length:calc(var(--su)*14)] md:leading-[calc(var(--su)*20)]";
const questionClass =
  "font-serif-sc text-14 font-normal leading-8 text-grey-300 max-md:text-12 max-md:leading-6 md:text-[length:calc(var(--su)*14)] md:leading-[calc(var(--su)*32)]";
const pointTitleClass =
  "font-serif-sc text-16 font-medium leading-6 text-grey-400 max-md:font-bodoni max-md:text-18 max-md:leading-6 md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*24)]";

/**
 * 004 Design AI Ops 实战笔记正文，对照 Figma 1549:885。
 * 手机端标题与编号小标题 18 / Medium Bodoni，正文 12 / Regular，与前面作品说明一致。
 * 普通块间距 56（手机 40）。大标题与上方正文 76，与下方正文 32。小标题与正文 12。
 */
export function SurveyOpsArticle() {
  const { locale } = useLocale();
  const blocks = locale === "en" ? OPS_ARTICLE_EN : OPS_ARTICLE_ZH;

  return (
    <div data-survey-keep="" className="flex w-full flex-col">
      {blocks.map((block, index) => (
        <ArticleBlock
          key={blockKey(block, index)}
          block={block}
          locale={locale}
          className={blockSpacing(block, index)}
        />
      ))}
    </div>
  );
}

function blockSpacing(block: OpsBlock, index: number) {
  if (index === 0) return "";
  if (block.kind === "prose" && (block.kicker || block.title)) return "mt-19";
  return "mt-14 max-md:mt-10";
}

function blockKey(block: OpsBlock, index: number) {
  if (block.kind === "image") return block.src;
  if (block.kind === "prose") return block.kicker ?? block.paragraphs[0] ?? String(index);
  if (block.kind === "questions") return block.items[0] ?? String(index);
  return block.items[0]?.title ?? String(index);
}

function ArticleBlock({
  block,
  locale,
  className,
}: {
  block: OpsBlock;
  locale: "zh" | "en";
  className: string;
}) {
  if (block.kind === "image") {
    const src = locale === "en" ? block.srcEn : block.src;
    return (
      <Image
        src={src}
        alt={block.alt}
        width={1920}
        height={1080}
        sizes="(max-width: 767px) 94vw, 896px"
        className={`h-auto w-full ${className}`}
      />
    );
  }

  if (block.kind === "questions") {
    return (
      <div className={`flex flex-col gap-5 ${className}`}>
        <p className={bodyClass}>{block.intro}</p>
        <div className="flex flex-col">
          {block.items.map((item) => (
            <p key={item} className={questionClass}>
              {item}
            </p>
          ))}
        </div>
        <p className={bodyClass}>{block.outro}</p>
      </div>
    );
  }

  if (block.kind === "shifts") {
    return (
      <div className={`flex flex-col gap-5 ${className}`}>
        {block.items.map((item) => (
          <div key={item.title} className="flex flex-col gap-3">
            <p className={pointTitleClass}>{item.title}</p>
            <p className={bodyClass}>{item.body}</p>
          </div>
        ))}
        {block.outro.map((paragraph) => (
          <p key={paragraph} className={bodyClass}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  const showSubtitle = block.subtitle && block.subtitle !== block.title;
  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {block.kicker || block.title ? (
        <div className="flex flex-col gap-3">
          {block.kicker ? <p className={kickerClass}>{block.kicker}</p> : null}
          {block.title ? (
            <div className="flex flex-col gap-2">
              <h2 className={titleClass}>{block.title}</h2>
              {showSubtitle ? <p className={subtitleClass}>{block.subtitle}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-5">
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph} className={bodyClass}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
