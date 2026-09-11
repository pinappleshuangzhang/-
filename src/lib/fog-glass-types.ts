export type FogController = {
  start(): void;
  pause(): void;
  destroy(): void;
  /** 坐标为相对锚点元素左上角的 CSS 像素 */
  wipeAt(x: number, y: number): void;
  endStroke(): void;
};

export type FogEngineOptions = {
  onReveal?: () => void;
  revealThreshold?: number;
  /**
   * position:fixed 的霜层。脱离 overflow 裁剪祖先后，
   * mask 挖孔才能真正裁掉 backdrop-filter 的模糊输出（Chromium 限制）。
   */
  frostElement: HTMLElement;
  /** 流内格子锚点：每帧读取它的 rect 来同步 fixed 层几何 */
  anchorElement: HTMLElement;
  /**
   * 格子形状（SVG path 及其坐标系内的定位盒），烘进 mask 底图，
   * 圆角与网格线完全一致。不能写成霜层的 clip-path：
   * clip-path + mask + backdrop-filter 同置一元素时 Chromium 会忽略 mask。
   */
  maskShape?: {
    path: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
