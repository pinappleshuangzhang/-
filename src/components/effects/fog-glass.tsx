"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { useDesktopMedia } from "@/hooks/use-desktop-media";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { createFogGlassEngine } from "@/lib/fog-glass-engine";
import type { FogController } from "@/lib/fog-glass-types";

/** 仅用于区分 SSR/客户端的空订阅（portal 需要 document.body） */
const subscribeNoop = () => () => {};

type FogGlassProps = {
  className: string;
  /** 指针热区形状（CSS polygon） */
  clipPath?: string;
  /** 格子真实形状（SVG path + 定位盒），烘进 mask，圆角与网格对齐 */
  maskShape?: {
    path: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onReveal?: () => void;
  revealThreshold?: number;
  /** 屏幕激活后雾层淡入的延迟与时长（秒），与网格入场时间轴对齐 */
  appearDelay?: number;
  appearDuration?: number;
};

/**
 * 桌面局部雾玻璃（#2B2B2B / 14% / blur 14）。
 * 霜层与水珠 canvas 经 portal 挂到 body 并 position:fixed —— 脱离分屏容器的
 * overflow 裁剪后，mask 挖孔才能真正裁掉 backdrop-filter（Chromium 限制），
 * 擦到哪，染色和模糊一起消失。指针热区留在格子内，几何由引擎每帧同步。
 */
export function FogGlass({
  className,
  clipPath,
  maskShape,
  onReveal,
  revealThreshold,
  appearDelay = 0,
  appearDuration = 0,
}: FogGlassProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FogController | null>(null);
  const onRevealRef = useRef(onReveal);
  const isActive = useScreenActive();
  const isDesktop = useDesktopMedia();
  const reducedMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [engineFailed, setEngineFailed] = useState(false);
  const [engineGeneration, setEngineGeneration] = useState(0);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frost = frostRef.current;
    const anchor = rootRef.current;
    if (!canvas || !frost || !anchor || !isDesktop || reducedMotion) {
      setEngineFailed(false);
      setEngineGeneration(0);
      return;
    }

    const engine = createFogGlassEngine(canvas, {
      revealThreshold,
      frostElement: frost,
      anchorElement: anchor,
      maskShape,
      onReveal: () => onRevealRef.current?.(),
    });
    engineRef.current = engine;
    setEngineFailed(!engine);
    setEngineGeneration((generation) => generation + 1);

    return () => {
      engine?.destroy();
      engineRef.current = null;
      setEngineFailed(false);
    };
  }, [mounted, isDesktop, reducedMotion, revealThreshold, maskShape]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isActive) engine.start();
    else engine.pause();
  }, [isActive, engineGeneration]);

  const wipeFromEvent = (event: PointerEvent<HTMLDivElement>) => {
    const engine = engineRef.current;
    const root = rootRef.current;
    if (!engine || !root || reducedMotion) return;
    const rect = root.getBoundingClientRect();
    engine.wipeAt(event.clientX - rect.left, event.clientY - rect.top);
  };

  const releaseStroke = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    engineRef.current?.endStroke();
  };

  if (!isDesktop || reducedMotion) return null;

  const clipStyle = clipPath ? { clipPath } : undefined;
  /* 激活后按网格入场节奏淡入；离开立即隐藏 */
  const appearStyle = isActive
    ? {
        opacity: 1,
        transition: `opacity ${appearDuration}s linear ${appearDelay}s`,
      }
    : { opacity: 0, transition: "none" };

  return (
    <>
      <div
        ref={rootRef}
        aria-hidden="true"
        data-fog-glass=""
        data-fog-active={isActive ? "true" : "false"}
        data-fog-failed={engineFailed ? "true" : "false"}
        className={`pointer-events-auto touch-none ${className}`}
        style={clipStyle}
        onPointerDown={(event) => {
          if (event.isTrusted) {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          wipeFromEvent(event);
        }}
        onPointerMove={wipeFromEvent}
        onPointerUp={releaseStroke}
        onPointerCancel={releaseStroke}
        onPointerLeave={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) return;
          engineRef.current?.endStroke();
        }}
      />
      {mounted &&
        createPortal(
          <div aria-hidden="true" data-fog-layers="">
            {/* 霜层不写 clip-path：形状烘进 mask（clip-path+mask+backdrop-filter 同元素会让 mask 失效）。
                淡入写在元素自身：祖先 opacity<1 会成为 backdrop root，淡入期间 blur 将失效 */}
            <div
              ref={frostRef}
              className="pointer-events-none fixed left-0 top-0 z-[30] bg-[#2B2B2B]/[0.14] backdrop-blur-[14px]"
              style={appearStyle}
            />
            {/* 水珠绘制在引擎内按真实格子路径裁剪，无需 CSS clip-path */}
            <canvas
              ref={canvasRef}
              className="pointer-events-none fixed left-0 top-0 z-[31] block"
              style={appearStyle}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
