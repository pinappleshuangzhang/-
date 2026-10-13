import type { StaticImageData } from "next/image";
import archiveBgImg from "../../public/archive/archive-bg.webp";
import contactBgImg from "../../public/contact-survey/machine-bg.webp";
import contactBgMobileImg from "../../public/contact-survey/machine-bg-mobile.webp";
import studioBgImg from "../../public/hero/hero-display-bg.webp";

/**
 * 全站共享背景键：同键只挂载一次，由分屏声明、舞台层消费。
 * studio 仅桌面；archive 为档案各屏共用；contact 为联系页取件机实景。
 */
export type SectionBackgroundKey = "studio" | "archive" | "contact";

type SectionBackgroundConfig = {
  src: StaticImageData;
  /** 移动端独立画板的背景，避免手机下载桌面大图 */
  mobileSrc?: StaticImageData;
  /** 图片未就绪时的兜底底色 */
  fallbackClassName: string;
  imageClassName?: string;
  priority?: boolean;
  unoptimized?: boolean;
  quality?: number;
  /** 仅桌面挂载图片，避免手机下载 5K 背景 */
  desktopOnly?: boolean;
};

export const SECTION_BACKGROUNDS: Record<
  SectionBackgroundKey,
  SectionBackgroundConfig
> = {
  studio: {
    src: studioBgImg,
    fallbackClassName: "bg-grey-100",
    priority: true,
    desktopOnly: true,
  },
  archive: {
    src: archiveBgImg,
    fallbackClassName: "bg-white",
  },
  contact: {
    src: contactBgImg,
    mobileSrc: contactBgMobileImg,
    fallbackClassName: "bg-grey-100",
    // 取件机实拍：大屏下随 cover 放大到 1.8 倍以上，压到 75 会糊
    quality: 95,
  },
};
