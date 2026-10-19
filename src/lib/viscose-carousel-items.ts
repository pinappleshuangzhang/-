export type ViscoseCarouselItem = {
  id: string;
  src: string;
  alt: string;
  title: string;
  discipline: string;
  year: string;
};

/**
 * 入场种子与第三阶段初始正面：001 The Apple Moment。
 * 与 carousel `imageOffset` / `INITIAL_CELL` 保持同一格。
 */
export const VISCOSE_SEED_INDEX = 0;

/** 第五屏作品环：四张作品图，环上按序重复。 */
export const VISCOSE_CAROUSEL_ITEMS: ViscoseCarouselItem[] = [
  {
    id: "survey-a",
    src: "/archive-ga-004/work-01-hover-v5.webp",
    alt: "苹果时刻活动视觉，黑白古典图像与绿色苹果",
    title: "The Apple Moment",
    discipline: "Brand Design",
    year: "2026",
  },
  {
    id: "survey-b",
    src: "/archive-ga-004/work-02-hover-v5.webp",
    alt: "未来创意 2026，蓝粉背景中的三维创意角色",
    title: "Future Creative 2026",
    discipline: "Product Design",
    year: "2026",
  },
  {
    id: "survey-c",
    src: "/archive-ga-004/work-03-hover-v5.webp",
    alt: "Easycash 数字品牌视觉重塑，深色品牌空间中的金属标识与绿色立体装置",
    title: "Easycash Digital Visual Reframing",
    discipline: "Web Interface",
    year: "2026",
  },
  {
    id: "survey-d",
    src: "/archive-ga-004/ops-cover.webp",
    alt: "Design AI Ops 实战笔记封面，黑底圆环中的白色标志与绿苹果",
    title: "Design AI Ops Field Notes",
    discipline: "Field Notes",
    year: "2026",
  },
];
