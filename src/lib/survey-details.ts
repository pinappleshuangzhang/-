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
  projectTitle: string;
  description: string;
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
  SURVEY_CATEGORY_BY_CODE.D,
  SURVEY_CATEGORY_BY_CODE.E,
];

/** 档案 GA_004 作品详情：对照 Figma「05视觉档案调查-调查详情-1」 */
export const SURVEY_G_001: SurveyWork = {
  id: "g-001",
  title: "Survey Details_003",
  typeLabel: "( C Website)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "C",
  duration: "一个月",
  projectTitle: "AI Ops - The Apple Moment",
  description:
    "Design AI Ops 是设计团队围绕 AI 能力建设与设计生产升级建立的长期知识体系，用于统一沉淀团队在 AI 方向上的规划、项目实践与能力资产。该体系以设计业务场景为核心，通过持续积累工具、方法与案例，使 AI 从零散工具使用逐步演进为稳定、可复用的设计生产能力。",
  media: [
    {
      src: "/archive-ga-004/survey-1.webp",
      altKey: "survey.heroAlt",
      width: 1792,
      height: 1006,
      hover: "none",
      innerClassName: "bg-white",
    },
    {
      src: "/archive-ga-004/survey-2.webp",
      altKey: "survey.media2Alt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-2-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-3.webp",
      altKey: "survey.media3Alt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-3-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-4.webp",
      altKey: "survey.media4Alt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-4-hover.mp4",
    },
    {
      src: "/archive-ga-004/survey-5.webp",
      altKey: "survey.media5Alt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-5-hover.mp4",
    },
  ],
};

/** 各调查类型对应作品；尚无内容的类型为 null，详情页右侧留空 */
export const SURVEY_WORK_BY_CATEGORY: Record<
  SurveyCategoryCode,
  SurveyWork | null
> = {
  A: null,
  B: null,
  C: SURVEY_G_001,
  D: null,
  E: null,
};

const SURVEY_CATEGORY_CODES: SurveyCategoryCode[] = ["A", "B", "C", "D", "E"];

/** 第五屏卡片序号映射到调查类型；环上多圈时按 5 取模 */
export function surveyCodeFromCarouselIndex(index: number): SurveyCategoryCode {
  const count = SURVEY_CATEGORY_CODES.length;
  const normalized = ((index % count) + count) % count;
  return SURVEY_CATEGORY_CODES[normalized] ?? "C";
}
