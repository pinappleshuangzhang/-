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
  "/hero/hero-mobile-first.webp",
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
              <Image
                src={material.src}
                alt={index === 0 ? cardAlt : ""}
                width={218}
                height={218}
                priority
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

      <div
        data-loader-chrome
        className="absolute left-3 right-3 top-3 flex items-start justify-between md:left-5 md:right-5"
      >
        <p
          data-loader-status
          aria-hidden="true"
          className="flex items-end font-serif-sc text-10 font-normal leading-[14px] text-grey-400 md:text-14 md:leading-5"
        >
          <span className="whitespace-nowrap">{roleLabel}</span>
          <span className="relative top-0.5 font-bodoni">{idLabel}</span>
          <span className="ml-1 inline-block h-[14px] overflow-hidden md:h-5">
            <span
              data-loader-phase-track
              className="flex flex-col items-start will-change-transform"
            >
              {phases.map((label) => (
                <span
                  key={label}
                  className="flex h-[14px] items-end whitespace-nowrap md:h-5"
                >
                  {label}
                </span>
              ))}
            </span>
          </span>
        </p>
        <span
          data-loader-percent
          className="shrink-0 text-right font-bodoni text-12 leading-[14px] text-grey-400 md:text-14 md:leading-5"
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
