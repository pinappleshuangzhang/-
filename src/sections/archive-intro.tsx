import Image from "next/image";
import { RepelFilter } from "@/components/effects/repel-filter";
import { SectionBackground } from "@/components/ui/section-background";
import archiveBgImg from "../../public/archive/archive-bg.png";
import archiveFolderImg from "../../public/archive/archive-folder.png";

/**
 * 第二屏：档案 GA_001《什么是引力？》
 * 纸质背景 + 居中档案夹卡片，文字随卡片以 em 等比缩放（基准 670px = 16px 字号）。
 */
export function ArchiveIntro() {
  return (
    <section className="relative h-full min-h-[700px] overflow-hidden bg-white">
      {/* 鼠标排斥滤镜：分屏内图片、文字全部参与变形 */}
      <RepelFilter className="absolute inset-0">
      <SectionBackground src={archiveBgImg} className="z-10" />

      <div className="absolute inset-0 z-20">
        {/* 档案夹卡片：设计稿 670x500，垂直中心略低于屏幕中心 11px */}
        <div className="absolute left-1/2 top-[calc(50%+11px)] aspect-[670/500] w-[min(670px,calc(100vw-60px))] -translate-x-1/2 -translate-y-1/2 text-[length:calc(min(670px,100vw-60px)/41.875)]">
          {/* 投影：设计稿手绘投影图形 1:1 还原（SVG 画布含模糊出血，按设计坐标定位） */}
          <span
            aria-hidden="true"
            className="absolute left-[-2.57%] top-[1.76%] block h-[119.8%] w-[111.64%]"
          >
            <Image src="/archive/folder-shadow.svg" alt="" fill sizes="70vw" />
          </span>
          <Image
            src={archiveFolderImg}
            alt="档案 GA_001 档案夹"
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 670px, 100vw"
            className="object-contain"
          />
          {/* 卡片内文字 */}
          <div className="absolute left-[9.4%] top-[28.2%] flex w-[46%] flex-col gap-[1em]">
            <Image
              src="/archive/archive-logo.svg"
              alt=""
              width={48}
              height={48}
              className="size-[3em]"
            />
            <p className="font-serif-sc text-[1.75em] uppercase text-grey-400">
              我们不断看到同一种现象
            </p>
            <div className="font-serif-sc text-[1.75em] uppercase text-grey-200">
              <p>
                <span className="text-grey-400">有些品牌</span>会被记住
              </p>
              <p>有些产品会被选择</p>
              <p>有些设计会被相信</p>
            </div>
          </div>
        </div>
      </div>
      </RepelFilter>
    </section>
  );
}
