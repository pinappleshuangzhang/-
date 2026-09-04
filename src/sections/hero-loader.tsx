import Image from "next/image";
import loaderPassImg from "../../public/hero/loader-pass.webp";
import mobileBgImg from "../../public/hero/hero-mobile-bg.webp";

export const LOADER_ASSET_PATHS = [
  "/hero/loader-pass.webp",
  "/hero/loader-gradient.svg",
  "/hero/hero-display-bg.webp",
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
 * 加载序幕：深底上浅色渐变按进度自上而下铺开，裁切露出居中证件托盘。
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

      <div className="absolute inset-0 hidden bg-grey-400 md:block">
        <div
          data-loader-wipe
          className="absolute inset-0"
          style={{ clipPath: "inset(0% 0% 100% 0%)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('/hero/loader-gradient.svg')] bg-[length:100%_100%]"
          />
          <div
            className="absolute left-1/2 top-1/2 origin-center"
            style={{
              width: 295,
              height: 296,
              transform:
                "translate(-50%, -50%) scale(min(100vw / 1440px, 100vh / 800px))",
            }}
          >
            <Image
              src={loaderPassImg}
              alt={cardAlt}
              width={295}
              height={296}
              priority
              sizes="21vw"
              className="size-full object-cover"
            />
            <div className="absolute left-[93px] top-[149px] flex w-[100px] flex-col items-start gap-1.5 text-grey-400" aria-hidden="true">
              <div className="flex flex-col items-start gap-1">
                <span className="relative block h-[9px] w-[10px] overflow-clip">
                  <Image
                    src="/hero/loader-star.svg"
                    alt=""
                    width={10}
                    height={9}
                    unoptimized
                    className="size-full"
                  />
                </span>
                <p className="whitespace-nowrap font-serif-sc text-[11px] font-medium leading-normal uppercase">
                  万有引力设计档案室
                </p>
              </div>
              <span className="h-px w-full bg-grey-400" aria-hidden="true" />
              <p className="w-full font-serif-sc text-[8px] font-normal leading-normal uppercase">
                用户临时身份
              </p>
              <p className="font-bodoni text-[25px] font-normal leading-normal uppercase">
                0_41
              </p>
            </div>
          </div>
        </div>
      </div>

      <p
        data-loader-status
        data-copy-apply={applyLabel}
        data-copy-review={reviewLabel}
        data-copy-approved={approvedLabel}
        aria-live="polite"
        className="absolute right-5 top-5 z-10 max-md:sr-only whitespace-nowrap text-right font-serif-sc text-18 font-normal uppercase leading-normal text-white"
      >
        <span>{roleLabel}</span>
        <span className="font-bodoni">{idLabel}</span>
        {` `}
        <span data-loader-phase>{applyLabel}</span><span className="font-bodoni">-</span><span data-loader-percent className="font-bodoni">0%</span>
      </p>
    </>
  );
}
