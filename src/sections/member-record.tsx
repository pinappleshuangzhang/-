"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  MEMBER_RECORD_GRID_HIDDEN,
  MEMBER_RECORD_GRID_VISIBLE,
  MEMBER_RECORD_HOVER_REVEAL_DURATION,
  MEMBER_RECORD_MASK_COLS,
  MEMBER_RECORD_MASK_FRAME_COUNT,
  MEMBER_RECORD_MASK_ROWS,
  MEMBER_RECORD_REVEAL_DELAY,
  MEMBER_RECORD_REVEAL_DURATION,
} from "@/animations/member-record-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import {
  MEMBER_CELL_PATHS,
  MEMBER_CELL_VIEW_BOX,
} from "@/lib/member-record-cells";
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
      <Image
        src="/archive/member-record-mobile.webp"
        alt={t("member.imageAlt")}
        fill
        sizes="100vw"
        className="object-cover object-top md:hidden"
      />
      <MemberRecordMobile />
      {/* 与背景图 object-cover object-top 裁切同步的定位盒：
          宽 = max(100vw, 100vh×4096/2401)，顶部对齐、水平居中，
          浮层按盒内百分比定位即可在任何分辨率下贴住银色边框 */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden aspect-[4096/2401] w-[max(100vw,170.596vh)] -translate-x-1/2 md:block">
        <div
          data-member-grid
          className="pointer-events-none absolute left-[3.611%] top-[15.59%] aspect-[1335/933] w-[92.708%] *:opacity-0"
        >
          <div
            data-member-overlay
            aria-hidden="true"
            className="absolute inset-x-0 top-0 bottom-[-1px] rounded-[7.5%_/_10.7%] bg-[#2B2B2B]/[0.55] backdrop-blur-[4px]"
          />
          <div data-member-mask className="absolute inset-0">
            <Image
              src="/archive/member-record-grid.svg"
              alt=""
              fill
              sizes="92.71vw"
              className="object-fill"
            />
            <MemberProfile
              identifier="01"
              name="Pineapple"
              role={t("member.role01")}
              direction={t("member.direction01")}
              headerClassName="left-[2.472%] top-[5.573%] w-[24.85%]"
              dividerClassName="left-[2.472%] top-[10.611%]"
              nameClassName="left-[2.472%] top-[13.183%] w-[24.85%]"
              directionClassName="left-[2.472%] top-[17.578%] w-[24.85%]"
              actionsClassName="left-[2.472%] top-[23.902%]"
            />
            <MemberProfile
              identifier="02"
              name="South"
              role={t("member.role02")}
              direction={t("member.direction02")}
              headerClassName="left-[66.142%] top-[5.573%] w-[24.85%]"
              dividerClassName="left-[67.491%] top-[10.611%]"
              nameClassName="left-[68.614%] top-[13.183%] w-[24.85%]"
              directionClassName="left-[70.187%] top-[17.578%] w-[24.85%]"
              actionsClassName="left-[71.985%] top-[23.902%]"
            />
            <MemberProfile
              identifier="03"
              name="Sheep"
              role={t("member.role03")}
              direction={t("member.direction03")}
              headerClassName="left-[28.367%] top-[39.228%] w-[19.69%]"
              dividerClassName="left-[28.367%] top-[44.266%]"
              nameClassName="left-[28.367%] top-[46.838%] w-[19.69%]"
              directionClassName="left-[28.367%] top-[51.232%] w-[19.69%]"
              actionsClassName="left-[28.367%] top-[58.306%]"
            />
            <MemberProfile
              identifier="04"
              name="Joe"
              role={t("member.role04")}
              direction={t("member.direction04")}
              headerClassName="left-[68.263%] top-[39.228%] w-[24.85%]"
              dividerClassName="left-[67.514%] top-[44.266%]"
              nameClassName="left-[67.065%] top-[46.838%] w-[24.85%]"
              directionClassName="left-[66.167%] top-[51.661%] w-[24.85%]"
              actionsClassName="left-[64.97%] top-[58.306%]"
            />
            <div className="absolute left-[35.3%] top-[16.3%] h-[3.54%] w-[8.69%]">
              <Image
                src="/archive/member-record-grava.svg"
                alt=""
                fill
                sizes="8.69vw"
              />
            </div>
            <div className="absolute left-[52.5%] top-[40.6%] h-[3%] w-[2.32%]">
              <Image
                src="/archive/member-record-logo.svg"
                alt=""
                fill
                sizes="2.32vw"
              />
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
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
}: MemberProfileProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef({ frame: 0 });
  const reducedMotion = useReducedMotion();
  const { t } = useLocale();

  // hover 白底沿用入场的斑块溶解：进入时逐帧翻页遮罩显现，离开时倒放。
  const animateFill = (entering: boolean) => {
    const fill = fillRef.current;
    if (!fill) return;
    const sprite = getDissolveSprite();
    if (reducedMotion || !sprite) {
      fill.style.opacity = entering ? "1" : "0";
      clearElementMask(fill);
      return;
    }
    const proxy = proxyRef.current;
    gsap.killTweensOf(proxy);
    fill.style.opacity = "1";
    gsap.to(proxy, {
      frame: entering ? sprite.frameCount - 1 : 0,
      duration: MEMBER_RECORD_HOVER_REVEAL_DURATION,
      ease: "none",
      onUpdate: () => {
        setSpriteMaskFrame(fill, sprite, Math.round(proxy.frame));
      },
      onComplete: () => {
        if (entering) {
          clearElementMask(fill);
        } else {
          fill.style.opacity = "0";
          clearElementMask(fill);
        }
      },
    });
  };

  return (
    <div
      className="group pointer-events-none absolute inset-0"
      onMouseEnter={() => animateFill(true)}
      onMouseLeave={() => animateFill(false)}
    >
      <div
        ref={fillRef}
        aria-hidden="true"
        className="absolute inset-0 opacity-0"
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
        className={`absolute z-10 text-16 text-white transition-colors duration-[600ms] group-hover:text-grey-400 ${headerClassName}`}
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
        className={`absolute z-10 border-t border-dashed border-white/30 transition-colors duration-[600ms] group-hover:border-grey-400/30 ${dividerClassName}`}
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
        className={`absolute z-10 whitespace-nowrap text-16 text-white transition-colors duration-[600ms] group-hover:text-grey-400 ${nameClassName}`}
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
        className={`absolute z-10 whitespace-nowrap font-serif-sc text-16 font-normal text-white transition-colors duration-[600ms] group-hover:text-grey-400 ${directionClassName}`}
      >
        <SplitWords text={direction} />
      </p>
      <div
        data-sd-words
        data-sd-delay="0.5"
        className={`absolute z-10 flex items-center gap-4 text-white transition-colors duration-[600ms] group-hover:text-grey-400 ${actionsClassName}`}
      >
        <ProfileAction label={t("member.portfolio")} />
        <ProfileAction label={t("member.contactMe")} />
      </div>
    </div>
  );
}

function ProfileAction({ label }: { label: string }) {
  return (
    <span className="profile-action pointer-events-auto flex items-center gap-0.5 font-serif-sc text-16 font-normal">
      <SplitWords text={label} />
      <span aria-hidden="true" className="relative block size-4 overflow-hidden">
        <Image
          src="/archive/member-record-external-arrow.png"
          alt=""
          fill
          sizes="16px"
          className="profile-action-arrow profile-action-arrow-current object-contain group-hover:invert"
        />
        <Image
          src="/archive/member-record-external-arrow.png"
          alt=""
          fill
          sizes="16px"
          className="profile-action-arrow profile-action-arrow-next object-contain group-hover:invert motion-reduce:hidden"
        />
      </span>
    </span>
  );
}
