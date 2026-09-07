import Image from "next/image";
import { SectionBackground } from "@/components/ui/section-background";
import { SECTION_BACKGROUNDS } from "@/lib/section-backgrounds";
import mobileBgImg from "../../public/hero/hero-mobile-bg.webp";
import glassImg from "../../public/hero/loader-mat-glass.webp";
import metalImg from "../../public/hero/loader-mat-metal.webp";
import plasterImg from "../../public/hero/loader-mat-plaster.webp";

const archiveBackground = SECTION_BACKGROUNDS.archive;

export const LOADER_ASSET_PATHS = [
  "/hero/loader-mat-plaster.webp",
  "/hero/loader-mat-glass.webp",
  "/hero/loader-mat-metal.webp",
  archiveBackground.src.src,
  "/hero/hero-loader-bg.webp",
  "/hero/hero-display-bg.webp",
] as const;

const MATERIALS = [
  { src: plasterImg, key: "plaster" },
  { src: glassImg, key: "glass" },
  { src: metalImg, key: "metal" },
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
 * 加载序幕：浅底居中材质铭牌自下而上循环替换，底部进度条跟真实加载。
 * 桌面端对稿；移动端仍用既有静帧，进度只播报给读屏。
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
      <Image
        src={mobileBgImg}
        alt=""
        fill
        priority
        unoptimized
        placeholder="blur"
        sizes="100vw"
        className="object-cover md:hidden"
      />

      <div
        className={`absolute inset-0 hidden md:block ${archiveBackground.fallbackClassName}`}
      >
        <SectionBackground src={archiveBackground.src} priority />
        <div
          data-loader-materials
          className="absolute left-1/2 top-1/2 origin-center overflow-hidden"
          style={{
            width: 218,
            height: 218,
            transform:
              "translate(-50%, -50%) scale(min(100vw / 1440px, 100vh / 800px))",
          }}
        >
          {MATERIALS.map((material, index) => (
            <div
              key={material.key}
              data-loader-mat
              className="absolute inset-0"
              style={{
                zIndex: index === 0 ? 1 : 0,
                clipPath: index === 0 ? "none" : "inset(100% 0% 0% 0%)",
              }}
            >
              <Image
                src={material.src}
                alt={index === 0 ? cardAlt : ""}
                width={218}
                height={218}
                priority
                sizes="16vw"
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="absolute bottom-9 left-5 right-5 flex flex-col gap-1.5">
          <p
            data-loader-status
            aria-hidden="true"
            className="flex items-end font-serif-sc text-14 font-normal leading-5 text-grey-400"
          >
            <span className="whitespace-nowrap">{roleLabel}</span>
            <span className="font-bodoni">{idLabel}</span>
            <span className="ml-1 inline-block h-5 overflow-hidden">
              <span
                data-loader-phase-track
                className="flex flex-col items-start will-change-transform"
              >
                {phases.map((label) => (
                  <span
                    key={label}
                    className="flex h-5 items-end whitespace-nowrap"
                  >
                    {label}
                  </span>
                ))}
              </span>
            </span>
          </p>

          <div className="flex items-center gap-3">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              data-loader-progressbar
              className="relative h-px min-w-0 flex-1 bg-grey-100"
            >
              <div
                data-loader-bar
                className="absolute inset-y-0 left-0 w-full origin-left bg-grey-300"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <span
              data-loader-percent
              className="w-9 shrink-0 text-right font-bodoni text-14 leading-5 text-grey-400"
            >
              0%
            </span>
          </div>
        </div>
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
