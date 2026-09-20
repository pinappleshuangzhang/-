import Image from "next/image";
import { SectionBackground } from "@/components/ui/section-background";
import { SECTION_BACKGROUNDS } from "@/lib/section-backgrounds";
import boxImg1 from "../../public/hero/loader-box-1.webp";
import boxImg2 from "../../public/hero/loader-box-2.webp";
import boxImg3 from "../../public/hero/loader-box-3.webp";
import boxImg4 from "../../public/hero/loader-box-4.webp";
import boxImg5 from "../../public/hero/loader-box-5.webp";
import boxImg6 from "../../public/hero/loader-box-6.webp";
import boxShadow from "../../public/hero/loader-box-shadow.svg";

const archiveBackground = SECTION_BACKGROUNDS.archive;

export const LOADER_ASSET_PATHS = [
  "/hero/loader-box-1.webp",
  "/hero/loader-box-2.webp",
  "/hero/loader-box-3.webp",
  "/hero/loader-box-4.webp",
  "/hero/loader-box-5.webp",
  "/hero/loader-box-6.webp",
  "/hero/loader-box-shadow.svg",
  archiveBackground.src.src,
  "/hero/hero-loader-bg.webp",
] as const;

/** 六张 Grava 材质图渐隐循环 */
const MATERIALS = [
  { src: boxImg1, key: "box-1" },
  { src: boxImg2, key: "box-2" },
  { src: boxImg3, key: "box-3" },
  { src: boxImg4, key: "box-4" },
  { src: boxImg5, key: "box-5" },
  { src: boxImg6, key: "box-6" },
] as const;

type HeroLoaderProps = {
  roleLabel: string;
  idLabel: string;
  applyLabel: string;
  reviewLabel: string;
  approvedLabel: string;
  cardAlt: string;
};

/**
 * 加载序幕：浅底居中材质图渐隐循环替换，顶部进度条跟真实加载。
 * 移动端与桌面端共享真实进度、材质循环和自然结束逻辑。
 */
export function HeroLoader({
  roleLabel,
  idLabel,
  applyLabel,
  reviewLabel,
  approvedLabel,
  cardAlt,
}: HeroLoaderProps) {
  const phases = [applyLabel, reviewLabel, approvedLabel];

  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(97deg,var(--color-white)_0%,var(--color-grey-100)_102.81%)] md:hidden" />
      <div className={`absolute inset-0 hidden md:block ${archiveBackground.fallbackClassName}`}>
        <SectionBackground src={archiveBackground.src} priority />
      </div>

      <div
        data-loader-zoom
        className="absolute inset-0 origin-center will-change-transform"
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[187px] w-[179px] [transform:translate(-50%,calc(-50%+17px))] md:h-[221px] md:w-[244px] md:[transform:translate(calc(-50%-2px),calc(-50%+27px))_scale(min(100vw/1440px,100vh/800px))]"
        >
          <Image
            src={boxShadow}
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 179px, 17vw"
            className="object-fill"
          />
        </div>

        <div
          data-loader-materials
          className="absolute left-1/2 top-1/2 size-[170px] origin-center overflow-hidden [transform:translate(-50%,-50%)] md:size-[218px] md:[transform:translate(-50%,-50%)_scale(min(100vw/1440px,100vh/800px))]"
        >
          {MATERIALS.map((material, index) => (
            <div
              key={material.key}
              data-loader-mat
              className="absolute inset-0"
              style={{
                zIndex: index === 0 ? 1 : 0,
                opacity: index === 0 ? 1 : 0,
                visibility: index === 0 ? "visible" : "hidden",
              }}
            >
              {/* unoptimized：与预加载共用同一原始 URL，进度 100% 时缓存必命中，
                  避免优化器变体未就绪导致 Safari/慢网下材质空白 */}
              <Image
                src={material.src}
                alt={index === 0 ? cardAlt : ""}
                width={218}
                height={218}
                priority
                unoptimized
                sizes="(max-width: 767px) 170px, 16vw"
                className="size-full object-fill"
              />
            </div>
          ))}
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        data-loader-progressbar
        className="absolute inset-x-0 top-0 h-0.5 bg-grey-100"
      >
        <div
          data-loader-bar
          className="absolute inset-y-0 left-0 w-full origin-left bg-grey-300"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* 顶部信息行与导航同 y：移动端跟安全区 +12px；桌面导航行高随 logo 为 20su，
          文字中心在 20px+10su，本行行高 18su，故 top = 20px+1su 时两者文字中心重合 */}
      <div
        data-loader-chrome
        className="absolute left-3 right-3 top-[calc(env(safe-area-inset-top)+12px)] flex items-center justify-between md:left-[var(--page-margin)] md:right-[var(--page-margin)] md:top-[calc(var(--page-margin)+var(--su))]"
      >
        <p
          data-loader-status
          aria-hidden="true"
          className="flex items-center font-serif-sc text-12 font-normal leading-[18px] text-grey-400 md:text-[length:calc(var(--su)*12)] md:leading-[calc(var(--su)*18)]"
        >
          <span className="whitespace-nowrap">{roleLabel}</span>
          <span className="relative top-px font-bodoni md:top-[2px]">
            {idLabel}
          </span>
          <span className="ml-1 block h-[18px] overflow-hidden md:ml-[calc(var(--su)*4)] md:h-[calc(var(--su)*18)]">
            <span
              data-loader-phase-track
              className="flex flex-col items-start will-change-transform"
            >
              {phases.map((label) => (
                <span
                  key={label}
                  className="flex h-[18px] items-end whitespace-nowrap md:h-[calc(var(--su)*18)]"
                >
                  {label}
                </span>
              ))}
            </span>
          </span>
        </p>
        <span
          data-loader-percent
          className="shrink-0 text-right font-bodoni text-12 leading-[18px] text-grey-400 md:text-[length:calc(var(--su)*12)] md:leading-[calc(var(--su)*18)]"
        >
          0%
        </span>
      </div>

      <p
        data-loader-live
        data-role={roleLabel}
        data-id={idLabel}
        aria-live="polite"
        className="sr-only"
      >
        {`${roleLabel}${idLabel} ${applyLabel} 0%`}
      </p>
    </>
  );
}
