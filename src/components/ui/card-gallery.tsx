"use client";

import { useEffect, useEffectEvent, useRef, type MutableRefObject } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import type { GalleryCard } from "@/lib/archive-ga-003-cards";
import gsap from "gsap";
import { createDissolveMaskFrames } from "@/lib/dissolve-mask";
import { MEMBER_RECORD_HOVER_REVEAL_DURATION } from "@/animations/member-record-reveal";

/** 长廊几何尺寸：图片本体宽度保持不变 */
const CARD_WIDTH = 280;
const CARD_HEIGHT = 220;
/** 作品图按原图比例缩放后的显示尺寸 */
const FRAME_WIDTH = 280;
/** 单张卡片的上下边弧线深度 */
const CARD_EDGE_CURVE = 34;
const CARD_CURVE_CLIP_PATH =
  `path("M 0 0 Q ${CARD_WIDTH / 2} ${CARD_EDGE_CURVE} ${CARD_WIDTH} 0 ` +
  `L ${CARD_WIDTH} ${CARD_HEIGHT} Q ${CARD_WIDTH / 2} ${CARD_HEIGHT - CARD_EDGE_CURVE} 0 ${CARD_HEIGHT} Z")`;
/**
 * 长廊主控参数：
 * 1) CARD_GAP：卡片几何间距
 * 2) PERSPECTIVE：透视强度
 * 3) 图片本身也跟随弧线做纵深与朝向变化
 */
/** 当前可见卡片间距 */
const CARD_GAP = 32;
/** 透视距离：越大两侧弧度越轻，更接近参考图的轻弯带状效果 */
const PERSPECTIVE = 2200;
/** 卡片中心间距兜底值：实际间距按屏幕宽度动态计算 */
const HORIZONTAL_STEP = 252;
/**
 * 通栏跨度槽位数：左右第 3 张卡片贴屏幕边缘裁切出血，
 * 任何屏宽下长廊都超出屏幕。
 */
const VISIBLE_SPAN_SLOTS = 6;
/**
 * 边缘卡片中心相对屏幕边缘向内收的距离：
 * 让最外侧卡片只被裁掉约三分之一（视觉宽约 254px，露出 2/3）。
 */
const EDGE_CARD_INSET = 42;
/** 中心向里收，两侧向外放 */
const CENTER_RECESS = 200;
const SIDE_PROTRUSION_STEP = 68;
/** 两侧卡片朝向更顺着弧线展开 */
const ROTATE_Y_PER_SLOT = 22;
/** 整体大小和高度随槽位逐渐展开 */
const CENTER_SCALE_X = 0.74;
const SCALE_X_STEP = 0.05;
const MAX_SCALE_X = 0.98;
const CENTER_SCALE_Y = 0.74;
const SCALE_Y_STEP = 0.05;
const MAX_SCALE_Y = 0.98;
/** 拖拽灵敏度（度 / px） */
const DRAG_SENSITIVITY = 0.18;
/** 滚轮灵敏度（度 / deltaY） */
const WHEEL_SENSITIVITY = 0.06;
/** 惯性时长 */
const INERTIA_DURATION = 1.1;
/** 小于该位移视为点击，打开作品详情 */
const CLICK_THRESHOLD = 8;

/**
 * hover 彩图沿用第四屏的斑块溶解遮罩：格子约 5×8px（对应 280×220 的卡面），
 * 帧数与幕布节奏保持一致，首次 hover 时生成并全卡共享缓存。
 */
const HOVER_MASK_COLS = 56;
const HOVER_MASK_ROWS = 28;
const HOVER_MASK_FRAME_COUNT = 24;

let hoverDissolveFrames: string[] | null = null;
function getHoverDissolveFrames(): string[] {
  hoverDissolveFrames ??= createDissolveMaskFrames(
    HOVER_MASK_COLS,
    HOVER_MASK_ROWS,
    HOVER_MASK_FRAME_COUNT,
  );
  return hoverDissolveFrames;
}

function setElementMask(el: HTMLElement, url: string | null) {
  const value = url ? `url(${url})` : "";
  el.style.maskImage = value;
  el.style.webkitMaskImage = value;
  el.style.maskSize = url ? "100% 100%" : "";
  el.style.webkitMaskSize = url ? "100% 100%" : "";
}

export type CardGalleryControls = {
  prev: () => void;
  next: () => void;
};

type CardGalleryProps = {
  cards: GalleryCard[];
  reducedMotion?: boolean;
  /** 按钮切换模式：禁用滚轮/拖拽/键盘旋转，只保留外部按钮触发 */
  interactionMode?: "free" | "buttons";
  /** 分屏滚轮拦截器写入此 ref，由长廊消费 deltaY */
  wheelHandlerRef?: MutableRefObject<((deltaY: number) => void) | null>;
  /** 给父级暴露左右切换能力 */
  controlsRef?: MutableRefObject<CardGalleryControls | null>;
  /** 点击卡片（或聚焦时长廊按 Enter）进入作品详情 */
  onSelect?: (card: GalleryCard) => void;
};

/**
 * 圆柱形卡片长廊：卡片排在圆柱内壁，
 * 屏幕中心向里凹、左右两侧向外鼓；卡片框尺寸遵循 Figma。
 * 动画只动 transform。
 */
export function CardGallery({
  cards,
  reducedMotion = false,
  interactionMode = "free",
  wheelHandlerRef,
  controlsRef,
  onSelect,
}: CardGalleryProps) {
  const { t } = useLocale();
  const sceneRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const pointerCardIndexRef = useRef<number | null>(null);
  const inertiaTweenRef = useRef<gsap.core.Tween | null>(null);
  const proxyRef = useRef({ rotation: 0 });
  const horizontalStepRef = useRef(HORIZONTAL_STEP);

  const count = cards.length;
  const theta = count > 0 ? 360 / count : 0;
  const buttonsOnly = interactionMode === "buttons";
  const layoutSignature = [
    HORIZONTAL_STEP,
    CENTER_RECESS,
    SIDE_PROTRUSION_STEP,
    ROTATE_Y_PER_SLOT,
    CENTER_SCALE_X,
    SCALE_X_STEP,
    MAX_SCALE_X,
    CENTER_SCALE_Y,
    SCALE_Y_STEP,
    MAX_SCALE_Y,
  ].join(":");

  const applyRingRotation = useEffectEvent((degrees: number) => {
    const ring = ringRef.current;
    if (!ring) return;
    rotationRef.current = degrees;
    proxyRef.current.rotation = degrees;

    const cells = ring.querySelectorAll<HTMLElement>("[data-gallery-card]");
    const offsetSlots = degrees / theta;

    cells.forEach((cell, index) => {
      const rawSlot = index - offsetSlots;
      const wrappedSlot =
        ((((rawSlot + count / 2) % count) + count) % count) - count / 2;
      const distance = Math.min(Math.abs(wrappedSlot), 4);
      const x = wrappedSlot * horizontalStepRef.current;
      const z =
        -CENTER_RECESS +
        Math.pow(distance, 1.16) * SIDE_PROTRUSION_STEP;
      const rotateY = -wrappedSlot * ROTATE_Y_PER_SLOT;
      const scaleX = Math.min(
        MAX_SCALE_X,
        CENTER_SCALE_X + distance * SCALE_X_STEP,
      );
      const scaleY = Math.min(
        MAX_SCALE_Y,
        CENTER_SCALE_Y + distance * SCALE_Y_STEP,
      );
      cell.style.zIndex = `${Math.round(1000 - distance * 10 + z)}`;
      cell.style.transform =
        `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scaleX}, ${scaleY})`;
    });
  });

  const animateTo = useEffectEvent((degrees: number, duration = 0.55) => {
    inertiaTweenRef.current?.kill();
    inertiaTweenRef.current = gsap.to(proxyRef.current, {
      rotation: degrees,
      duration,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => applyRingRotation(proxyRef.current.rotation),
    });
  });

  const spinBy = useEffectEvent((deltaDeg: number) => {
    if (reducedMotion) return;
    velocityRef.current = deltaDeg;
    animateTo(rotationRef.current + deltaDeg, 0.45);
  });

  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      prev: () => spinBy(theta),
      next: () => spinBy(-theta),
    };
    return () => {
      controlsRef.current = null;
    };
  }, [controlsRef, theta]);

  // 初始与屏宽变化：卡片间距按屏幕宽度铺满通栏后重新布局
  useEffect(() => {
    const scene = sceneRef.current;
    const ring = ringRef.current;
    if (!scene || !ring || reducedMotion) return;

    const relayout = () => {
      horizontalStepRef.current = Math.max(
        HORIZONTAL_STEP,
        (scene.clientWidth / 2 - EDGE_CARD_INSET) / (VISIBLE_SPAN_SLOTS / 2),
      );
      applyRingRotation(rotationRef.current);
    };
    relayout();
    const observer = new ResizeObserver(relayout);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [count, layoutSignature, theta, reducedMotion]);

  // 指针拖拽 + 松手惯性
  useEffect(() => {
    if (reducedMotion || buttonsOnly) return;
    const scene = sceneRef.current;
    if (!scene) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      draggingRef.current = true;
      lastXRef.current = event.clientX;
      velocityRef.current = 0;
      dragDistanceRef.current = 0;
      const cardEl = (event.target as Element | null)?.closest?.(
        "[data-gallery-card]",
      );
      const indexAttr = cardEl?.getAttribute("data-gallery-index");
      pointerCardIndexRef.current =
        indexAttr === null || indexAttr === undefined
          ? null
          : Number(indexAttr);
      inertiaTweenRef.current?.kill();
      scene.setPointerCapture(event.pointerId);
      scene.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = event.clientX - lastXRef.current;
      lastXRef.current = event.clientX;
      dragDistanceRef.current += Math.abs(dx);
      const deltaDeg = dx * DRAG_SENSITIVITY;
      velocityRef.current = deltaDeg;
      applyRingRotation(rotationRef.current + deltaDeg);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      scene.style.cursor = "grab";
      try {
        scene.releasePointerCapture(event.pointerId);
      } catch {
        // 捕获可能已释放
      }
      const cardIndex = pointerCardIndexRef.current;
      const wasClick = dragDistanceRef.current < CLICK_THRESHOLD;
      pointerCardIndexRef.current = null;
      const coast = velocityRef.current * 12;
      if (Math.abs(coast) > 0.4) {
        animateTo(rotationRef.current + coast, INERTIA_DURATION);
      }
      if (wasClick && cardIndex !== null && cards[cardIndex]) {
        onSelect?.(cards[cardIndex]);
      }
    };

    scene.addEventListener("pointerdown", onPointerDown);
    scene.addEventListener("pointermove", onPointerMove);
    scene.addEventListener("pointerup", onPointerUp);
    scene.addEventListener("pointercancel", onPointerUp);

    return () => {
      scene.removeEventListener("pointerdown", onPointerDown);
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerup", onPointerUp);
      scene.removeEventListener("pointercancel", onPointerUp);
      inertiaTweenRef.current?.kill();
    };
  }, [reducedMotion, buttonsOnly, cards, onSelect]);

  // 键盘左右旋转（上下切屏仍由分页器处理）
  useEffect(() => {
    if (reducedMotion || buttonsOnly) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        spinBy(theta);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        spinBy(-theta);
      } else if (event.key === "Enter" && onSelect) {
        if (document.activeElement !== sceneRef.current) return;
        event.preventDefault();
        onSelect(cards[0]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reducedMotion, buttonsOnly, theta, onSelect, cards]);

  // 把滚轮消费函数挂到分屏拦截器用的 ref
  useEffect(() => {
    if (!wheelHandlerRef) return;
    if (reducedMotion || buttonsOnly) {
      wheelHandlerRef.current = null;
      return;
    }
    wheelHandlerRef.current = (deltaY) => {
      spinBy(-deltaY * WHEEL_SENSITIVITY);
    };
    return () => {
      wheelHandlerRef.current = null;
    };
  }, [reducedMotion, buttonsOnly, wheelHandlerRef]);

  if (reducedMotion) {
    return (
      <div
        className="flex h-full items-center overflow-x-auto px-[30px]"
        role="list"
        aria-label={t("gallery.list")}
      >
        <ul className="mx-auto flex" style={{ gap: CARD_GAP }}>
          {cards.map((card, index) => (
            <li
              key={`${card.src}-${index}`}
              role="listitem"
              className="relative shrink-0 overflow-hidden"
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
            >
              {onSelect ? (
                <button
                  type="button"
                  className="relative block size-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
                  onClick={() => onSelect(card)}
                >
                  <CardFaceImage
                    card={card}
                    reducedMotion
                    alt={`${t("gallery.cardAlt")} ${String(index + 1).padStart(2, "0")}`}
                  />
                  <span className="sr-only">{t("gallery.detail")}</span>
                </button>
              ) : (
                <CardFaceImage
                  card={card}
                  reducedMotion
                  alt={`${t("gallery.cardAlt")} ${String(index + 1).padStart(2, "0")}`}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      ref={sceneRef}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 ${buttonsOnly ? "" : "cursor-grab active:cursor-grabbing"}`}
      style={{ perspective: `${PERSPECTIVE}px` }}
      role="region"
      aria-roledescription="旋转卡片长廊"
      aria-label={
        buttonsOnly ? t("gallery.hintButtons") : t("gallery.hintFree")
      }
      tabIndex={0}
    >
      <div
        ref={ringRef}
        className="relative h-0 w-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {cards.map((card, index) => (
          <figure
            key={`${card.src}-${index}`}
            data-gallery-card
            data-gallery-index={index}
            className={`group absolute top-1/2 left-1/2 m-0 ${onSelect ? "cursor-pointer" : ""}`}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              backfaceVisibility: "hidden",
            }}
          >
            <CardFaceImage
              card={card}
              alt={`${t("gallery.cardAlt")} ${String(index + 1).padStart(2, "0")}`}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

function CardFaceImage({
  card,
  reducedMotion = false,
  alt,
}: {
  card: GalleryCard;
  reducedMotion?: boolean;
  alt?: string;
}) {
  const hoverLayerRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef({ frame: 0 });

  // 复刻第四屏 hover：彩图藏在斑块溶解遮罩后逐帧显现，离开时倒放。
  const animateHover = (entering: boolean) => {
    const layer = hoverLayerRef.current;
    if (!layer) return;
    const frames = getHoverDissolveFrames();
    if (reducedMotion || frames.length === 0) {
      layer.style.opacity = entering ? "1" : "0";
      setElementMask(layer, null);
      return;
    }
    const proxy = proxyRef.current;
    gsap.killTweensOf(proxy);
    layer.style.opacity = "1";
    gsap.to(proxy, {
      frame: entering ? frames.length - 1 : 0,
      duration: MEMBER_RECORD_HOVER_REVEAL_DURATION,
      ease: "none",
      onUpdate: () => {
        const frame = frames[Math.round(proxy.frame)];
        if (frame) setElementMask(layer, frame);
      },
      onComplete: () => {
        if (entering) {
          setElementMask(layer, null);
        } else {
          layer.style.opacity = "0";
          setElementMask(layer, null);
        }
      },
    });
  };

  return (
    <div
      data-gallery-card-content
      className="absolute left-1/2 top-1/2"
      style={{
        width: FRAME_WIDTH,
        transform: "translate(-50%, -50%)",
      }}
      onMouseEnter={card.hoverSrc ? () => animateHover(true) : undefined}
      onMouseLeave={card.hoverSrc ? () => animateHover(false) : undefined}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[244px] w-[400px] -translate-y-1/2 translate-x-[calc(-50%+15px)] opacity-0 transition-opacity duration-[600ms] group-hover:opacity-100">
        <Image
          src="/archive-ga-004/hover-shadow.svg"
          alt=""
          fill
          sizes="400px"
          className="object-contain"
        />
      </div>
      <div
        className="relative overflow-hidden"
        style={{
          width: FRAME_WIDTH,
          height: CARD_HEIGHT,
          clipPath: CARD_CURVE_CLIP_PATH,
        }}
      >
        <Image
          src={card.src}
          alt={alt ?? card.alt}
          width={848}
          height={533}
          sizes={`${FRAME_WIDTH}px`}
          className="pointer-events-none h-auto w-full select-none"
          draggable={false}
        />
        {card.hoverSrc ? (
          <div
            ref={hoverLayerRef}
            aria-hidden="true"
            className="absolute inset-0 opacity-0"
          >
            <Image
              src={card.hoverSrc}
              alt=""
              width={848}
              height={533}
              sizes={`${FRAME_WIDTH}px`}
              className="pointer-events-none h-auto w-full select-none"
              draggable={false}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
