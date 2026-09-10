import gsap from "gsap";

const BLOB_GAP = 0.055;

export type DragHintTargets = {
  root: HTMLElement;
  square: HTMLElement;
  label: HTMLElement;
  blobs: HTMLElement[];
};

export type DragHintSpin = {
  spin: number;
};

type Point = {
  x: number;
  y: number;
};

/** 正面卡片的轴对齐包围盒（像素，相对提示层），加 1440 稿等比系数。 */
export type DragHintAnchor = {
  right: number;
  top: number;
  bottom: number;
  scale: number;
};

type Path = {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
};

function cubicPoint(
  t: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

function cubicTangent(
  t: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  const u = 1 - t;
  return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
}

function pointOnPath(path: Path, t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  return {
    x: cubicPoint(clamped, path.p0.x, path.p1.x, path.p2.x, path.p3.x),
    y: cubicPoint(clamped, path.p0.y, path.p1.y, path.p2.y, path.p3.y),
  };
}

function tangentAngle(path: Path, t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const dx = cubicTangent(clamped, path.p0.x, path.p1.x, path.p2.x, path.p3.x);
  const dy = cubicTangent(clamped, path.p0.y, path.p1.y, path.p2.y, path.p3.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * 从卡片上方起步，先向右越过卡片右边线再下落，终点落在卡片右侧中段。
 * 控制点全部压在右边线之外，曲线穿过卡片顶边高度时已在右侧安全区，
 * 因此无论换入的卡片怎么转，方块和拖尾都不会盖到图片。
 */
function arcAroundCard(anchor: DragHintAnchor): Path {
  const su = anchor.scale;
  const cardH = Math.max(1, anchor.bottom - anchor.top);
  const startY = anchor.top - 120 * su;
  return {
    p0: { x: anchor.right - 110 * su, y: startY },
    p1: { x: anchor.right + 60 * su, y: startY },
    p2: { x: anchor.right + 100 * su, y: anchor.top - 40 * su },
    p3: { x: anchor.right + 90 * su, y: anchor.top + cardH * 0.45 },
  };
}

/**
 * 第三阶段一次性拖拽提示：方块从右上起点沿弧线自上向下滑动，
 * 文字保持水平；圆环同步转过一格后回位。
 */
export function playGalleryDragHint({
  targets,
  state,
  anchor,
  slot,
  onFrame,
  onComplete,
}: {
  targets: DragHintTargets;
  state: DragHintSpin;
  anchor: DragHintAnchor;
  slot: number;
  onFrame: () => void;
  onComplete: () => void;
}) {
  const { root, square, label, blobs } = targets;
  const startSpin = state.spin;
  const progress = { t: 0 };
  const path = arcAroundCard(anchor);

  const place = (t: number) => {
    const head = pointOnPath(path, t);
    const rotation = tangentAngle(path, t) + t * 90;
    gsap.set(square, {
      x: head.x,
      y: head.y,
      xPercent: -50,
      yPercent: -50,
      rotation,
      force3D: true,
    });
    gsap.set(label, {
      x: head.x,
      y: head.y,
      xPercent: -50,
      yPercent: -50,
      force3D: true,
    });
    blobs.forEach((blob, index) => {
      const trailT = Math.max(0, t - (index + 1) * BLOB_GAP);
      const point = pointOnPath(path, trailT);
      gsap.set(blob, {
        x: point.x,
        y: point.y,
        xPercent: -50,
        yPercent: -50,
        scale: Math.max(0.22, 0.86 - index * 0.09),
        opacity: t < 0.02 ? 0 : 1 - index * 0.08,
        force3D: true,
      });
    });
    onFrame();
  };

  gsap.set(root, { autoAlpha: 1 });
  gsap.set([square, label], { autoAlpha: 0, scale: 0.7 });
  gsap.set(blobs, { opacity: 0, scale: 0.4 });
  place(0);

  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set(root, { autoAlpha: 0 });
      onComplete();
    },
  });

  timeline.to(
    [square, label],
    { autoAlpha: 1, scale: 1, duration: 0.28, ease: "power2.out" },
    0,
  );
  timeline.to(progress, {
    t: 1,
    duration: 1.35,
    delay: 0.5,
    ease: "power2.inOut",
    onUpdate: () => {
      place(progress.t);
      state.spin = startSpin - slot * progress.t;
    },
  });
  timeline.to(
    [square, label, ...blobs],
    { autoAlpha: 0, duration: 0.32, ease: "power2.in" },
    ">-0.04",
  );
  timeline.to(
    state,
    {
      spin: startSpin,
      duration: 0.85,
      ease: "power2.inOut",
      onUpdate: onFrame,
    },
    "<0.08",
  );

  return timeline;
}

export function hideGalleryDragHint(root: HTMLElement | null) {
  if (!root) return;
  gsap.set(root, { autoAlpha: 0 });
}
