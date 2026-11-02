"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { SurveyArticleMedia } from "@/components/ui/survey-article-media";
import {
  OPS_ARTICLE_EN,
  OPS_ARTICLE_ZH,
  type OpsBlock,
} from "@/lib/ops-article";

type SurveyOpsArticleProps = {
  blocksZh?: OpsBlock[];
  blocksEn?: OpsBlock[];
};

const kickerClass =
  "font-bodoni text-12 font-normal leading-normal text-grey-300 md:text-[length:calc(var(--su)*12)]";
const kickerClassZh =
  "font-serif-sc text-12 font-normal leading-normal text-grey-300 md:text-[length:calc(var(--su)*12)]";
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
export function SurveyOpsArticle({
  blocksZh = OPS_ARTICLE_ZH,
  blocksEn = OPS_ARTICLE_EN,
}: SurveyOpsArticleProps) {
  const { locale } = useLocale();
  const blocks = locale === "en" ? blocksEn : blocksZh;

  return (
    <div data-survey-keep="" className="flex w-full flex-col">
      {blocks.map((block, index) => (
        <ArticleBlock
          key={blockKey(block, index)}
          block={block}
          locale={locale}
          className={blockSpacing(block, index)}
          imageIndex={imageCountBefore(blocks, index)}
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

function imageCountBefore(blocks: OpsBlock[], index: number) {
  let count = 0;
  for (let i = 0; i < index; i += 1) {
    const block = blocks[i];
    if (!block) continue;
    if (block.kind === "image") count += 1;
    if (block.kind === "points") {
      count += block.items.filter((item) => item.image).length;
    }
  }
  return count;
}

/** 与前三篇作品图同一套上滑：首图 0.28s，其后每张错开 0.05s。 */
function delayForImage(imageIndex: number) {
  if (imageIndex <= 0) return "0.28";
  return (0.5 + (imageIndex - 1) * 0.05).toFixed(2);
}

function blockKey(block: OpsBlock, index: number) {
  if (block.kind === "image") return `${index}-${block.src}`;
  if (block.kind === "prose") {
    return `${index}-${block.kicker ?? block.paragraphs[0] ?? "prose"}`;
  }
  if (block.kind === "questions") return `${index}-${block.items[0] ?? "questions"}`;
  return `${index}-${block.items[0]?.title ?? block.kind}`;
}

function pointImageOffsets(items: { image?: unknown }[]) {
  return items.reduce<number[]>((offsets, _item, index) => {
    if (index === 0) return [0];
    const previous = offsets[index - 1] ?? 0;
    const previousHasImage = items[index - 1]?.image != null;
    return [...offsets, previous + (previousHasImage ? 1 : 0)];
  }, []);
}

function ArticleBlock({
  block,
  locale,
  className,
  imageIndex,
}: {
  block: OpsBlock;
  locale: "zh" | "en";
  className: string;
  imageIndex: number;
}) {
  if (block.kind === "image") {
    const src = locale === "en" ? block.srcEn : block.src;
    return (
      <SurveyArticleMedia
        src={src}
        alt={block.alt}
        revealDelay={delayForImage(imageIndex)}
        className={className}
      />
    );
  }

  if (block.kind === "questions") {
    return (
      <div className={`flex cursor-auto flex-col gap-5 ${className}`}>
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

  if (block.kind === "points") {
    const offsets = pointImageOffsets(block.items);
    return (
      <div className={`flex cursor-auto flex-col gap-5 ${className}`}>
        {block.items.map((item, itemIndex) => (
          <div key={`${itemIndex}-${item.title}`} className="flex flex-col gap-3">
            <p className={pointTitleClass}>{item.title}</p>
            {item.paragraphs.map((paragraph) => (
              <p key={paragraph} className={bodyClass}>
                {paragraph}
              </p>
            ))}
            {item.image ? (
              <SurveyArticleMedia
                src={locale === "en" ? item.image.srcEn : item.image.src}
                alt={item.image.alt}
                revealDelay={delayForImage(imageIndex + (offsets[itemIndex] ?? 0))}
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (block.kind === "shifts" || block.kind === "steps") {
    return (
      <div className={`flex cursor-auto flex-col gap-5 ${className}`}>
        {block.items.map((item) => (
          <div key={item.title} className="flex flex-col gap-3">
            <p className={pointTitleClass}>{item.title}</p>
            <p className={bodyClass}>{item.body}</p>
          </div>
        ))}
        {block.kind === "shifts"
          ? block.outro.map((paragraph) => (
              <p key={paragraph} className={bodyClass}>
                {paragraph}
              </p>
            ))
          : null}
      </div>
    );
  }

  const showSubtitle = block.subtitle && block.subtitle !== block.title;
  const kickerHasHan = block.kicker ? /[\u3400-\u9fff]/.test(block.kicker) : false;
  return (
    <div className={`flex cursor-auto flex-col gap-8 ${className}`}>
      {block.kicker || block.title ? (
        <div className="flex flex-col gap-3">
          {block.kicker ? (
            <p className={kickerHasHan ? kickerClassZh : kickerClass}>{block.kicker}</p>
          ) : null}
          {block.title ? (
            <div className="flex flex-col gap-2">
              <h2 className={titleClass}>{block.title}</h2>
              {showSubtitle ? <p className={subtitleClass}>{block.subtitle}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {block.paragraphs.length > 0 || block.bullets || block.tail?.length ? (
      <div className="flex flex-col gap-5">
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph} className={bodyClass}>
            {paragraph}
          </p>
        ))}
        {block.bullets ? (
          <ul className="flex flex-col gap-5">
            {block.bullets.map((item) => (
              <li key={item} className={bodyClass}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {block.tail?.map((paragraph) => (
          <p key={paragraph} className={bodyClass}>
            {paragraph}
          </p>
        ))}
      </div>
      ) : null}
    </div>
  );
}
