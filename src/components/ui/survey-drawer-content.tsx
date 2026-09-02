"use client";

import { useLayoutEffect, useRef } from "react";
import {
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import { KeepHoverMedia } from "@/components/ui/keep-hover-media";
import { SplitWords } from "@/components/ui/split-words";
import { useLocale } from "@/components/providers/locale-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  SURVEY_CATEGORY_BY_CODE,
  SURVEY_G_001,
  SURVEY_WORK_BY_CATEGORY,
  type SurveyCategoryCode,
  type SurveyMediaItem,
  type SurveyWork,
} from "@/lib/survey-details";

type SurveyDrawerContentProps = {
  open: boolean;
  initialCode: SurveyCategoryCode;
  titleId: string;
};

/**
 * 抽屉内容对照 Figma 957:4375：标题栏、图 1（无 hover）、说明、图 2–5（hover 视频）。
 */
export function SurveyDrawerContent({
  open,
  initialCode,
  titleId,
}: SurveyDrawerContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { t } = useLocale();
  const activeCategory = SURVEY_CATEGORY_BY_CODE[initialCode];
  const activeWork = SURVEY_WORK_BY_CATEGORY[initialCode];
  const heading = `Survey Details_${activeCategory.number}`;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !open) return;
    if (reducedMotion) {
      setSondavenVisible(root);
      return;
    }
    setSondavenHidden(root);
    const tl = playSondavenReveal(root);
    return () => {
      tl.kill();
    };
  }, [open, initialCode, reducedMotion]);

  return (
    <div ref={rootRef} className="relative px-5 pb-20 pt-[105px]">
      <div className="flex w-full max-w-[896px] flex-col gap-10">
        <div className="flex flex-col gap-10">
          <header className="flex items-center justify-between">
            <h1
              id={titleId}
              aria-label={heading}
              className="whitespace-nowrap font-bodoni text-44 font-normal uppercase leading-[55px] text-grey-400"
            >
              <span data-sd-words data-sd-delay="0.15">
                <SplitWords text={heading} />
              </span>
            </h1>
            <div className="flex flex-col items-end justify-center gap-2">
              <div className="flex w-[180px] items-center justify-end gap-1">
                <div
                  className="h-px min-w-px flex-1 bg-grey-400"
                  aria-hidden="true"
                />
                <p
                  data-sd-words
                  data-sd-delay="0.2"
                  aria-label={activeCategory.typeLabel}
                  className="whitespace-nowrap font-bodoni text-20 capitalize leading-normal text-grey-400"
                >
                  <SplitWords text={activeCategory.typeLabel} />
                </p>
              </div>
              <p
                data-sd-words
                data-sd-delay="0.22"
                aria-label={SURVEY_G_001.archivedLabel}
                className="whitespace-nowrap font-bodoni text-20 uppercase leading-normal text-grey-400"
              >
                <SplitWords text={SURVEY_G_001.archivedLabel} />
              </p>
            </div>
          </header>
          <div className="h-px w-full bg-grey-100" aria-hidden="true" />
        </div>

        {activeWork ? (
          <WorkContent work={activeWork} />
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
  const description =
    work.description === SURVEY_G_001.description
      ? t("survey.description")
      : work.description;
  const [first, ...rest] = work.media;
  const laterDelays = ["0.5", "0.55", "0.6", "0.65"];

  return (
    <div className="flex flex-col gap-20">
      {first ? (
        <div className="flex flex-col gap-6">
          <WorkMedia item={first} revealDelay="0.28" />
          <div
            data-survey-keep=""
            data-sd-media
            data-sd-delay="0.28"
            className="overflow-hidden"
          >
            <div
              data-sd-media-inner
              className="flex translate-y-[105%] flex-col gap-3"
            >
              <p className="whitespace-nowrap font-serif-sc text-20 font-medium capitalize leading-normal text-grey-400">
                {work.projectTitle}
              </p>
              <p className="font-serif-sc text-14 font-normal leading-5 text-grey-300">
                {description}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {rest.map((item, index) => (
        <WorkMedia
          key={item.src}
          item={item}
          revealDelay={laterDelays[index] ?? "0.65"}
        />
      ))}
    </div>
  );
}

function WorkMedia({
  item,
  revealDelay,
}: {
  item: SurveyMediaItem;
  revealDelay: string;
}) {
  const { t } = useLocale();
  const alt = t(item.altKey);
  if (item.hover === "video") {
    return (
      <KeepHoverMedia
        hover="video"
        src={item.src}
        alt={alt}
        width={item.width}
        height={item.height}
        revealDelay={revealDelay}
        innerClassName={item.innerClassName}
        videoSrc={item.videoSrc}
        previewLabel={`${alt}。${t("survey.heroPreview")}`}
      />
    );
  }
  return (
    <KeepHoverMedia
      hover="none"
      src={item.src}
      alt={alt}
      width={item.width}
      height={item.height}
      revealDelay={revealDelay}
      innerClassName={item.innerClassName}
    />
  );
}
