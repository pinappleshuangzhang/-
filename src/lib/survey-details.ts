export type SurveyCategory = {
  code: "A" | "B" | "C" | "D" | "E";
  letter: string;
  label: string;
};

export type SurveyWork = {
  id: string;
  title: string;
  typeLabel: string;
  archivedLabel: string;
  activeCategory: SurveyCategory["code"];
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

export const SURVEY_CATEGORIES: SurveyCategory[] = [
  { code: "A", letter: "( A )", label: "Brand Desgin" },
  { code: "B", letter: "( B )", label: "Product Design" },
  { code: "C", letter: "( C )", label: "Website Interface" },
  { code: "D", letter: "( D )", label: "Visual Design" },
  { code: "E", letter: "( E )", label: "Motion Graphics" },
];

/** 档案 GA_004 作品详情：对照 Figma「05视觉档案调查-调查详情-1」 */
export const SURVEY_G_001: SurveyWork = {
  id: "g-001",
  title: "Survey Details_G_001",
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
