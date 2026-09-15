import type { MessageKey } from "@/lib/i18n/messages";

type SurveyWorkTagsProps = {
  tags: string[];
  label: string;
  revealDelay?: string;
};

/**
 * 抽屉作品类型标签，对照 Figma 1266:1694。
 * 白底 21px 高、12px 衬线，只展示不切换。
 */
export function SurveyWorkTags({
  tags,
  label,
  revealDelay = "0.25",
}: SurveyWorkTagsProps) {
  if (tags.length === 0) return null;
  return (
    <div
      data-survey-keep=""
      data-sd-media
      data-sd-delay={revealDelay}
      className="overflow-hidden"
    >
      <ul
        data-sd-media-inner
        aria-label={label}
        className="flex translate-y-[105%] flex-wrap gap-3"
      >
        {tags.map((text) => (
          <li
            key={text}
            className="flex h-[21px] items-end bg-white px-2 py-0.5 font-serif-sc text-12 font-normal leading-[17px] text-grey-400 md:h-[calc(var(--su)*21)] md:text-[length:calc(var(--su)*12)] md:leading-[calc(var(--su)*17)]"
          >
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function resolveWorkTags(
  keys: readonly MessageKey[],
  t: (key: MessageKey) => string,
): string[] {
  return keys.map((key) => t(key));
}
