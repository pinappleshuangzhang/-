// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..18 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
const PROJECT_SEQUENCE = [
  {
    file: "archive-ga-004/work-01-hover-v5.webp",
    name: "苹果时刻：AI 创造力实验计划",
    listLabel: "Brand Design",
    type: "苹果时刻：AI 创造力实验计划",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-02-hover-v5.webp",
    name: "未来创意 2026",
    listLabel: "Product Design",
    type: "未来创意 2026",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-03-hover-v5.webp",
    name: "Easycash 数字品牌视觉重塑",
    listLabel: "Easycash Digital Visual Reframing",
    type: "Easycash 数字品牌视觉重塑",
    year: "2026",
  },
];

// Twelve planes repeat the archive images around the ring.
export const PROJECTS = Array.from({ length: 12 }, (_, index) => {
  return PROJECT_SEQUENCE[index % PROJECT_SEQUENCE.length];
});

export const IMAGE_FILES = PROJECT_SEQUENCE.map((project) => project.file);
