"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { SurveyArticleMedia } from "@/components/ui/survey-article-media";
import {
  blockKey,
  blockSpacing,
  delayForImage,
  imageCountBefore,
  pointImageOffsets,
} from "@/components/ui/survey-ops-article-layout";
import {
  OPS_ARTICLE_EN,
  OPS_ARTICLE_ZH,
  type OpsBlock,
} from "@/lib/ops-article";

type SurveyOpsArticleProps = {
  blocksZh?: OpsBlock[];
  blocksEn?: OpsBlock[];
  /** 图夹在上下文字之间时，图下间距与图上一致 */
  matchImageGap?: boolean;
};

const titleClass =
  "font-serif-sc text-24 font-medium leading-[32px] text-grey-400 max-md:text-18 max-md:leading-normal md:text-[length:calc(var(--su)*24)] md:leading-[calc(var(--su)*32)]";
const bodyClass =
  "font-serif-sc text-14 font-normal leading-5 text-grey-300 max-md:text-12 md:text-[length:calc(var(--su)*14)] md:leading-[calc(var(--su)*20)]";
const questionClass =
  "font-serif-sc text-14 font-normal leading-8 text-grey-300 max-md:text-12 max-md:leading-5 md:text-[length:calc(var(--su)*14)] md:leading-[calc(var(--su)*32)]";
const pointTitleClass =
  "font-serif-sc text-16 font-medium leading-6 text-grey-400 max-md:text-14 max-md:leading-normal md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*24)]";
const pointTitleClassEn = `${pointTitleClass} max-md:font-bodoni`;

export function SurveyOpsArticle({
  blocksZh = OPS_ARTICLE_ZH,
  blocksEn = OPS_ARTICLE_EN,
  matchImageGap = false,
}: SurveyOpsArticleProps) {
  const { locale } = useLocale();
  const blocks = locale === "en" ? blocksEn : blocksZh;

  return (
    <div className="flex w-full flex-col">
      {blocks.map((block, index) => (
        <ArticleBlock
          key={blockKey(block, index)}
          block={block}
          locale={locale}
          className={blockSpacing(block, index, blocks, matchImageGap)}
          imageIndex={imageCountBefore(blocks, index)}
        />
      ))}
    </div>
  );
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
      <div data-survey-keep="" className={`flex cursor-auto flex-col gap-2 md:gap-3 ${className}`}>
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
      <div
        data-survey-keep=""
        className={`flex cursor-auto flex-col gap-9 ${className}`}
      >
        {block.items.map((item, itemIndex) => (
          <div
            key={`${itemIndex}-${item.title}`}
            className="flex flex-col gap-4 max-md:gap-3"
          >
            <div className="flex flex-col gap-2">
              <p className={locale === "zh" ? pointTitleClass : pointTitleClassEn}>
                {item.title}
              </p>
              <div className="flex flex-col gap-1 md:gap-3">
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph} className={bodyClass}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
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
      <div data-survey-keep="" className={`flex cursor-auto flex-col ${className}`}>
        <div className="flex flex-col gap-9">
          {block.items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <p className={locale === "zh" ? pointTitleClass : pointTitleClassEn}>
                {item.title}
              </p>
              <p className={bodyClass}>{item.body}</p>
            </div>
          ))}
        </div>
        {block.kind === "shifts" ? (
          <div className="mt-3 flex flex-col gap-2 md:gap-3">
            {block.outro.map((paragraph) => (
              <p key={paragraph} className={bodyClass}>
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      data-survey-keep=""
      className={`flex cursor-auto flex-col gap-3 md:gap-4 ${className}`}
    >
      {block.title ? <h2 className={titleClass}>{block.title}</h2> : null}
      {block.paragraphs.length > 0 || block.bullets || block.tail?.length ? (
      <div className="flex flex-col gap-2 md:gap-3">
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph} className={bodyClass}>
            {paragraph}
          </p>
        ))}
        {block.bullets ? (
          <ul className="flex flex-col gap-2 md:gap-3">
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
