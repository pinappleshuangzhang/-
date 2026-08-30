export type ViscoseCarouselItem = {
  id: string;
  src: string;
  alt: string;
  title: string;
  discipline: string;
  year: string;
};

/** 新第五屏作品环：只使用本站已有作品素材，不引用开源仓库示例图片。 */
export const VISCOSE_CAROUSEL_ITEMS: ViscoseCarouselItem[] = [
  {
    id: "survey-a",
    src: "/archive-ga-004/work-01-hover.png",
    alt: "品牌设计作品",
    title: "Brand Archive",
    discipline: "Brand Design",
    year: "2026",
  },
  {
    id: "survey-b",
    src: "/archive-ga-004/work-02-hover.png",
    alt: "产品设计作品",
    title: "Product Study",
    discipline: "Product Design",
    year: "2026",
  },
  {
    id: "survey-c",
    src: "/archive-ga-004/work-03-hover.png",
    alt: "网站界面设计作品",
    title: "Apple Moment",
    discipline: "Web Interface",
    year: "2026",
  },
  {
    id: "survey-d",
    src: "/archive-ga-004/work-04-hover.png",
    alt: "视觉设计作品",
    title: "Visual Field",
    discipline: "Visual Design",
    year: "2026",
  },
  {
    id: "survey-e",
    src: "/archive-ga-004/work-05-hover.png",
    alt: "动态视觉作品",
    title: "Motion Trace",
    discipline: "Motion Graphics",
    year: "2026",
  },
];
