"use client";

import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { MEMBER_PROFILE_ACTIONS_VISIBLE } from "@/lib/member-record-cells";
import { memberTextLayout } from "@/lib/member-record-profile-layout";

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
            name="South"
            role={t("member.role01")}
            direction={t("member.direction01")}
            {...memberTextLayout(
              {
                headerClassName: "left-[4.834%] top-[calc(12.249%-46px)]",
                dividerClassName: "left-[4.834%] top-[calc(16.667%-46px)]",
                nameClassName: "left-[4.834%] top-[calc(18.809%-46px)]",
                directionClassName: "left-[4.834%] top-[calc(22.691%-46px)]",
                actionsClassName: "left-[4.834%] top-[21.82%]",
              },
              {
                headerClassName: "left-[4.834%] top-[calc(12.249%-46px)]",
                dividerClassName: "left-[4.834%] top-[calc(16.667%-46px)]",
                nameClassName: "left-[4.834%] top-[calc(18.809%-46px)]",
                directionClassName: "left-[4.834%] top-[calc(22.691%-46px)]",
                actionsClassName: "left-[4.834%] top-[21.82%]",
              },
            )}
            fillClassName="left-[0.604%] top-[0.268%] h-[34.404%] w-[76.888%]"
          />
          <MobileMemberProfile
            identifier="02"
            name="Sheep"
            role={t("member.role02")}
            direction={t("member.direction02")}
            {...memberTextLayout(
              {
                headerClassName: "left-[4.834%] top-[calc(35.911%-18px)]",
                dividerClassName: "left-[4.834%] top-[calc(40.329%-18px)]",
                nameClassName: "left-[4.834%] top-[calc(42.471%-18px)]",
                directionClassName: "left-[4.834%] top-[calc(46.353%-18px)]",
                actionsClassName: "left-[4.834%] top-[47.523%]",
              },
              {
                headerClassName: "left-[4.834%] top-[calc(35.911%-18px)]",
                dividerClassName: "left-[4.834%] top-[calc(40.329%-18px)]",
                nameClassName: "left-[4.834%] top-[calc(42.471%-18px)]",
                directionClassName: "left-[4.834%] top-[calc(46.353%-18px)]",
                actionsClassName: "left-[4.834%] top-[47.523%]",
              },
            )}
            fillClassName="left-[0.604%] top-[26.506%] h-[29.251%] w-[101.662%]"
          />
          <MobileMemberProfile
            identifier="03"
            name="Joe"
            role={t("member.role03")}
            direction={t("member.direction03")}
            {...memberTextLayout(
              {
                headerClassName: "left-[27.493%] top-[calc(60.91%-11px)]",
                dividerClassName: "left-[27.493%] top-[calc(65.328%-11px)]",
                nameClassName: "left-[27.493%] top-[calc(67.47%-11px)]",
                directionClassName: "left-[27.493%] top-[calc(71.352%-11px)]",
                actionsClassName: "left-[27.493%] top-[73.226%]",
              },
              {
                headerClassName: "left-[27.493%] top-[calc(60.91%-11px)]",
                dividerClassName: "left-[27.493%] top-[calc(65.328%-11px)]",
                nameClassName: "left-[27.493%] top-[calc(67.47%-11px)]",
                directionClassName: "left-[27.493%] top-[calc(71.352%-11px)]",
                actionsClassName: "left-[27.493%] top-[73.226%]",
              },
            )}
            fillClassName="left-[17.825%] top-[52.878%] h-[26.506%] w-[81.571%]"
          />
          <MobileMemberProfile
            identifier="04"
            name="Pineapple"
            role={t("member.role04")}
            direction={t("member.direction04")}
            {...memberTextLayout(
              {
                headerClassName: "left-[4.834%] top-[calc(83.233%-18px)]",
                dividerClassName: "left-[4.834%] top-[calc(87.651%-18px)]",
                nameClassName: "left-[4.834%] top-[calc(89.793%-18px)]",
                directionClassName: "left-[4.834%] top-[calc(93.675%-18px)]",
                actionsClassName: "left-[4.834%] top-[95.85%]",
              },
              {
                headerClassName: "left-[4.834%] top-[calc(83.233%-18px)]",
                dividerClassName: "left-[4.834%] top-[calc(87.651%-18px)]",
                nameClassName: "left-[4.834%] top-[calc(89.793%-18px)]",
                directionClassName: "left-[4.834%] top-[calc(93.675%-18px)]",
                actionsClassName: "left-[4.834%] top-[95.85%]",
              },
            )}
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
  const { locale, t } = useLocale();
  const separator = locale === "en" ? " _ " : "_";
  const idLabel = `${separator}${identifier}${separator}`;
  // 调查方向右缘距格子白线 16px：01/02 按斜边在该行的位置，03/04 按右边框。
  const enDirectionRight =
    identifier === "01"
      ? "right-[calc(18.7%+16px)]"
      : identifier === "02"
        ? "right-[calc(13.2%+16px)]"
        : "right-[calc(0.6%+16px)]";
  const enDirectionWrap =
    identifier === "04" ? "whitespace-pre-line" : "";

  return (
    <div
      className={`group pointer-events-none absolute inset-0 font-serif-sc text-12 leading-[18px] text-white ${
        locale === "en" ? "font-normal" : "font-light"
      }`}
    >
      <button
        type="button"
        aria-label={`${name} ${t("member.investigator")}`}
        className={`pointer-events-auto absolute bg-transparent focus-visible:ring-2 focus-visible:ring-grey-300 ${fillClassName}`}
      />
      <p
        className={`absolute z-10 whitespace-nowrap ${headerClassName}`}
      >
        {t("member.investigator")}
        <span>{idLabel}</span>
        {role}
      </p>
      <span
        className={`absolute z-10 border-t border-dashed border-white/30 ${dividerClassName}`}
        aria-hidden="true"
      >
        <span className="invisible whitespace-nowrap">
          {t("member.investigator")}
          <span>{idLabel}</span>
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
        className={`absolute z-10 ${
          locale === "en"
            ? `${enDirectionRight} ${enDirectionWrap}`
            : "whitespace-nowrap"
        } ${directionClassName}`}
      >
        {direction}
      </p>
      <div
        className={`absolute z-10 flex items-center gap-4 whitespace-nowrap ${actionsClassName} ${MEMBER_PROFILE_ACTIONS_VISIBLE ? "" : "hidden"}`}
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
