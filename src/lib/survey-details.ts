export type SurveyCategoryCode = "A" | "B" | "C" | "D" | "E";

export type SurveyCategory = {
  code: SurveyCategoryCode;
  /** 详情标题与类型列表编号，如 003 */
  number: string;
  letter: string;
  label: string;
  typeLabel: string;
};

export type SurveyWork = {
  id: string;
  title: string;
  typeLabel: string;
  archivedLabel: string;
  activeCategory: SurveyCategoryCode;
  duration: string;
  projectTitle: string;
  description: string;
  hero: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  hoverVideoSrc: string;
  billboard: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export const SURVEY_CATEGORY_BY_CODE: Record<
  SurveyCategoryCode,
  SurveyCategory
> = {
  A: {
    code: "A",
    number: "001",
    letter: "( A )",
    label: "Brand Desgin",
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
  projectTitle: "AI Ops - The apple Moment",
  description:
    "Design AI Ops 是设计团队围绕 AI 能力建设与设计生产升级建立的长期知识体系，用于统一沉淀团队在 AI 方向上的规划、项目实践与能力资产。该体系以设计业务场景为核心，通过持续积累工具、方法与案例，使 AI 从零散工具使用逐步演进为稳定、可复用的设计生产能力。",
  hero: {
    src: "/archive-ga-004/survey-hero.webp",
    alt: "Design AI Ops 网站首屏：Brand Creativity、Website Design、Material Collection，中央为 Design AI Ops The Apple Moment，底部为作品缩略图",
    width: 1792,
    height: 1006,
  },
  hoverVideoSrc: "/archive-ga-004/survey-hero-hover.mp4",
  billboard: {
    src: "/archive-ga-004/survey-billboard.webp",
    alt: "展厅中的黑色大理石数字屏幕，展示 AI Ops 创世纪主题视觉",
    width: 896,
    height: 503,
  },
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
