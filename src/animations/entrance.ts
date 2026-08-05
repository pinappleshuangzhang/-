/**
 * 全站统一的文字 / 图标入场动效（参考 museosansevero.it）：
 * 元素从「透明、下移 20px、旋转 5°」的姿态转正浮现，expo.out 缓动。
 */

/** 入场前的隐藏姿态 */
export const ENTRANCE_HIDDEN = {
  autoAlpha: 0,
  y: 20,
  rotate: 5,
  transformOrigin: "50% 50%",
} as const;

/** 入场后的最终姿态 */
export const ENTRANCE_VISIBLE = {
  autoAlpha: 1,
  y: 0,
  rotate: 0,
} as const;

/** 入场补间参数 */
export const ENTRANCE_TWEEN = {
  duration: 1,
  ease: "expo.out",
} as const;

/** 多元素依次入场的间隔（秒） */
export const ENTRANCE_STAGGER = 0.07;
