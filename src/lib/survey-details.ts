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
  /** 英文界面使用的替换图；不传则中英文共用 src */
  srcEn?: string;
  altKey: MessageKey;
  width: number;
  height: number;
  innerClassName?: string;
  /** 入场动画把图片裁在框外时，先请求图片 */
  eager?: boolean;
  titleKey?: MessageKey;
  captionKey?: MessageKey;
  showCaption?: boolean;
} & (
  | { hover: "none" }
  | { hover: "video"; videoSrc: string; playWhenVisible?: boolean }
);

export type SurveyWork = {
  id: string;
  title: string;
  typeLabel: string;
  archivedLabel: string;
  activeCategory: SurveyCategoryCode;
  duration: string;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  /** 作品类型标签（Figma 973:554 / 1266:1694） */
  tagKeys: MessageKey[];
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
    label: "Field Notes",
    typeLabel: "( D Notes)",
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
];

function appleStill(
  file: string,
  altKey: MessageKey,
  section?: { titleKey: MessageKey; captionKey?: MessageKey } | "continue",
): SurveyMediaItem {
  const base = {
    src: `/archive-ga-004/${file}`,
    altKey,
    width: 1920,
    height: 1080,
    hover: "none" as const,
  };
  if (!section || section === "continue") return { ...base, showCaption: false };
  return section.captionKey
    ? { ...base, titleKey: section.titleKey, captionKey: section.captionKey }
    : { ...base, titleKey: section.titleKey };
}

/** 001 品牌设计：The Apple Moment。封面下按 1–3+、4–5、6–7、8–9、10–11、12–14、15–20 分段。 */
export const SURVEY_G_001: SurveyWork = {
  id: "g-001",
  title: "Investigation Details_001",
  typeLabel: "( A Brand)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "A",
  duration: "一个月",
  titleKey: "survey.title",
  descriptionKey: "survey.description",
  tagKeys: [
    "survey.tag.event",
    "survey.tag.brand",
    "survey.tag.website",
    "survey.tag.motion",
  ],
  media: [
    appleStill("apple-cover.webp", "survey.apple.coverAlt"),
    appleStill("apple-01.webp", "survey.apple.01Alt", {
      titleKey: "survey.media2Title",
      captionKey: "survey.media2Caption",
    }),
    appleStill("apple-02.webp", "survey.apple.02Alt", "continue"),
    appleStill("apple-03-v2.webp", "survey.apple.03Alt", "continue"),
    appleStill("apple-03b.webp", "survey.apple.03bAlt", "continue"),
    {
      src: "/archive-ga-004/apple-stage.webp",
      altKey: "survey.apple.stageAlt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-2-hover.mp4",
      playWhenVisible: true,
      showCaption: false,
    },
    appleStill("apple-04.webp", "survey.apple.04Alt", {
      titleKey: "survey.media3Title",
      captionKey: "survey.media3Caption",
    }),
    appleStill("apple-05-v2.webp", "survey.apple.05Alt", "continue"),
    {
      src: "/archive-ga-004/apple-stage.webp",
      altKey: "survey.apple.stageAlt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-3-hover.mp4",
      playWhenVisible: true,
      showCaption: false,
    },
    appleStill("apple-06.webp", "survey.apple.06Alt", {
      titleKey: "survey.media4Title",
      captionKey: "survey.media4Caption",
    }),
    appleStill("apple-07.webp", "survey.apple.07Alt", "continue"),
    {
      src: "/archive-ga-004/apple-stage.webp",
      altKey: "survey.apple.stageAlt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-rewatch-v3.mp4",
      playWhenVisible: true,
      showCaption: false,
    },
    appleStill("apple-08.webp", "survey.apple.08Alt", {
      titleKey: "survey.media5Title",
      captionKey: "survey.media5Caption",
    }),
    appleStill("apple-09.webp", "survey.apple.09Alt", "continue"),
    appleStill("apple-10.webp", "survey.apple.10Alt", "continue"),
    appleStill("apple-11.webp", "survey.apple.11Alt", "continue"),
    {
      src: "/archive-ga-004/apple-stage.webp",
      altKey: "survey.apple.stageAlt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-os.mp4",
      playWhenVisible: true,
      showCaption: false,
    },
    appleStill("apple-12.webp", "survey.apple.12Alt", {
      titleKey: "survey.media6Title",
      captionKey: "survey.media6Caption",
    }),
    appleStill("apple-13.webp", "survey.apple.13Alt", "continue"),
    appleStill("apple-14.webp", "survey.apple.14Alt", "continue"),
    {
      src: "/archive-ga-004/apple-stage.webp",
      altKey: "survey.apple.stageAlt",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/survey-system.mp4",
      playWhenVisible: true,
      showCaption: false,
    },
    appleStill("apple-15.webp", "survey.apple.15Alt", {
      titleKey: "survey.apple.sceneTitle",
      captionKey: "survey.apple.sceneCaption",
    }),
    appleStill("apple-16.webp", "survey.apple.16Alt", "continue"),
    appleStill("apple-17.webp", "survey.apple.17Alt", "continue"),
    appleStill("apple-18.webp", "survey.apple.18Alt", "continue"),
    appleStill("apple-19.webp", "survey.apple.19Alt", "continue"),
    appleStill("apple-20.webp", "survey.apple.20Alt", "continue"),
  ],
};

/** 002 产品设计：Future Creative 2030 */
export const SURVEY_G_002: SurveyWork = {
  id: "g-002",
  title: "Investigation Details_002",
  typeLabel: "( B Product)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "B",
  duration: "一个月",
  titleKey: "survey.future.title",
  descriptionKey: "survey.future.description",
  tagKeys: ["survey.tag.visual", "survey.tag.motion", "survey.tag.explore"],
  media: [
    {
      src: "/archive-ga-004/future-gallery-02.webp",
      altKey: "survey.future.heroAlt",
      width: 1024,
      height: 576,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-01.webp",
      altKey: "survey.future.media1Alt",
      titleKey: "survey.future.media1Title",
      captionKey: "survey.future.media1Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-hero.webp",
      altKey: "survey.future.media2Alt",
      titleKey: "survey.future.media2Title",
      captionKey: "survey.future.media2Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-03.webp",
      altKey: "survey.future.media3Alt",
      titleKey: "survey.future.media3Title",
      captionKey: "survey.future.media3Caption",
      width: 1920,
      height: 1080,
      hover: "video",
      videoSrc: "/archive-ga-004/future-gallery-03.mp4",
    },
    {
      src: "/archive-ga-004/future-gallery-04.webp",
      altKey: "survey.future.media4Alt",
      titleKey: "survey.future.media4Title",
      captionKey: "survey.future.media4Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-05.webp",
      altKey: "survey.future.media5Alt",
      titleKey: "survey.future.media5Title",
      captionKey: "survey.future.media5Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/future-gallery-06.webp",
      altKey: "survey.future.media6Alt",
      titleKey: "survey.future.media6Title",
      captionKey: "survey.future.media6Caption",
      width: 1920,
      height: 1080,
      hover: "none",
    },
  ],
};

/** 封面海报作底，视频进入画面后在海报中央播放。 */
function easycashClip(file: string, altKey: MessageKey): SurveyMediaItem {
  return {
    src: "/archive-ga-004/easycash-hero-v3.webp",
    altKey,
    width: 1920,
    height: 1080,
    hover: "video",
    videoSrc: `/archive-ga-004/${file}`,
    playWhenVisible: true,
    showCaption: false,
  };
}

function easycashStill(
  file: string,
  altKey: MessageKey,
  section?: { titleKey: MessageKey; captionKey?: MessageKey; eager?: boolean },
): SurveyMediaItem {
  const base = {
    src: `/archive-ga-004/${file}`,
    altKey,
    width: 1920,
    height: 1080,
    hover: "none" as const,
    eager: section?.eager,
  };
  if (!section) return { ...base, showCaption: false };
  return {
    ...base,
    titleKey: section.titleKey,
    ...(section.captionKey ? { captionKey: section.captionKey } : {}),
  };
}

/** 003 网站设计：Easycash 数字品牌视觉重塑。封面下是标题与概述，其后为首页、产品、反欺诈、品牌信任。 */
export const SURVEY_G_003: SurveyWork = {
  id: "g-003",
  title: "Investigation Details_003",
  typeLabel: "( C Website)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "C",
  duration: "一个月",
  titleKey: "survey.easycash.title",
  descriptionKey: "survey.easycash.description",
  tagKeys: ["survey.tag.website", "survey.tag.visual", "survey.tag.brand"],
  media: [
    {
      src: "/archive-ga-004/easycash-hero-v3.webp",
      altKey: "survey.easycash.heroAlt",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    easycashStill("easycash-home-01b.webp", "survey.easycash.home01Alt", {
      titleKey: "survey.easycash.homeTitle",
      captionKey: "survey.easycash.homeCaption",
      eager: true,
    }),
    easycashStill("easycash-home-02.webp", "survey.easycash.home02Alt"),
    easycashStill("easycash-home-03.webp", "survey.easycash.home03Alt"),
    easycashStill("easycash-home-04.webp", "survey.easycash.home04Alt"),
    easycashStill("easycash-home-05.webp", "survey.easycash.home05Alt"),
    easycashStill("easycash-home-06.webp", "survey.easycash.home06Alt"),
    easycashClip("easycash-home-v2.mp4", "survey.easycash.homeVideoAlt"),
    easycashStill("easycash-loan-08.webp", "survey.easycash.loan08Alt", {
      titleKey: "survey.easycash.productTitle",
      captionKey: "survey.easycash.productCaption",
    }),
    easycashStill("easycash-loan-09.webp", "survey.easycash.loan09Alt"),
    easycashStill("easycash-loan-10.webp", "survey.easycash.loan10Alt"),
    easycashStill("easycash-loan-12.webp", "survey.easycash.loan12Alt"),
    easycashStill("easycash-loan-13.webp", "survey.easycash.loan13Alt"),
    easycashClip("easycash-loan.mp4", "survey.easycash.loanVideoAlt"),
    easycashStill("easycash-wealth-14.webp", "survey.easycash.wealth14Alt"),
    easycashStill("easycash-wealth-15.webp", "survey.easycash.wealth15Alt"),
    easycashStill("easycash-wealth-16.webp", "survey.easycash.wealth16Alt"),
    easycashStill("easycash-wealth-17.webp", "survey.easycash.wealth17Alt"),
    easycashStill("easycash-wealth-18.webp", "survey.easycash.wealth18Alt"),
    easycashClip("easycash-wealth.mp4", "survey.easycash.wealthVideoAlt"),
    easycashStill("easycash-fraud-01.webp", "survey.easycash.fraud01Alt", {
      titleKey: "survey.easycash.fraudTitle",
      captionKey: "survey.easycash.fraudCaption",
    }),
    easycashStill("easycash-fraud-02.webp", "survey.easycash.fraud02Alt"),
    easycashStill("easycash-fraud-03.webp", "survey.easycash.fraud03Alt"),
    easycashStill("easycash-fraud-04.webp", "survey.easycash.fraud04Alt"),
    easycashClip("easycash-fraud.mp4", "survey.easycash.fraudVideoAlt"),
    easycashStill("easycash-about-01.webp", "survey.easycash.about01Alt", {
      titleKey: "survey.easycash.aboutTitle",
      captionKey: "survey.easycash.aboutCaption",
    }),
    easycashStill("easycash-about-02.webp", "survey.easycash.about02Alt"),
    easycashStill("easycash-about-03.webp", "survey.easycash.about03Alt"),
    easycashStill("easycash-about-04.webp", "survey.easycash.about04Alt"),
  ],
};

/** 004 实战笔记：Design AI Ops，图内已含中英文，按语言切换 */
export const SURVEY_G_004: SurveyWork = {
  id: "g-004",
  title: "Investigation Details_004",
  typeLabel: "( D Notes)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "D",
  duration: "一个月",
  titleKey: "survey.ops.title",
  descriptionKey: "survey.ops.description",
  tagKeys: [
    "survey.tag.observe",
    "survey.tag.aiDesign",
    "survey.tag.judgment",
    "survey.tag.practice",
  ],
  media: [
    {
      src: "/archive-ga-004/ops-cover.webp",
      altKey: "survey.ops.heroAlt",
      width: 1920,
      height: 1080,
      hover: "none",
    },
    {
      src: "/archive-ga-004/ops-02-cn.webp",
      srcEn: "/archive-ga-004/ops-02-en.webp",
      altKey: "survey.ops.media2Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
    {
      src: "/archive-ga-004/ops-03-cn.webp",
      srcEn: "/archive-ga-004/ops-03-en.webp",
      altKey: "survey.ops.media3Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
    {
      src: "/archive-ga-004/ops-04-cn.webp",
      srcEn: "/archive-ga-004/ops-04-en.webp",
      altKey: "survey.ops.media4Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
    {
      src: "/archive-ga-004/ops-05-cn.webp",
      srcEn: "/archive-ga-004/ops-05-en.webp",
      altKey: "survey.ops.media5Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
    {
      src: "/archive-ga-004/ops-06-cn.webp",
      srcEn: "/archive-ga-004/ops-06-en.webp",
      altKey: "survey.ops.media6Alt",
      width: 1920,
      height: 1080,
      hover: "none",
      showCaption: false,
    },
  ],
};

/** 005 实战笔记：Easycash 9 周年视觉系统，与 004 同为文章 */
export const SURVEY_G_005: SurveyWork = {
  id: "g-005",
  title: "Investigation Details_005",
  typeLabel: "( D Notes)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "D",
  duration: "一个月",
  titleKey: "survey.anniversary.title",
  descriptionKey: "survey.anniversary.description",
  tagKeys: [
    "survey.tag.aiAssist",
    "survey.tag.brandVisual",
    "survey.tag.visualSystem",
  ],
  media: [
    {
      src: "/archive-ga-004/anniversary-01-cn.webp",
      srcEn: "/archive-ga-004/anniversary-01-en.webp",
      altKey: "survey.anniversary.heroAlt",
      width: 1920,
      height: 1080,
      hover: "none",
    },
  ],
};

/** 006 实战笔记：金融网站跨地区架构，与 004、005 同为文章 */
export const SURVEY_G_006: SurveyWork = {
  id: "g-006",
  title: "Investigation Details_006",
  typeLabel: "( D Notes)",
  archivedLabel: "( 2026 Archived)",
  activeCategory: "D",
  duration: "一个月",
  titleKey: "survey.region.title",
  descriptionKey: "survey.region.description",
  tagKeys: [
    "survey.tag.crossMarket",
    "survey.tag.modular",
    "survey.tag.multiMarket",
  ],
  media: [
    {
      src: "/archive-ga-004/region-01.webp",
      altKey: "survey.region.heroAlt",
      width: 1920,
      height: 1080,
      hover: "none",
    },
  ],
};

/** 各调查类型对应的代表作品；尚无内容的类型为 null */
export const SURVEY_WORK_BY_CATEGORY: Record<
  SurveyCategoryCode,
  SurveyWork | null
> = {
  A: SURVEY_G_001,
  B: SURVEY_G_002,
  C: SURVEY_G_003,
  D: SURVEY_G_004,
  E: null,
};

/** 第五屏作品顺序，与长廊环、右侧列表一致 */
export const SURVEY_WORKS: SurveyWork[] = [
  SURVEY_G_001,
  SURVEY_G_002,
  SURVEY_G_003,
  SURVEY_G_004,
  SURVEY_G_005,
  SURVEY_G_006,
];

/** 第五屏卡片序号映射到作品；环上重复时按作品数取模 */
export function surveyWorkIndexFromCarouselIndex(index: number): number {
  const count = SURVEY_WORKS.length;
  return ((index % count) + count) % count;
}
