export type GalleryCard = {
  src: string;
  hoverSrc?: string;
  alt: string;
  width?: number;
  height?: number;
};

/** 第五屏视觉档案素材：以 Figma 的 5 张卡图为基底，循环铺成通栏长廊 */
const ARCHIVE_GA_004_CARD_SET: GalleryCard[] = [
  {
    src: "/archive-ga-004/work-01.png",
    hoverSrc: "/archive-ga-004/work-01-hover.png",
    alt: "视觉调查档案卡片 01",
    width: 242,
    height: 136,
  },
  {
    src: "/archive-ga-004/work-02.png",
    hoverSrc: "/archive-ga-004/work-02-hover.png",
    alt: "视觉调查档案卡片 02",
    width: 242,
    height: 136,
  },
  {
    src: "/archive-ga-004/work-03.png",
    hoverSrc: "/archive-ga-004/work-03-hover.png",
    alt: "视觉调查档案卡片 03",
    width: 242,
    height: 136,
  },
  {
    src: "/archive-ga-004/work-04.png",
    hoverSrc: "/archive-ga-004/work-04-hover.png",
    alt: "视觉调查档案卡片 04",
    width: 242,
    height: 136,
  },
  {
    src: "/archive-ga-004/work-05.png",
    hoverSrc: "/archive-ga-004/work-05-hover.png",
    alt: "视觉调查档案卡片 05",
    width: 242,
    height: 136,
  },
];

export const ARCHIVE_GA_004_CARDS: GalleryCard[] = [
  ...ARCHIVE_GA_004_CARD_SET,
  ...ARCHIVE_GA_004_CARD_SET,
  ...ARCHIVE_GA_004_CARD_SET,
  ...ARCHIVE_GA_004_CARD_SET.slice(0, 1),
];
