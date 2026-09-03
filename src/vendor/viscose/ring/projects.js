// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..18 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
//
// TODO: every `type` and `year` is placeholder. Names marked (*) are guesses
// at the subject — the artwork carries no wordmark to read them off.
const PROJECT_SEQUENCE = [
  {
    file: "archive-ga-004/work-01-hover.webp",
    name: "品牌档案",
    listLabel: "Brand Design",
    type: "品牌设计",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-02-hover.webp",
    name: "产品研究",
    listLabel: "Product Design",
    type: "产品设计",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-03-hover.webp",
    name: "界面时刻",
    listLabel: "Website Interface",
    type: "界面设计",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-04-hover.webp",
    name: "视觉场域",
    listLabel: "Visual Design",
    type: "视觉设计",
    year: "2026",
  },
  {
    file: "archive-ga-004/work-05-hover.webp",
    name: "动态轨迹",
    listLabel: "Motion Graphics",
    type: "动态视觉",
    year: "2026",
  },
];

// Twelve planes repeat the five archive images around the ring.
export const PROJECTS = Array.from({ length: 12 }, (_, index) => {
  return PROJECT_SEQUENCE[index % PROJECT_SEQUENCE.length];
});

export const IMAGE_FILES = PROJECT_SEQUENCE.map((project) => project.file);
