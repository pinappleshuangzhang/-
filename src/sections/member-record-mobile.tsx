"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  MEMBER_RECORD_HOVER_REVEAL_DURATION,
  MEMBER_RECORD_MASK_FRAME_COUNT,
} from "@/animations/member-record-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  clearElementMask,
  createDissolveMaskSprite,
  setSpriteMaskFrame,
  type DissolveMaskSprite,
} from "@/lib/dissolve-mask";

const MOBILE_MASK_COLS = 66;
const MOBILE_MASK_ROWS = 149;

let mobileDissolveSprite: DissolveMaskSprite | null = null;

function getMobileDissolveSprite(): DissolveMaskSprite | null {
  mobileDissolveSprite ??= createDissolveMaskSprite(
    MOBILE_MASK_COLS,
    MOBILE_MASK_ROWS,
    MEMBER_RECORD_MASK_FRAME_COUNT,
  );
  return mobileDissolveSprite;
}

type MobileMemberProfileProps = {
  identifier: string;
  name: string;
  role: string;
  direction: string;
  headerClassName: string;
  dividerClassName: string;
  nameClassName: string;
  directionClassName: string;
  actionsClassName: string;
  fillClassName: string;
  fillSrc: string;
};

/**
 * Figma 926:2358（390×844）：第四屏移动端第一阶段。
 * 网格以 331×747 设计坐标贴住视口底部，四组成员信息按纵向卡片重排。
 */
export function MemberRecordMobile() {
  const { t } = useLocale();

  return (
    <div className="absolute inset-0 z-10 md:hidden">
      <div
        data-member-grid
        className="pointer-events-none absolute inset-x-[7.436%] bottom-0 top-[11.493%] *:opacity-0"
      >
        <div
          data-member-overlay
          aria-hidden="true"
          className="absolute inset-0 rounded-t-rl-32 rounded-b-rm-16 bg-[#2B2B2B]/[0.55] backdrop-blur-[4px]"
        />
        <div data-member-mask className="absolute inset-0">
          <Image
            src="/archive/member-record-grid-mobile.webp"
            alt=""
            fill
            sizes="84.87vw"
            className="object-fill"
          />
          <MobileMemberProfile
            identifier="01"
            name="Pineapple"
            role={t("member.role01")}
            direction={t("member.direction01")}
            headerClassName="left-[4.834%] top-[3.748%]"
            dividerClassName="left-[4.834%] top-[8.166%]"
            nameClassName="left-[4.834%] top-[10.308%]"
            directionClassName="left-[4.834%] top-[14.19%]"
            actionsClassName="left-[4.834%] top-[21.82%]"
            fillClassName="left-[0.604%] top-[0.268%] h-[34.404%] w-[76.888%]"
            fillSrc="/archive/member-record-mobile-cell-01.webp"
          />
          <MobileMemberProfile
            identifier="02"
            name="South"
            role={t("member.role02")}
            direction={t("member.direction02")}
            headerClassName="left-[4.834%] top-[32.129%]"
            dividerClassName="left-[4.834%] top-[36.546%]"
            nameClassName="left-[4.834%] top-[38.688%]"
            directionClassName="left-[4.834%] top-[42.57%]"
            actionsClassName="left-[4.834%] top-[47.523%]"
            fillClassName="left-[0.604%] top-[26.506%] h-[29.251%] w-[101.662%]"
            fillSrc="/archive/member-record-mobile-cell-02.webp"
          />
          <MobileMemberProfile
            identifier="03"
            name="Sheep"
            role={t("member.role03")}
            direction={t("member.direction03")}
            headerClassName="left-[27.493%] top-[57.831%]"
            dividerClassName="left-[27.493%] top-[62.249%]"
            nameClassName="left-[27.493%] top-[64.391%]"
            directionClassName="left-[27.493%] top-[68.273%]"
            actionsClassName="left-[27.493%] top-[73.226%]"
            fillClassName="left-[17.825%] top-[52.878%] h-[26.506%] w-[81.571%]"
            fillSrc="/archive/member-record-mobile-cell-03.webp"
          />
          <MobileMemberProfile
            identifier="04"
            name="Joe"
            role={t("member.role04")}
            direction={t("member.direction04")}
            headerClassName="left-[4.834%] top-[80.455%]"
            dividerClassName="left-[4.834%] top-[84.873%]"
            nameClassName="left-[4.834%] top-[87.015%]"
            directionClassName="left-[4.834%] top-[90.897%]"
            actionsClassName="left-[4.834%] top-[95.85%]"
            fillClassName="left-[0.302%] top-[77.175%] h-[22.557%] w-[99.094%]"
            fillSrc="/archive/member-record-mobile-cell-04.webp"
          />
        </div>
      </div>
    </div>
  );
}

function MobileMemberProfile({
  identifier,
  name,
  role,
  direction,
  headerClassName,
  dividerClassName,
  nameClassName,
  directionClassName,
  actionsClassName,
  fillClassName,
  fillSrc,
}: MobileMemberProfileProps) {
  const { t } = useLocale();
  const reducedMotion = useReducedMotion();
  const fillRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef({ frame: 0 });
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);

  const animateFill = (entering: boolean) => {
    const fill = fillRef.current;
    if (!fill) return;
    const sprite = getMobileDissolveSprite();

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

  const handleMouseEnter = () => {
    hoveredRef.current = true;
    animateFill(true);
  };

  const handleMouseLeave = () => {
    hoveredRef.current = false;
    if (!focusedRef.current) animateFill(false);
  };

  const handleFocus = () => {
    focusedRef.current = true;
    animateFill(true);
  };

  const handleBlur = () => {
    focusedRef.current = false;
    if (!hoveredRef.current) animateFill(false);
  };

  return (
    <div
      className="group pointer-events-none absolute inset-0 font-serif-sc text-12 font-normal leading-[18px] text-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        ref={fillRef}
        aria-hidden="true"
        className={`absolute opacity-0 ${fillClassName}`}
      >
        <Image
          src={fillSrc}
          alt=""
          fill
          sizes="86vw"
          className="object-fill brightness-0 invert"
        />
      </div>
      <button
        type="button"
        aria-label={`${name} ${t("member.investigator")}`}
        className={`pointer-events-auto absolute bg-transparent focus-visible:ring-2 focus-visible:ring-green-500 ${fillClassName}`}
      />
      <p
        className={`absolute z-10 whitespace-nowrap transition-colors duration-[600ms] group-hover:text-grey-400 group-focus-within:text-grey-400 ${headerClassName}`}
      >
        {t("member.investigator")}
        <span className="font-bodoni">_{identifier}_</span>
        {role}
      </p>
      <span
        className={`absolute z-10 border-t border-dashed border-white/30 transition-colors duration-[600ms] group-hover:border-grey-400/30 group-focus-within:border-grey-400/30 ${dividerClassName}`}
        aria-hidden="true"
      >
        <span className="invisible whitespace-nowrap">
          {t("member.investigator")}
          <span className="font-bodoni">_{identifier}_</span>
          {role}
        </span>
      </span>
      <p
        className={`absolute z-10 whitespace-nowrap transition-colors duration-[600ms] group-hover:text-grey-400 group-focus-within:text-grey-400 ${nameClassName}`}
      >
        {t("member.namePrefix")}
        {name}
      </p>
      <p
        className={`absolute z-10 whitespace-nowrap transition-colors duration-[600ms] group-hover:text-grey-400 group-focus-within:text-grey-400 ${directionClassName}`}
      >
        {direction}
      </p>
      <div
        className={`absolute z-10 flex items-center gap-4 whitespace-nowrap transition-colors duration-[600ms] group-hover:text-grey-400 group-focus-within:text-grey-400 ${actionsClassName}`}
      >
        <MobileProfileAction label={t("member.portfolio")} />
        <MobileProfileAction label={t("member.contactMe")} />
      </div>
    </div>
  );
}

function MobileProfileAction({ label }: { label: string }) {
  return (
    <span className="profile-action pointer-events-auto flex items-center gap-0.5">
      {label}
      <span aria-hidden="true" className="relative block size-4 overflow-hidden">
        <Image
          src="/archive/member-record-external-arrow.png"
          alt=""
          fill
          sizes="16px"
          className="profile-action-arrow profile-action-arrow-current object-contain group-hover:invert group-focus-within:invert"
        />
        <Image
          src="/archive/member-record-external-arrow.png"
          alt=""
          fill
          sizes="16px"
          className="profile-action-arrow profile-action-arrow-next object-contain group-hover:invert group-focus-within:invert motion-reduce:hidden"
        />
      </span>
    </span>
  );
}
