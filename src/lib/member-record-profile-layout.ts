import { MEMBER_PROFILE_ACTIONS_VISIBLE } from "@/lib/member-record-cells";

export type MemberTextLayout = {
  headerClassName: string;
  dividerClassName: string;
  nameClassName: string;
  directionClassName: string;
  actionsClassName: string;
};

/**
 * 文字块垂直中线对齐格子在文字横向范围内的中线（1335×933）。
 * 块高 = 姓名距标题 7.32% + 方向距姓名 su×39 + 方向行高 su-hero×24，
 * 各行 top 扣掉块高的一半。类名写全，供 Tailwind 扫描。
 * 中线：01 16.91% / 02 16.60% / 03 54.82%（再上移 su×20）/ 04 49.77%。
 * 桌面端中英文共用。横向仍贴各格斜边，纵向按格子中线居中。
 */
export const MEMBER_TEXT_LAYOUT: Record<
  "01" | "02" | "03" | "04",
  MemberTextLayout
> = {
  "01": {
    headerClassName:
      "left-[2.547%] top-[calc(13.250%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    dividerClassName:
      "left-[2.547%] top-[calc(17.998%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    nameClassName:
      "left-[2.547%] top-[calc(20.570%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    directionClassName:
      "left-[2.547%] top-[calc(20.570%_-_(var(--su)*39_+_var(--su-hero)*24)/2_+_var(--su)*39)] w-[24.85%]",
    actionsClassName:
      "left-[2.547%] top-[calc(28.363%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
  },
  "02": {
    headerClassName:
      "left-[68.165%] top-[calc(12.940%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    dividerClassName:
      "left-[68.789%] top-[calc(17.688%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    nameClassName:
      "left-[70.112%] top-[calc(20.260%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    directionClassName:
      "left-[70.936%] top-[calc(20.260%_-_(var(--su)*39_+_var(--su-hero)*24)/2_+_var(--su)*39)] w-[27.79%]",
    actionsClassName:
      "left-[71.985%] top-[calc(28.053%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
  },
  "03": {
    headerClassName:
      "left-[28.443%] top-[calc(51.160%_-_(var(--su)*39_+_var(--su-hero)*24)/2_-_var(--su)*20)]",
    dividerClassName:
      "left-[28.443%] top-[calc(55.908%_-_(var(--su)*39_+_var(--su-hero)*24)/2_-_var(--su)*20)]",
    nameClassName:
      "left-[28.443%] top-[calc(58.480%_-_(var(--su)*39_+_var(--su-hero)*24)/2_-_var(--su)*20)]",
    directionClassName:
      "left-[28.443%] top-[calc(58.480%_-_(var(--su)*39_+_var(--su-hero)*24)/2_+_var(--su)*39_-_var(--su)*20)] w-[22.772%]",
    actionsClassName:
      "left-[28.367%] top-[calc(69.059%_-_(var(--su)*39_+_var(--su-hero)*24)/2_-_var(--su)*20)]",
  },
  "04": {
    headerClassName:
      "left-[69.312%] top-[calc(46.110%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    dividerClassName:
      "left-[68.713%] top-[calc(50.858%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    nameClassName:
      "left-[68.039%] top-[calc(53.430%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
    directionClassName:
      "left-[67.116%] top-[calc(53.430%_-_(var(--su)*39_+_var(--su-hero)*24)/2_+_var(--su)*39)] w-[31.61%]",
    actionsClassName:
      "left-[64.97%] top-[calc(64.009%_-_(var(--su)*39_+_var(--su-hero)*24)/2)]",
  },
};

/** 两项打开用原位置，关闭用 Figma 1203 新位置 */
export function memberTextLayout(
  open: MemberTextLayout,
  closed: MemberTextLayout,
): MemberTextLayout {
  return MEMBER_PROFILE_ACTIONS_VISIBLE ? open : closed;
}
