"use client";

import { useRef, type RefObject } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  MEMBER_RECORD_GRID_HIDDEN,
  MEMBER_RECORD_GRID_VISIBLE,
  MEMBER_RECORD_MASK_COLS,
  MEMBER_RECORD_MASK_FRAME_COUNT,
  MEMBER_RECORD_MASK_ROWS,
  MEMBER_RECORD_REVEAL_DELAY,
  MEMBER_RECORD_REVEAL_DURATION,
} from "@/animations/member-record-reveal";
import { MEMBER_FOG_REVEAL_THRESHOLD } from "@/animations/member-record-fog-reveal";
import {
  playGravaStrokeLoad,
  playMemberMarkReveal,
} from "@/animations/member-record-logo-hover";
import { FogGlass } from "@/components/effects/fog-glass";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import {
  MEMBER_CELL_PATHS,
  MEMBER_CELL_VIEW_BOX,
  MEMBER_GRAVA_CELL_SHAPE,
  MEMBER_GRAVA_FOG_BOX_CLASS,
  MEMBER_GRAVA_FOG_CLIP,
  MEMBER_MARK_CELL_SHAPE,
  MEMBER_MARK_FOG_BOX_CLASS,
  MEMBER_MARK_FOG_CLIP,
  MEMBER_GRAVA_LOGO_IN_FOG_CLASS,
  MEMBER_PROFILE_ACTIONS_VISIBLE,
} from "@/lib/member-record-cells";
import { memberTextLayout } from "@/lib/member-record-profile-layout";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SplitWords } from "@/components/ui/split-words";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  clearElementMask,
  createDissolveMaskSprite,
  setSpriteMaskFrame,
  type DissolveMaskSprite,
} from "@/lib/dissolve-mask";
import { MemberRecordMobile } from "@/sections/member-record-mobile";
import memberRecordImg from "../../public/archive/member-record.webp";

gsap.registerPlugin(useGSAP);

/** 入场与 hover 共用一张溶解雪碧图，首次使用时生成并缓存 */
let dissolveSprite: DissolveMaskSprite | null = null;
function getDissolveSprite(): DissolveMaskSprite | null {
  dissolveSprite ??= createDissolveMaskSprite(
    MEMBER_RECORD_MASK_COLS,
    MEMBER_RECORD_MASK_ROWS,
    MEMBER_RECORD_MASK_FRAME_COUNT,
  );
  return dissolveSprite;
}

/**
 * 第四屏：档案 GA_002《成员记录》的初始陈列状态。
 * 展柜大图停留两秒后，浮现成员调查信息网格。
 */
export function MemberRecord() {
  const container = useRef<HTMLElement>(null);
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { t } = useLocale();

  useGSAP(
    () => {
      const root = container.current;
      const grids = root?.querySelectorAll<HTMLElement>("[data-member-grid]");
      if (!grids?.length) return;

      grids.forEach((grid) => {
        // 模糊灰底与网格文字拆成两层：遮罩若盖在模糊层的祖先上会成为
        // backdrop root，阻断 backdrop-filter 取样，所以斑块溶解只作用于
        // 网格文字层，模糊灰底层以同节奏淡入，两者同一时间轴同步入场。
        const overlay = grid.querySelector<HTMLElement>(
          "[data-member-overlay]",
        );
        const masked =
          grid.querySelector<HTMLElement>("[data-member-mask]");
        if (!overlay || !masked) return;

        const clearMask = () => clearElementMask(masked);

        if (reducedMotion) {
          clearMask();
          gsap.set([overlay, masked], { opacity: 1 });
          return;
        }
        if (!isActive) {
          clearMask();
          gsap.set([overlay, masked], MEMBER_RECORD_GRID_HIDDEN);
          return;
        }

        const sprite = getDissolveSprite();
        if (!sprite) {
          gsap.to([overlay, masked], MEMBER_RECORD_GRID_VISIBLE);
          return;
        }

        // 借用切屏幕布的斑块生长节奏：网格文字藏在全透明遮罩后逐帧显现，
        // 模糊灰底同步淡入；斑块铺满后移除遮罩。
        setSpriteMaskFrame(masked, sprite, 0);
        const proxy = { frame: 0 };
        const timeline = gsap.timeline({
          delay: MEMBER_RECORD_REVEAL_DELAY,
        });
        timeline.set(masked, { opacity: 1 });
        timeline.to(
          overlay,
          {
            opacity: 1,
            duration: MEMBER_RECORD_REVEAL_DURATION,
            ease: "none",
          },
          "<",
        );
        timeline.to(
          proxy,
          {
            frame: sprite.frameCount - 1,
            duration: MEMBER_RECORD_REVEAL_DURATION,
            ease: "none",
            onUpdate: () => {
              setSpriteMaskFrame(masked, sprite, Math.round(proxy.frame));
            },
            onComplete: clearMask,
          },
          "<",
        );
      });
    },
    // revertOnUpdate：切屏离开时终止上一轮时间轴并还原样式，
    // 否则残留的延迟时间轴会在屏幕隐藏期间把浮层悄悄置为可见，
    // 快速划走再返回时灰色遮罩就会提前出现。
    {
      dependencies: [isActive, reducedMotion],
      revertOnUpdate: true,
      scope: container,
    },
  );

  return (
    <ScreenShell ref={container} aria-label={t("member.aria")}>
      <Image
        src={memberRecordImg}
        alt={t("member.imageAlt")}
        fill
        sizes="100vw"
        className="hidden object-cover object-top md:block"
      />
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/archive/member-record-mobile.webp"
          alt={t("member.imageAlt")}
          fill
          sizes="100vw"
          unoptimized
          className="object-cover object-top"
        />
        <MemberRecordMobile />
      </div>
      {/* 与背景图 object-cover object-top 裁切同步的定位盒：
          宽 = max(100vw, 100vh×2048/1200)，顶部对齐、水平居中，
          浮层按盒内百分比定位即可在任何分辨率下贴住银色边框 */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden aspect-[2048/1200] w-[max(100vw,170.667vh)] -translate-x-1/2 md:block">
        <div
          data-member-grid
          className="pointer-events-none absolute left-[3.611%] top-[15.59%] aspect-[1335/933] w-[92.708%] *:opacity-0"
        >
          <div
            data-member-overlay
            aria-hidden="true"
            className="absolute inset-x-0 top-0 bottom-[-1px] rounded-[7.5%_/_10.7%] bg-[#2B2B2B]/[0.45] backdrop-blur-[4px]"
          />
          <div data-member-mask className="absolute inset-0">
            <MemberProfile
              identifier="01"
              name="South"
              role={t("member.role01")}
              direction={t("member.direction01")}
              {...memberTextLayout(
                {
                  headerClassName: "left-[2.472%] top-[5.573%] w-[24.85%]",
                  dividerClassName: "left-[2.472%] top-[10.611%]",
                  nameClassName: "left-[2.472%] top-[13.183%] w-[24.85%]",
                  directionClassName: "left-[2.472%] top-[17.578%] w-[24.85%]",
                  actionsClassName: "left-[2.472%] top-[23.902%]",
                },
                {
                  headerClassName: "left-[2.472%] top-[9.861%] w-[24.85%]",
                  dividerClassName: "left-[2.472%] top-[14.898%]",
                  nameClassName: "left-[2.472%] top-[17.47%] w-[24.85%]",
                  directionClassName: "left-[2.472%] top-[21.972%] w-[24.85%]",
                  actionsClassName: "left-[2.472%] top-[23.902%]",
                },
              )}
            />
            <MemberProfile
              identifier="02"
              name="Pineapple"
              role={t("member.role02")}
              direction={t("member.direction02")}
              {...memberTextLayout(
                {
                  headerClassName: "left-[66.142%] top-[5.573%] w-[24.85%]",
                  dividerClassName: "left-[67.491%] top-[10.611%]",
                  nameClassName: "left-[68.614%] top-[13.183%] w-[24.85%]",
                  directionClassName: "left-[70.187%] top-[17.578%] w-[24.85%]",
                  actionsClassName: "left-[71.985%] top-[23.902%]",
                },
                {
                  headerClassName: "left-[68.115%] top-[7.824%] w-[24.85%]",
                  dividerClassName: "left-[68.714%] top-[12.862%]",
                  nameClassName: "left-[70.061%] top-[15.434%] w-[24.85%]",
                  directionClassName: "left-[70.884%] top-[19.936%] w-[24.85%]",
                  actionsClassName: "left-[71.985%] top-[23.902%]",
                },
              )}
            />
            <MemberProfile
              identifier="03"
              name="Sheep"
              role={t("member.role03")}
              direction={t("member.direction03")}
              {...memberTextLayout(
                {
                  headerClassName: "left-[28.367%] top-[39.228%] w-[19.69%]",
                  dividerClassName: "left-[28.367%] top-[44.266%]",
                  nameClassName: "left-[28.367%] top-[46.838%] w-[19.69%]",
                  directionClassName: "left-[28.367%] top-[51.232%] w-[19.69%]",
                  actionsClassName: "left-[28.367%] top-[58.306%]",
                },
                {
                  headerClassName: "left-[28.368%] top-[43.623%] w-[19.69%]",
                  dividerClassName: "left-[28.368%] top-[48.66%]",
                  nameClassName: "left-[28.368%] top-[51.233%] w-[19.69%]",
                  directionClassName: "left-[28.368%] top-[55.734%] w-[19.69%]",
                  actionsClassName: "left-[28.367%] top-[58.306%]",
                },
              )}
            />
            <MemberProfile
              identifier="04"
              name="Joe"
              role={t("member.role04")}
              direction={t("member.direction04")}
              {...memberTextLayout(
                {
                  headerClassName: "left-[68.263%] top-[39.228%] w-[24.85%]",
                  dividerClassName: "left-[67.514%] top-[44.266%]",
                  nameClassName: "left-[67.065%] top-[46.838%] w-[24.85%]",
                  directionClassName: "left-[66.167%] top-[51.232%] w-[24.85%]",
                  actionsClassName: "left-[64.97%] top-[58.306%]",
                },
                {
                  headerClassName: "left-[69.237%] top-[40.836%] w-[24.85%]",
                  dividerClassName: "left-[68.638%] top-[45.874%]",
                  nameClassName: "left-[67.964%] top-[48.446%] w-[24.85%]",
                  directionClassName: "left-[67.066%] top-[52.947%] w-[24.85%]",
                  actionsClassName: "left-[64.97%] top-[58.306%]",
                },
              )}
            />
            <DesktopGravaCell />
            <DesktopMemberMark />
            <div className="pointer-events-none absolute inset-0 z-[2]">
              <Image
                src="/archive/member-record-grid.svg"
                alt=""
                fill
                sizes="92.71vw"
                className="object-fill"
              />
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

const GRAVA_STROKE_SEGMENTS = [
  "polygon(0 0, 28% 0, 28% 32%, 0 32%)",
  "polygon(0 20%, 11% 20%, 11% 82%, 0 82%)",
  "polygon(0 68%, 28% 68%, 28% 100%, 0 100%)",
  "polygon(13% 48%, 28% 48%, 28% 88%, 13% 88%)",
  "polygon(31% 26%, 38% 26%, 38% 100%, 31% 100%)",
  "polygon(35% 26%, 45% 26%, 45% 64%, 35% 64%)",
  "polygon(45% 26%, 57% 26%, 57% 58%, 45% 58%)",
  "polygon(45% 52%, 63% 52%, 63% 100%, 45% 100%)",
  "polygon(56% 26%, 64% 26%, 64% 100%, 56% 100%)",
  "polygon(63% 26%, 72% 26%, 79% 100%, 72% 100%)",
  "polygon(75% 72%, 84% 26%, 75% 26%, 70% 72%)",
  "polygon(83% 26%, 94% 26%, 94% 58%, 83% 58%)",
  "polygon(83% 52%, 100% 52%, 100% 100%, 83% 100%)",
  "polygon(94% 26%, 100% 26%, 100% 100%, 94% 100%)",
] as const;

function DesktopGravaCell() {
  const logoRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const playReveal = () => {
    if (reducedMotion) return;

    const root = logoRef.current;
    const base = root?.querySelector<HTMLElement>("[data-grava-base]");
    const strokes = root?.querySelectorAll<HTMLElement>("[data-grava-stroke]");
    if (!base || !strokes?.length) return;

    playGravaStrokeLoad(base, Array.from(strokes));
  };

  return (
    <div className={MEMBER_GRAVA_FOG_BOX_CLASS}>
      {/* 霜下字标：隔霜模糊，擦开处清晰；达阈值后播放描边动画 */}
      <DesktopGravaLogo logoRef={logoRef} />
      <FogGlass
        className="absolute inset-0"
        clipPath={MEMBER_GRAVA_FOG_CLIP}
        maskShape={MEMBER_GRAVA_CELL_SHAPE}
        revealThreshold={MEMBER_FOG_REVEAL_THRESHOLD}
        appearDelay={MEMBER_RECORD_REVEAL_DELAY}
        appearDuration={MEMBER_RECORD_REVEAL_DURATION}
        onReveal={playReveal}
      />
    </div>
  );
}

function DesktopGravaLogo({
  logoRef,
}: {
  logoRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={logoRef} aria-hidden="true" className={MEMBER_GRAVA_LOGO_IN_FOG_CLASS}>
      <div data-grava-base className="absolute inset-0">
        <Image
          src="/archive/member-record-grava.svg"
          alt=""
          fill
          sizes="8.69vw"
        />
      </div>
      {GRAVA_STROKE_SEGMENTS.map((clipPath) => (
        <span
          key={clipPath}
          data-grava-stroke
          className="absolute inset-0 opacity-0"
          style={{ clipPath }}
        >
          <Image
            src="/archive/member-record-grava.svg"
            alt=""
            fill
            sizes="8.69vw"
          />
        </span>
      ))}
    </div>
  );
}

/** 右上起顺时针：2 右上 → 4 右下 → 3 左下 → 1 左上 */
const MEMBER_MARK_DIAMONDS = [
  {
    src: "/archive/member-record-mark-2.svg",
    className: "right-0 top-0",
  },
  {
    src: "/archive/member-record-mark-4.svg",
    className: "bottom-0 right-0",
  },
  {
    src: "/archive/member-record-mark-3.svg",
    className: "bottom-0 left-0",
  },
  {
    src: "/archive/member-record-mark-1.svg",
    className: "left-0 top-0",
  },
] as const;

function DesktopMemberMark() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  /** 擦拭达阈值后播放菱形入场（雾面指针热区盖住了 Logo 本体的 hover） */
  const playReveal = () => {
    if (reducedMotion) return;

    const diamonds = rootRef.current?.querySelectorAll<HTMLElement>(
      "[data-member-mark-diamond]",
    );
    if (!diamonds?.length) return;

    playMemberMarkReveal(Array.from(diamonds));
  };

  return (
    <>
      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[52.5%] top-[40.6%] aspect-[26/23] h-[3%]"
      >
        {MEMBER_MARK_DIAMONDS.map(({ src, className }) => (
          <span
            key={src}
            data-member-mark-diamond
            className={`absolute h-1/2 w-1/2 ${className}`}
          >
            <Image src={src} alt="" fill sizes="1.16vw" unoptimized />
          </span>
        ))}
      </div>
      <div className={MEMBER_MARK_FOG_BOX_CLASS}>
        <FogGlass
          className="absolute inset-0"
          clipPath={MEMBER_MARK_FOG_CLIP}
          maskShape={MEMBER_MARK_CELL_SHAPE}
          revealThreshold={MEMBER_FOG_REVEAL_THRESHOLD}
          appearDelay={MEMBER_RECORD_REVEAL_DELAY}
          appearDuration={MEMBER_RECORD_REVEAL_DURATION}
          onReveal={playReveal}
        />
      </div>
    </>
  );
}

type MemberProfileProps = {
  identifier: string;
  name: string;
  role: string;
  direction: string;
  headerClassName: string;
  dividerClassName: string;
  nameClassName: string;
  directionClassName: string;
  actionsClassName: string;
  /** 成员 IP 形象：放在擦拭显影层里，擦到才出现，默认不可见 */
  ipImage?: { src: string; className: string; width: number; height: number };
};

function MemberProfile({
  identifier,
  name,
  role,
  direction,
  headerClassName,
  dividerClassName,
  nameClassName,
  directionClassName,
  actionsClassName,
  ipImage,
}: MemberProfileProps) {
  const { t } = useLocale();
  // hover 时白底（含 IP 形象）渐显、文字渐变为深色；motion-reduce 下直接切换
  const fade =
    "transition-opacity duration-[600ms] ease-out motion-reduce:transition-none";
  const recolor =
    "transition-colors duration-[600ms] ease-out motion-reduce:transition-none";
  const textColor = `text-white group-hover:text-grey-400 ${recolor}`;

  return (
    <div className="group pointer-events-none absolute inset-0">
      <div
        aria-hidden="true"
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 ${fade}`}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={MEMBER_CELL_VIEW_BOX}
          preserveAspectRatio="none"
        >
          <path
            d={MEMBER_CELL_PATHS[identifier]}
            strokeWidth={3}
            className="fill-white stroke-white"
          />
        </svg>
        {ipImage ? (
          <Image
            src={ipImage.src}
            alt=""
            width={ipImage.width}
            height={ipImage.height}
            className={`absolute h-auto ${ipImage.className}`}
          />
        ) : null}
      </div>
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox={MEMBER_CELL_VIEW_BOX}
        preserveAspectRatio="none"
      >
        <path
          d={MEMBER_CELL_PATHS[identifier]}
          className="pointer-events-auto fill-transparent"
        />
      </svg>
      <p
        data-sd-words
        data-sd-delay="0.2"
        aria-label={`${t("member.investigator")}_${identifier}_${role}`}
        className={`absolute z-10 text-16 ${textColor} ${headerClassName}`}
      >
        <span className="font-serif-sc font-normal">
          <SplitWords text={t("member.investigator")} />
        </span>
        <span className="font-bodoni font-normal">
          <SplitWords text={`_${identifier}_`} />
        </span>
        <span className="font-serif-sc font-normal">
          <SplitWords text={role} />
        </span>
      </p>
      <span
        data-sd-bar
        data-sd-delay="0.25"
        className={`absolute z-10 origin-left scale-x-0 border-t border-dashed border-white/30 group-hover:border-grey-400/30 ${recolor} ${dividerClassName}`}
        aria-hidden="true"
      >
        <span className="invisible whitespace-nowrap text-16">
          <span className="font-serif-sc font-normal">
            {t("member.investigator")}
          </span>
          <span className="font-bodoni font-normal">_{identifier}_</span>
          <span className="font-serif-sc font-normal">{role}</span>
        </span>
      </span>
      <p
        data-sd-words
        data-sd-delay="0.3"
        aria-label={`${t("member.namePrefix")}${name}`}
        className={`absolute z-10 whitespace-nowrap text-16 ${textColor} ${nameClassName}`}
      >
        <span className="font-serif-sc font-normal">
          <SplitWords text={t("member.namePrefix")} />
        </span>
        <span className="font-serif-sc font-medium">
          <SplitWords text={name} />
        </span>
      </p>
      <p
        data-sd-words
        data-sd-delay="0.4"
        aria-label={direction}
        className={`absolute z-10 whitespace-nowrap font-serif-sc text-16 font-normal ${textColor} ${directionClassName}`}
      >
        <SplitWords text={direction} />
      </p>
      <div
        data-sd-words
        data-sd-delay="0.5"
        className={`absolute z-10 flex items-center gap-4 ${textColor} ${actionsClassName} ${MEMBER_PROFILE_ACTIONS_VISIBLE ? "" : "hidden"}`}
      >
        <ProfileAction label={t("member.portfolio")} />
        <ProfileAction label={t("member.contactMe")} />
      </div>
    </div>
  );
}

function ProfileAction({ label }: { label: string }) {
  const invertClass = "group-hover:invert";
  return (
    <span className="profile-action pointer-events-auto flex cursor-pointer items-center gap-0.5 font-serif-sc text-16 font-normal">
      <SplitWords text={label} />
      <span aria-hidden="true" className="relative block size-4 overflow-hidden">
        <Image
          src="/archive/member-record-external-arrow.webp"
          alt=""
          fill
          sizes="16px"
          className={`profile-action-arrow profile-action-arrow-current object-contain ${invertClass}`}
        />
        <Image
          src="/archive/member-record-external-arrow.webp"
          alt=""
          fill
          sizes="16px"
          className={`profile-action-arrow profile-action-arrow-next object-contain motion-reduce:hidden ${invertClass}`}
        />
      </span>
    </span>
  );
}
