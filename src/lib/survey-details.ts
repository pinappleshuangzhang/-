import type { MessageKey } from "@/lib/i18n/messages";

export type SurveyCategoryCode = "A" | "B" | "C" | "D" | "E";

export type SurveyCategory = {
  code: SurveyCategoryCode;
  /** 详情标题与类型列表编号，如 003 */
  number: string;
  letter: string;
  label: string;
  typeLabel: string;
};

export type SurveyMediaItem = {
  src: string;
  altKey: MessageKey;
  width: number;
  height: number;
  innerClassName?: string;
  titleKey?: MessageKey;
  captionKey?: MessageKey;
  showCaption?: boolean;
} & (
  | { hover: "none" }
  | { hover: "video"; videoSrc: string }
);

export type SurveyWork = {
  id: string;
  title: string;
  typeLabel: string;
  archivedLabel: string;
  activeCategory: SurveyCategoryCode;
  duration: string;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  /** 作品类型标签（Figma 973:554 / 1266:1694） */
  tagKeys: MessageKey[];
  media: SurveyMediaItem[];
};

export const SURVEY_CATEGORY_BY_CODE: Record<
  SurveyCategoryCode,
  SurveyCategory
> = {
  A: {
    code: "A",
    number: "001",
    letter: "( A )",
    label: "Brand Design",
    typeLabel: "( A Brand)",
  },
  B: {
    code: "B",
    number: "002",
    letter: "( B )",
    label: "Product Design",
    typeLabel: "( B Product)",
  },
  C: {
    code: "C",
    number: "003",
    letter: "( C )",
    label: "Website Interface",
    typeLabel: "( C Website)",
  },
  D: {
    code: "D",
    number: "004",
    letter: "( D )",
    label: "Visual Design",
    typeLabel: "( D Visual)",
  },
  E: {
    code: "E",
    number: "005",
    letter: "( E )",
    label: "Motion Graphics",
    typeLabel: "( E Motion)",
  },
};

export const SURVEY_CATEGORIES: SurveyCategory[] = [
  SURVEY_CATEGORY_BY_CODE.A,
  SURVEY_CATEGORY_BY_CODE.B,
  SURVEY_CATEGORY_BY_CODE.C,
];

/** 001 品牌设计：The Apple Moment，对照作品提交模版 / 交付文件夹 */
export const SURVEY_G_001: SurveyWork = {
  id: "g-001",
  title: "Survey Details_001",
  typeLabel: "( A Brand)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "A",
  duration: "一个月",
  titleKey: "survey.title",
  descriptionKey: "survey.description",
  tagKeys: [
    "survey.tag.event",
    "survey.tag.brand",
    "survey.tag.website",
    "survey.tag.motion",
  ],
  media: [
    {
      src: "/archive-ga-004/survey-1.webp",
      altKey: "survey.heroAlt",
      width: 1920,
      height: 1080,
      hover: "none",
      innerClassName: "bg-white",
    },
    {
      src: "/archive-ga-004/survey-2.webp",
      altKey: "survey.media2Alt",
      titleKey: "survey.media2Title",
      captionKey: "survey.media2Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-2-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-3.webp",
      altKey: "survey.media3Alt",
      titleKey: "survey.media3Title",
      captionKey: "survey.media3Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-3-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-4.webp",
      altKey: "survey.media4Alt",
      titleKey: "survey.media4Title",
      captionKey: "survey.media4Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-4-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-5.webp",
      altKey: "survey.media5Alt",
      titleKey: "survey.media5Title",
      captionKey: "survey.media5Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-5-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-6-v2.webp",
      altKey: "survey.media6Alt",
      titleKey: "survey.media6Title",
      captionKey: "survey.media6Caption",
      width: 1024,
      height: 576,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-6-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-7.webp",
      altKey: "survey.media7Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
    {
      src: "/archive-ga-004/survey-8-v2.webp",
      altKey: "survey.media8Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
    {
      src: "/archive-ga-004/survey-9-v2.webp",
      altKey: "survey.media9Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
  ],
};

/** 002 产品设计：Future Creative 2026 */
export const SURVEY_G_002: SurveyWork = {
  id: "g-002",
  title: "Survey Details_002",
  typeLabel: "( B Product)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "B",
  duration: "一个月",
  titleKey: "survey.future.title",
  descriptionKey: "survey.future.description",
  tagKeys: ["survey.tag.visual", "survey.tag.motion"],
  media: [
    {
      src: "/archive-ga-004/future-hero.webp",
      altKey: "survey.future.heroAlt",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-01.webp",
      altKey: "survey.future.media1Alt",
      titleKey: "survey.future.media1Title",
      captionKey: "survey.future.media1Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-02.webp",
      altKey: "survey.future.media2Alt",
      titleKey: "survey.future.media2Title",
      captionKey: "survey.future.media2Caption",
      width: 1024,
      height: 576,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-03.webp",
      altKey: "survey.future.media3Alt",
      titleKey: "survey.future.media3Title",
      captionKey: "survey.future.media3Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/future-gallery-03.mp4",
    },
    {
      src: "/archive-ga-004/future-gallery-04.webp",
      altKey: "survey.future.media4Alt",
      titleKey: "survey.future.media4Title",
      captionKey: "survey.future.media4Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-05.webp",
      altKey: "survey.future.media5Alt",
      titleKey: "survey.future.media5Title",
      captionKey: "survey.future.media5Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-06.webp",
      altKey: "survey.future.media6Alt",
      titleKey: "survey.future.media6Title",
      captionKey: "survey.future.media6Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
  ],
};

/** 003 网站设计：Easycash 数字品牌视觉重塑 */
export const SURVEY_G_003: SurveyWork = {
  id: "g-003",
  title: "Survey Details_003",
  typeLabel: "( C Website)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "C",
  duration: "一个月",
  titleKey: "survey.easycash.title",
  descriptionKey: "survey.easycash.description",
  tagKeys: ["survey.tag.website", "survey.tag.visual", "survey.tag.brand"],
  media: [
    {
      src: "/archive-ga-004/easycash-hero-v2.webp",
      altKey: "survey.easycash.heroAlt",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/easycash-gallery-01.webp",
      altKey: "survey.easycash.media1Alt",
      titleKey: "survey.easycash.media1Title",
      captionKey: "survey.easycash.media1Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/easycash-gallery-02.webp",
      altKey: "survey.easycash.media2Alt",
      titleKey: "survey.easycash.media2Title",
      captionKey: "survey.easycash.media2Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/easycash-gallery-02.mp4",
    },
    {
      src: "/archive-ga-004/easycash-gallery-03-v2.webp",
      altKey: "survey.easycash.media3Alt",
      titleKey: "survey.easycash.media3Title",
      captionKey: "survey.easycash.media3Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/easycash-gallery-03.mp4",
    },
    {
      src: "/archive-ga-004/easycash-gallery-04.webp",
      altKey: "survey.easycash.media4Alt",
      titleKey: "survey.easycash.media4Title",
      captionKey: "survey.easycash.media4Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/easycash-gallery-05-v2.webp",
      altKey: "survey.easycash.media5Alt",
      titleKey: "survey.easycash.media5Title",
      captionKey: "survey.easycash.media5Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/easycash-gallery-05.mp4",
    },
    {
      src: "/archive-ga-004/easycash-gallery-06.webp",
      altKey: "survey.easycash.media6Alt",
      titleKey: "survey.easycash.media6Title",
      captionKey: "survey.easycash.media6Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
  ],
};

/** 各调查类型对应作品；尚无内容的类型为 null，详情页右侧留空 */
export const SURVEY_WORK_BY_CATEGORY: Record<
  SurveyCategoryCode,
  SurveyWork | null
> = {
  A: SURVEY_G_001,
  B: SURVEY_G_002,
  C: SURVEY_G_003,
  D: null,
  E: null,
};

const SURVEY_CATEGORY_CODES: SurveyCategoryCode[] = ["A", "B", "C"];

/** 第五屏卡片序号映射到调查类型；环上多圈时按 3 取模 */
export function surveyCodeFromCarouselIndex(index: number): SurveyCategoryCode {
  const count = SURVEY_CATEGORY_CODES.length;
  const normalized = ((index % count) + count) % count;
  return SURVEY_CATEGORY_CODES[normalized] ?? "A";
}
