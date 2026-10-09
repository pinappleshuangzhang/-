import { MEMBER_PROFILE_ACTIONS_VISIBLE } from "@/lib/member-record-cells";

export type MemberTextLayout = {
  headerClassName: string;
  dividerClassName: string;
  nameClassName: string;
  directionClassName: string;
  actionsClassName: string;
};

/** 英文版位置（Figma 1406:784），调查方向按限宽自然折行 */
export const MEMBER_TEXT_LAYOUT_EN: Record<
  "01" | "02" | "03" | "04",
  MemberTextLayout
> = {
  "01": {
    headerClassName: "left-[2.547%] top-[9.861%]",
    dividerClassName: "left-[2.547%] top-[14.609%]",
    nameClassName: "left-[2.547%] top-[17.181%]",
    directionClassName:
      "left-[2.547%] top-[calc(17.181%_+_var(--su)*39)] w-[24.85%]",
    actionsClassName: "left-[2.547%] top-[23.902%]",
  },
  "02": {
    headerClassName: "left-[68.165%] top-[9.861%]",
    dividerClassName: "left-[68.789%] top-[14.609%]",
    nameClassName: "left-[70.112%] top-[17.181%]",
    directionClassName:
      "left-[70.936%] top-[calc(17.181%_+_var(--su)*39)] w-[27.79%]",
    actionsClassName: "left-[71.985%] top-[23.902%]",
  },
  "03": {
    headerClassName: "left-[28.443%] top-[41.479%]",
    dividerClassName: "left-[28.443%] top-[46.227%]",
    nameClassName: "left-[28.443%] top-[48.799%]",
    directionClassName:
      "left-[28.443%] top-[calc(48.799%_+_var(--su)*39)] w-[22.772%]",
    actionsClassName: "left-[28.367%] top-[58.306%]",
  },
  "04": {
    headerClassName: "left-[69.312%] top-[41.479%]",
    dividerClassName: "left-[68.713%] top-[46.227%]",
    nameClassName: "left-[68.039%] top-[48.799%]",
    directionClassName:
      "left-[67.116%] top-[calc(48.799%_+_var(--su)*39)] w-[31.61%]",
    actionsClassName: "left-[64.97%] top-[58.306%]",
  },
};

/** 两项打开用原位置，关闭用 Figma 1203 新位置 */
export function memberTextLayout(
  open: MemberTextLayout,
  closed: MemberTextLayout,
): MemberTextLayout {
  return MEMBER_PROFILE_ACTIONS_VISIBLE ? open : closed;
}
