import type { StaticImageData } from "next/image";
import archiveBgImg from "../../public/archive/archive-bg.webp";
import contactBgImg from "../../public/contact/contact-bg.webp";
import studioBgImg from "../../public/hero/hero-display-bg.webp";

/**
 * 全站共享背景键：同键只挂载一次，由分屏声明、舞台层消费。
 * studio / archive 各一份图，多屏共用，不在屏内重复挂载。
 */
export type SectionBackgroundKey = "studio" | "archive" | "contact";

type SectionBackgroundConfig = {
  src: StaticImageData;
  /** 图片未就绪时的兜底底色 */
  fallbackClassName: string;
  imageClassName?: string;
  priority?: boolean;
  unoptimized?: boolean;
};

export const SECTION_BACKGROUNDS: Record<
  SectionBackgroundKey,
  SectionBackgroundConfig
> = {
  studio: {
    src: studioBgImg,
    fallbackClassName: "bg-grey-100",
    priority: true,
  },
  archive: {
    src: archiveBgImg,
    fallbackClassName: "bg-white",
  },
  contact: {
    src: contactBgImg,
    fallbackClassName: "bg-grey-100",
    imageClassName: "object-fill",
    unoptimized: true,
  },
};
