"use client";

import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { MEMBER_PROFILE_ACTIONS_VISIBLE } from "@/lib/member-record-cells";

type MobileMemberProfileProps = {
  identifier: string;
  name: string;
  role: string;
  direction: string;
  /** 文字块中线，取格子在 331×747 网格里的垂直中心，随格子拉伸 */
  center: string;
  left: string;
  /** 右缘停在白线内侧，英文在此宽度内折行 */
  right: string;
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
            center="17.47%"
            left="4.834%"
            right="calc(18.7% + 16px)"
            fillClassName="left-[0.604%] top-[0.268%] h-[34.404%] w-[76.888%]"
          />
          <MobileMemberProfile
            identifier="02"
            name="Sheep"
            role={t("member.role02")}
            direction={t("member.direction02")}
            center="41.132%"
            left="4.834%"
            right="calc(13.2% + 16px)"
            fillClassName="left-[0.604%] top-[26.506%] h-[29.251%] w-[101.662%]"
          />
          <MobileMemberProfile
            identifier="03"
            name="Joe"
            role={t("member.role03")}
            direction={t("member.direction03")}
            center="66.131%"
            left="27.493%"
            right="calc(0.6% + 16px)"
            fillClassName="left-[17.825%] top-[52.878%] h-[26.506%] w-[81.571%]"
          />
          <MobileMemberProfile
            identifier="04"
            name="Pineapple"
            role={t("member.role04")}
            direction={t("member.direction04")}
            center="88.454%"
            left="4.834%"
            right="calc(0.6% + 16px)"
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
  center,
  left,
  right,
  fillClassName,
}: MobileMemberProfileProps) {
  const { locale, t } = useLocale();
  const separator = locale === "en" ? " _ " : "_";
  const idLabel = `${separator}${identifier}${separator}`;
  const header = `${t("member.investigator")}${idLabel}${role}`;
  // 整块中线对齐格子。行距沿用原稿：标题到虚线 4.418%，虚线到姓名 2.142%，姓名到方向 3.882%（相对网格高度）。
  const anchor = `calc(${center} - (10.442% + 18px) / 2)`;

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
      <p className="absolute z-10 whitespace-nowrap" style={{ top: anchor, left }}>
        {header}
      </p>
      <span
        className="absolute z-10 border-t border-dashed border-white/30"
        style={{ top: `calc(${anchor} + 4.418%)`, left }}
        aria-hidden="true"
      >
        <span className="invisible whitespace-nowrap">{header}</span>
      </span>
      <p className="absolute z-10 whitespace-nowrap" style={{ top: `calc(${anchor} + 6.56%)`, left }}>
        {t("member.namePrefix")}
        {name}
      </p>
      <p
        className={`absolute z-10 ${
          locale === "en" ? "whitespace-pre-line" : "whitespace-nowrap"
        }`}
        style={{
          top: `calc(${anchor} + 10.442%)`,
          left,
          maxWidth: `calc(100% - ${left} - ${right})`,
        }}
      >
        {direction}
      </p>
      <div
        className={`absolute z-10 flex items-center gap-4 whitespace-nowrap ${MEMBER_PROFILE_ACTIONS_VISIBLE ? "" : "hidden"}`}
        style={{ top: `calc(${anchor} + 14.324%)`, left }}
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
