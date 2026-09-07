import type { StaticImageData } from "next/image";
import archiveBgImg from "../../public/archive/archive-bg.webp";
import studioBgImg from "../../public/hero/hero-display-bg.webp";

/**
 * 全站共享背景键：同键只挂载一次，由分屏声明、舞台层消费。
 * studio 仅桌面；archive 为档案各屏与联系页共用（联系页不再单独配图）。
 */
export type SectionBackgroundKey = "studio" | "archive";

type SectionBackgroundConfig = {
  src: StaticImageData;
  /** 图片未就绪时的兜底底色 */
  fallbackClassName: string;
  imageClassName?: string;
  priority?: boolean;
  unoptimized?: boolean;
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
};
