export type SurveyCategoryCode = "A" | "B" | "C" | "D" | "E";

export type SurveyCategory = {
  code: SurveyCategoryCode;
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
  A: { code: "A", letter: "( A )", label: "Brand Desgin", typeLabel: "( A Brand)" },
  B: { code: "B", letter: "( B )", label: "Product Design", typeLabel: "( B Product)" },
  C: { code: "C", letter: "( C )", label: "Website Interface", typeLabel: "( C Website)" },
  D: { code: "D", letter: "( D )", label: "Visual Design", typeLabel: "( D Visual)" },
  E: { code: "E", letter: "( E )", label: "Motion Graphics", typeLabel: "( E Motion)" },
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
  title: "Survey Details_G_C",
  typeLabel: "( C Website)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "C",
  duration: "一个月",
  projectTitle: "AI Ops - The apple Moment",
  description:
    "Design AI Ops 是设计团队围绕 AI 能力建设与设计生产升级建立的长期知识体系，用于统一沉淀团队在 AI 方向上的规划、项目实践与能力资产。该体系以设计业务场景为核心，通过持续积累工具、方法与案例，使 AI 从零散工具使用逐步演进为稳定、可复用的设计生产能力。",
  hero: {
    src: "/archive-ga-004/survey-hero.webp",
    alt: "Design AI Ops 网站首屏，标题 The Apple Moment，下方为作品缩略图",
    width: 757,
    height: 425,
  },
  billboard: {
    src: "/archive-ga-004/survey-billboard.webp",
    alt: "展厅中的大理石数字屏幕，展示 AI Ops 创世纪主题视觉",
    width: 757,
    height: 425,
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
