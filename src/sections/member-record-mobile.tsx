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
 * 第四屏移动端。银色边框在 member-record-mobile.webp（951×2048）里，
 * 背景用 object-contain object-top，短视口整幅落进屏幕，底部不再被裁掉。
 * 网格盒用同一套容纳盒，不跟安全区走。
 * 内沿取自图内暗槽：左 70、右 879、顶 232，底到图底。
 * 圆角用网格 viewBox 的 36：横半径相对宽、竖半径相对高，
 * 等比缩放后仍是正圆，和金属内沿贴合。
 */
const FRAME_CORNER = {
  borderRadius:
    "calc(100% * 36 / 331) calc(100% * 36 / 331) 0 0 / calc(100% * 36 / 747) calc(100% * 36 / 747) 0 0",
} as const;

export function MemberRecordMobile() {
  const { t } = useLocale();

  return (
    <div className="absolute inset-0 z-10 md:hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 aspect-[951/2048] w-[min(100%,calc(100dvh*951/2048))] -translate-x-1/2">
        <div
          data-member-grid
          className="absolute *:opacity-0"
          style={{
            left: "calc(100% * 70 / 951)",
            top: "calc(100% * 232 / 2048)",
            width: "calc(100% * 809 / 951)",
            height: "calc(100% * 1816 / 2048)",
          }}
        >
          <div
            data-member-overlay
            aria-hidden="true"
            className="absolute inset-0 backdrop-blur-[4px]"
            style={FRAME_CORNER}
          />
          <div
            data-member-mask
            className="absolute inset-0 overflow-hidden"
            style={FRAME_CORNER}
          >
            <Image
              src="/archive/member-record-grid-mobile.svg"
              alt=""
              fill
              sizes="85vw"
              unoptimized
              className="h-full w-full object-fill"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 border border-white"
              style={FRAME_CORNER}
            />
            <MobileMemberProfile
              identifier="01"
              name={t("member.name01")}
              role={t("member.role01")}
              direction={t("member.direction01")}
              center="calc(17.47% - 100% * 20 / 747)"
              left="4.834%"
              right="calc(18.7% + 16px)"
              fillClassName="left-[0.604%] top-[0.268%] h-[34.404%] w-[76.888%]"
            />
            <MobileMemberProfile
              identifier="02"
              name={t("member.name02")}
              role={t("member.role02")}
              direction={t("member.direction02")}
              center="41.132%"
              left="4.834%"
              right="calc(13.2% + 16px)"
              fillClassName="left-[0.604%] top-[26.506%] h-[29.251%] w-[101.662%]"
            />
            <MobileMemberProfile
              identifier="03"
              name={t("member.name03")}
              role={t("member.role03")}
              direction={t("member.direction03")}
              center="66.131%"
              left="27.493%"
              right="calc(0.6% + 16px)"
              fillClassName="left-[17.825%] top-[52.878%] h-[26.506%] w-[81.571%]"
            />
            <MobileMemberProfile
              identifier="04"
              name={t("member.name04")}
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
