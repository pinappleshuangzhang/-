import { CURTAIN_DURATION_MS } from "@/lib/ascii-curtain";

export const MEMBER_RECORD_GRID_HIDDEN = { opacity: 0 };

/** 大图停留时长，之后浮层整体入场 */
export const MEMBER_RECORD_REVEAL_DELAY = 1.5;

/** 入场时长与切屏幕布单程一致 */
export const MEMBER_RECORD_REVEAL_DURATION = CURTAIN_DURATION_MS / 1000;

/**
 * 溶解遮罩的网格与帧数：格子约 5×8px（对应 1335×933 的浮层坐标系）。
 */
export const MEMBER_RECORD_MASK_COLS = 267;
export const MEMBER_RECORD_MASK_ROWS = 117;
export const MEMBER_RECORD_MASK_FRAME_COUNT = 24;

/** 遮罩生成失败时的兜底淡入 */
export const MEMBER_RECORD_GRID_VISIBLE = {
  opacity: 1,
  delay: MEMBER_RECORD_REVEAL_DELAY,
  duration: MEMBER_RECORD_REVEAL_DURATION,
  ease: "power2.out",
};
