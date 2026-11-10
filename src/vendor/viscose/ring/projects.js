// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..18 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
const PROJECT_SEQUENCE = [
  {
    file: "archive-ga-004/work-01-ring.webp",
    name: "苹果时刻：AI 创意设计实践",
    listLabel: "The Apple Moment: AI Creative Design Practice",
    type: "苹果时刻：AI 创意设计实践",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-02-hover-v5.webp",
    name: "未来创意 2030",
    listLabel: "Product Design",
    type: "未来创意 2030",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-03-ring.webp",
    name: "Easycash 数字品牌视觉重塑",
    listLabel: "Easycash Digital Visual Reframing",
    type: "Easycash 数字品牌视觉重塑",
    year: "2026",
  },
  {
    file: "archive-ga-004/ops-ring.webp",
    name: "Design AI Ops 实战笔记",
    listLabel: "Design AI Ops Field Notes",
    type: "Design AI Ops 实战笔记",
    year: "2026",
  },
  {
    file: "archive-ga-004/anniversary-ring.webp",
    name: "Easycash 9周年视觉系统",
    listLabel: "Easycash 9th Anniversary Visual System",
    type: "Easycash 9周年视觉系统",
    year: "2026",
  },
  {
    file: "archive-ga-004/region-ring.webp",
    name: "跨地区金融网站重构：通用架构设计实践",
    listLabel: "Cross-Market Rebuild: Shared Architecture Practice",
    type: "跨地区金融网站重构：通用架构设计实践",
    year: "2026",
  },
];

// Twelve planes repeat the archive images around the ring.
export const PROJECTS = Array.from({ length: 12 }, (_, index) => {
  return PROJECT_SEQUENCE[index % PROJECT_SEQUENCE.length];
});

export const IMAGE_FILES = PROJECT_SEQUENCE.map((project) => project.file);
