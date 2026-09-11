import { MEMBER_PROFILE_ACTIONS_VISIBLE } from "@/lib/member-record-cells";

export type MemberTextLayout = {
  headerClassName: string;
  dividerClassName: string;
  nameClassName: string;
  directionClassName: string;
  actionsClassName: string;
};

/** 两项打开用原位置，关闭用 Figma 1203 新位置 */
export function memberTextLayout(
  open: MemberTextLayout,
  closed: MemberTextLayout,
): MemberTextLayout {
  return MEMBER_PROFILE_ACTIONS_VISIBLE ? open : closed;
}
