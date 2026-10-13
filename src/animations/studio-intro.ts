import gsap from "gsap";

/**
 * 工作室简介屏（图一/图二）的动画参数与旋转 ticker。
 * - 圆环旋转沿用第五屏 viscose 长廊的写法：gsap.ticker 累计角度，
 *   layer-03 顺时针、layer-04 逆时针；失活即移除 ticker 停帧。
 * - 卡片 3D 翻入常量取自联系弹窗的信封动画（contact-dialog.tsx），
 *   方向改为自下而上。
 */

/** step0 → step1 的整体放大倍率（以视口中心为原点），可按观感调整 */
export const STAGE_ZOOM_SCALE = 1.6;
/** 放大：由慢到快（与圆环淡出同在 3.2s 收尾，保持同步结束） */
export const ZOOM_IN = { duration: 3.2, ease: "power2.in" } as const;
/** 回缩：由快到慢 */
export const ZOOM_OUT = { duration: 1.0, ease: "power2.out" } as const;

/** 圆环角速度（度/秒） */
const SPIN_DEG_PER_SEC = 6;

/** 卡片隐藏态：位于下方并向后翻折（信封动画的下行镜像） */
export const CARD_HIDDEN = {
  autoAlpha: 0,
  yPercent: 55,
  y: 0,
  z: -220,
  rotationY: 80,
  rotationX: -16,
  scale: 0.86,
};

/** 卡片入场终态 */
export const CARD_SHOWN = {
  autoAlpha: 1,
  yPercent: 0,
  y: 0,
  z: 0,
  rotationY: 0,
  rotationX: 0,
  scale: 1,
};

export type SpinLayer = {
  el: HTMLElement;
  /** 1 顺时针，-1 逆时针 */
  dir: 1 | -1;
};

/**
 * 启动圆环持续旋转，返回停止函数。
 * paused() 返回 true 时跳过写入（图二态舞台隐藏，无需继续写样式）。
 */
export function startLayerSpin(
  layers: SpinLayer[],
  paused: () => boolean,
): () => void {
  const spins = layers.map((layer) => ({ ...layer, angle: 0 }));
  for (const spin of spins) {
    gsap.set(spin.el, { transformOrigin: "50% 50%", rotation: 0 });
  }
  const tick = (_time: number, deltaMs: number) => {
    if (paused()) return;
    const step = (deltaMs / 1000) * SPIN_DEG_PER_SEC;
    for (const spin of spins) {
      spin.angle = (spin.angle + step * spin.dir) % 360;
      gsap.set(spin.el, { rotation: spin.angle });
    }
  };
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
  };
}
