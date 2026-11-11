"use client";

import { useLayoutEffect, useRef } from "react";
import {
  observeDeferredDrawerMedia,
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import { KeepHoverMedia } from "@/components/ui/keep-hover-media";
import { SurveyOpsArticle } from "@/components/ui/survey-ops-article";
import {
  ANNIVERSARY_ARTICLE_EN,
  ANNIVERSARY_ARTICLE_ZH,
} from "@/lib/anniversary-article";
import { REGION_ARTICLE_EN, REGION_ARTICLE_ZH } from "@/lib/region-article";
import { OPS_ARTICLE_EN, OPS_ARTICLE_ZH, type OpsBlock } from "@/lib/ops-article";
import { SplitWords } from "@/components/ui/split-words";
import {
  resolveWorkTags,
  SurveyWorkTags,
} from "@/components/ui/survey-work-tags";
import { useLocale } from "@/components/providers/locale-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  SURVEY_CATEGORY_BY_CODE,
  SURVEY_G_001,
  SURVEY_WORKS,
  type SurveyMediaItem,
  type SurveyWork,
} from "@/lib/survey-details";

const ARTICLE_BLOCKS: Record<string, { zh: OpsBlock[]; en: OpsBlock[] }> = {
  "g-004": { zh: OPS_ARTICLE_ZH, en: OPS_ARTICLE_EN },
  "g-005": { zh: ANNIVERSARY_ARTICLE_ZH, en: ANNIVERSARY_ARTICLE_EN },
  "g-006": { zh: REGION_ARTICLE_ZH, en: REGION_ARTICLE_EN },
};

type SurveyDrawerContentProps = {
  open: boolean;
  workIndex: number;
  titleId: string;
};

/**
 * 抽屉内容对照 Figma 957:4375：标题栏、图 1（无 hover）、说明、图 2–5（hover 视频）。
 */
export function SurveyDrawerContent({
  open,
  workIndex,
  titleId,
}: SurveyDrawerContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { locale, t } = useLocale();
  const activeWork = SURVEY_WORKS[workIndex] ?? SURVEY_WORKS[0];
  const activeCategory = activeWork
    ? SURVEY_CATEGORY_BY_CODE[activeWork.activeCategory]
    : SURVEY_CATEGORY_BY_CODE.A;
  const detailNumber = String(workIndex + 1).padStart(3, "0");
  const heading = `Investigation Details_${detailNumber}`;
  // 手机版标题跟随语言（Figma 1008-561 为「调查详情_003」），桌面版固定英文
  const mobileHeading = `${t("survey.detailTitle")}_${detailNumber}`;
  const article = activeWork ? ARTICLE_BLOCKS[activeWork.id] : undefined;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !open) return;
    if (reducedMotion) {
      setSondavenVisible(root);
      return;
    }
    setSondavenHidden(root);
    const scroller = root.closest<HTMLElement>("[data-survey-scroller]");
    const deferred: HTMLElement[] = [];
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const safari =
      /safari/i.test(navigator.userAgent) &&
      !/chrome|chromium|crios|edg|android/i.test(navigator.userAgent);
    // Safari 里文字 scale、图片裁切上滑会和抽屉位移叠在一起，打开时卡住。
    const lightReveal = narrow || safari;
    const tl = playSondavenReveal(root, {
      force3D: lightReveal ? false : undefined,
      snapMedia: lightReveal,
      plainText: lightReveal,
      deferMedia: (frame) => {
        if (!scroller || !frame.querySelector("img")) return false;
        const below =
          frame.getBoundingClientRect().top >=
          scroller.getBoundingClientRect().bottom - 8;
        if (below) deferred.push(frame);
        return below;
      },
    });
    const stopDeferred = observeDeferredDrawerMedia(deferred, scroller);
    return () => {
      tl.kill();
      stopDeferred();
    };
  }, [open, workIndex, reducedMotion, locale]);

  return (
    <div
      ref={rootRef}
      className="relative px-5 pb-20 pt-[105px] max-md:px-3 max-md:pb-12 max-md:pt-[68px]"
    >
      {/* 内容铺满抽屉内边距；抽屉右缘在目录和联系我们中间 */}
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-10 max-md:gap-9">
          <header className="flex items-center justify-between">
            <h1
              id={titleId}
              aria-label={heading}
              data-survey-keep=""
              className="cursor-auto whitespace-nowrap font-bodoni text-40 font-normal uppercase leading-[55px] text-grey-400 max-md:text-24 max-md:normal-case max-md:leading-[34px] md:text-[length:calc(var(--su)*40)] md:leading-[calc(var(--su)*55)]"
            >
              <span data-sd-words data-sd-delay="0.15" className="max-md:hidden">
                <SplitWords text={heading} />
              </span>
              <span
                data-sd-words
                data-sd-delay="0.15"
                className={`md:hidden ${locale === "zh" ? "font-serif-sc" : "text-20"}`}
              >
                <SplitWords text={mobileHeading} />
              </span>
            </h1>
            <div className="flex flex-col items-end justify-center gap-2 max-md:gap-1">
              <div className="flex w-[180px] items-center justify-end gap-1 max-md:w-[104px] md:w-[calc(var(--su)*180)]">
                <div
                  className="h-px min-w-px flex-1 bg-grey-400 max-md:bg-grey-300"
                  aria-hidden="true"
                />
                <p
                  data-sd-words
                  data-sd-delay="0.2"
                  data-survey-keep=""
                  aria-label={activeCategory.typeLabel}
                  className="cursor-auto whitespace-nowrap font-bodoni text-20 capitalize leading-normal text-grey-400 max-md:text-12 max-md:leading-[15px] md:text-[length:calc(var(--su)*20)]"
                >
                  <SplitWords text={activeCategory.typeLabel} />
                </p>
              </div>
              <p
                data-sd-words
                data-sd-delay="0.22"
                data-survey-keep=""
                aria-label={activeWork?.archivedLabel ?? SURVEY_G_001.archivedLabel}
                className="cursor-auto whitespace-nowrap font-bodoni text-20 uppercase leading-normal text-grey-400 max-md:text-12 max-md:leading-[15px] md:text-[length:calc(var(--su)*20)]"
              >
                <SplitWords
                  text={activeWork?.archivedLabel ?? SURVEY_G_001.archivedLabel}
                />
              </p>
            </div>
          </header>
          <div className="h-px w-full bg-grey-100" aria-hidden="true" />
        </div>

        {activeWork ? (
          <div className="flex flex-col gap-5">
            <SurveyWorkTags
              tags={resolveWorkTags(activeWork.tagKeys, t)}
              label={t("survey.tagList")}
            />
            {article ? (
              <SurveyOpsArticle
                blocksZh={article.zh}
                blocksEn={article.en}
                matchImageGap={activeWork.id === "g-004"}
              />
            ) : (
              <WorkContent work={activeWork} />
            )}
          </div>
        ) : (
          <div className="min-h-[503px]" aria-live="polite">
            <p className="sr-only">{t("survey.emptyWork")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkContent({ work }: { work: SurveyWork }) {
  const { t } = useLocale();
  const [first, ...rest] = work.media;
  const laterDelays = ["0.5", "0.55", "0.6", "0.65", "0.7"];

  if ((work.id === "g-001" || work.id === "g-002" || work.id === "g-003") && first) {
    return (
      <div className="flex flex-col">
        <WorkMedia item={first} revealDelay="0.28" eager />
        <WorkCaption
          title={t(work.titleKey)}
          description={t(work.descriptionKey)}
          revealDelay="0.28"
          className="mt-8 max-md:mt-5"
        />
        {rest.map((item, index) => {
          const delay = laterDelays[index] ?? "0.7";
          const caption =
            item.showCaption === false
              ? null
              : {
                  title: item.titleKey ? t(item.titleKey) : t(work.titleKey),
                  description: item.captionKey ? t(item.captionKey) : "",
                };
          return (
            <div
              key={item.hover === "video" ? item.videoSrc : item.src}
              className={
                caption
                  ? "mt-14 flex flex-col max-md:mt-10"
                  : "mt-3 flex flex-col"
              }
            >
              {caption ? (
                <WorkCaption
                  title={caption.title}
                  description={caption.description}
                  revealDelay={delay}
                />
              ) : null}
              <WorkMedia
                item={item}
                revealDelay={delay}
                preloadVideo={index === 0}
                className={caption ? "mt-4 max-md:mt-3" : undefined}
              />
            </div>
          );
        })}
      </div>
    );
  }

  const groups: SurveyMediaItem[][] = [];
  for (const item of rest) {
    const current = groups[groups.length - 1];
    if (item.showCaption === false && current) current.push(item);
    else groups.push([item]);
  }

  return (
    <div className="flex flex-col gap-14 max-md:gap-10">
      {first ? (
        <div className="flex flex-col gap-5 md:gap-8">
          <WorkMedia item={first} revealDelay="0.28" eager />
          <WorkCaption
            title={t(work.titleKey)}
            description={t(work.descriptionKey)}
            revealDelay="0.28"
          />
        </div>
      ) : null}
      {groups.map((group) => {
        const lead = group[0];
        if (!lead) return null;
        const leadIndex = rest.indexOf(lead);
        return (
          <div key={lead.src} className="flex flex-col gap-5 md:gap-8">
            <div className="flex flex-col gap-3">
              {group.map((item, imageIndex) => {
                const index = leadIndex + imageIndex;
                return (
                  <WorkMedia
                    key={item.src}
                    item={item}
                    revealDelay={laterDelays[index] ?? "0.7"}
                    preloadVideo={index === 0 && item.hover === "video"}
                  />
                );
              })}
            </div>
            {lead.showCaption !== false ? (
              <WorkCaption
                title={lead.titleKey ? t(lead.titleKey) : t(work.titleKey)}
                description={lead.captionKey ? t(lead.captionKey) : ""}
                revealDelay={laterDelays[leadIndex] ?? "0.7"}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const articleTitleClass =
  "font-serif-sc text-24 font-medium leading-[32px] text-grey-400 max-md:text-18 max-md:leading-normal md:text-[length:calc(var(--su)*24)] md:leading-[calc(var(--su)*32)]";
const articleBodyClass =
  "font-serif-sc text-14 font-normal leading-5 text-grey-300 max-md:text-12 md:text-[length:calc(var(--su)*14)] md:leading-[calc(var(--su)*20)]";

function WorkCaption({
  title,
  description,
  revealDelay,
  className,
}: {
  title: string;
  description: string;
  revealDelay: string;
  className?: string;
}) {
  return (
    <div
      data-survey-keep=""
      data-sd-media
      data-sd-delay={revealDelay}
      className={`cursor-auto overflow-hidden ${className ?? ""}`}
    >
      <div
        data-sd-media-inner
        className="flex translate-y-[105%] flex-col gap-3 md:gap-4"
      >
        <p className={articleTitleClass}>{title}</p>
        {description ? <p className={articleBodyClass}>{description}</p> : null}
      </div>
    </div>
  );
}

const drawerMediaSizes = "(max-width: 767px) 94vw, 896px";

function WorkMedia({
  item,
  revealDelay,
  preloadVideo = false,
  eager = false,
  className,
}: {
  item: SurveyMediaItem;
  revealDelay: string;
  preloadVideo?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const src = locale === "en" && item.srcEn ? item.srcEn : item.src;
  const alt = t(item.altKey);
  if (item.hover === "video") {
    return (
      <KeepHoverMedia
        hover="video"
        src={src}
        alt={alt}
        width={item.width}
        height={item.height}
        sizes={drawerMediaSizes}
        revealDelay={revealDelay}
        innerClassName={item.innerClassName}
        className={className}
        videoSrc={item.videoSrc}
        playWhenVisible={item.playWhenVisible}
        previewLabel={`${alt}。${t("survey.heroPreview")}`}
        expandLabel={t("survey.videoExpand")}
        closeLabel={t("nav.close")}
        preload={preloadVideo ? "auto" : "none"}
      />
    );
  }
  return (
    <KeepHoverMedia
      hover="none"
      src={src}
      alt={alt}
      width={item.width}
      height={item.height}
      sizes={drawerMediaSizes}
      revealDelay={revealDelay}
      eager={eager || item.eager}
      innerClassName={item.innerClassName}
      className={className}
    />
  );
}
