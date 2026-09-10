"use client";

import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";

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
};

/**
 * Figma 926:2358（390×844）：第四屏移动端第一阶段。
 * 390×844 仅作为横向坐标与银色边框锚点基准；网格正文使用实际
 * 动态视口高度，在短屏上压缩纵向间距，不缩放文字和交互元素。
 */
export function MemberRecordMobile() {
  const { t } = useLocale();

  return (
    <div className="absolute inset-0 z-10 md:hidden">
      <div
        data-member-grid
        className="pointer-events-none absolute inset-x-[7.949%] bottom-[env(safe-area-inset-bottom)] top-[max(calc(env(safe-area-inset-top)+52px),24.872vw,11.493dvh)] *:opacity-0"
      >
        <div
          data-member-overlay
          aria-hidden="true"
            className="absolute inset-0 rounded-t-rl-32 rounded-b-none backdrop-blur-[4px]"
        />
        <div
          data-member-mask
          className="absolute inset-0 overflow-hidden rounded-t-rl-32 rounded-b-none"
        >
          <Image
            src="/archive/member-record-grid-mobile.svg"
            alt=""
            fill
            sizes="84.87vw"
            unoptimized
            className="h-full w-full object-fill [clip-path:inset(1px)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-t-rl-32 rounded-b-none border border-white"
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
}: MobileMemberProfileProps) {
  const { t } = useLocale();

  return (
    <div className="group pointer-events-none absolute inset-0 font-serif-sc text-12 font-normal leading-[18px] text-white">
      <button
        type="button"
        aria-label={`${name} ${t("member.investigator")}`}
        className={`pointer-events-auto absolute bg-transparent focus-visible:ring-2 focus-visible:ring-green-500 ${fillClassName}`}
      />
      <p
        className={`absolute z-10 whitespace-nowrap ${headerClassName}`}
      >
        {t("member.investigator")}
        <span className="font-bodoni">_{identifier}_</span>
        {role}
      </p>
      <span
        className={`absolute z-10 border-t border-dashed border-white/30 ${dividerClassName}`}
        aria-hidden="true"
      >
        <span className="invisible whitespace-nowrap">
          {t("member.investigator")}
          <span className="font-bodoni">_{identifier}_</span>
          {role}
        </span>
      </span>
      <p
        className={`absolute z-10 whitespace-nowrap ${nameClassName}`}
      >
        {t("member.namePrefix")}
        {name}
      </p>
      <p
        className={`absolute z-10 whitespace-nowrap ${directionClassName}`}
      >
        {direction}
      </p>
      <div
        className={`absolute z-10 flex items-center gap-4 whitespace-nowrap ${actionsClassName}`}
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
          src="/archive/member-record-external-arrow.webp"
          alt=""
          fill
          sizes="16px"
          className="profile-action-arrow profile-action-arrow-current object-contain"
        />
        <Image
          src="/archive/member-record-external-arrow.webp"
          alt=""
          fill
          sizes="16px"
          className="profile-action-arrow profile-action-arrow-next object-contain motion-reduce:hidden"
        />
      </span>
    </span>
  );
}
