"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  CURTAIN_DURATION_MS,
  CURTAIN_REDUCED_DURATION_MS,
  createCurtainGrid,
  drawCurtainFade,
  drawCurtainFrame,
  prefersLiteCurtain,
  type CurtainGrid,
  type CurtainPhase,
} from "@/lib/ascii-curtain";

type AsciiCurtainProps = {
  phase: CurtainPhase;
  reducedMotion: boolean;
  /** cover 铺满时回调，此时可安全替换屏内容 */
  onCoverComplete: () => void;
  /** reveal 消散完成时回调 */
  onRevealComplete: () => void;
};

/**
 * 全屏 ASCII 幕布：由 gsap.ticker 逐帧驱动 canvas 绘制，
 * 与站内其它动画共用同一时钟，动画状态全部存 ref 不进 React 渲染。
 */
export function AsciiCurtain({
  phase,
  reducedMotion,
  onCoverComplete,
  onRevealComplete,
}: AsciiCurtainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);
  const reducedMotionRef = useRef(reducedMotion);
  const liteRef = useRef(false);
  const callbacksRef = useRef({ onCoverComplete, onRevealComplete });
  const runRef = useRef({ startedAt: 0, completed: false });

  const completePhase = useCallback((currentPhase: CurtainPhase) => {
    const run = runRef.current;
    if (
      currentPhase === "idle" ||
      phaseRef.current !== currentPhase ||
      run.completed
    ) {
      return;
    }
    run.completed = true;
    if (currentPhase === "cover") {
      callbacksRef.current.onCoverComplete();
    } else {
      callbacksRef.current.onRevealComplete();
    }
  }, []);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    callbacksRef.current = { onCoverComplete, onRevealComplete };
  }, [reducedMotion, onCoverComplete, onRevealComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    liteRef.current = prefersLiteCurtain();
    let grid: CurtainGrid = createCurtainGrid(canvas, ctx, {
      lite: liteRef.current,
    });
    let needsResize = false;
    const markResize = () => {
      needsResize = true;
    };
    window.addEventListener("resize", markResize);

    const render = () => {
      const currentPhase = phaseRef.current;
      if (currentPhase === "idle") return;

      if (needsResize) {
        liteRef.current = prefersLiteCurtain();
        grid = createCurtainGrid(canvas, ctx, { lite: liteRef.current });
        needsResize = false;
      }

      // 用墙钟进度：Safari 后台恢复或 ticker 暂停时仍能推进并触发完成。
      const now = performance.now();
      // Safari / iOS / 窄屏走淡入淡出幕布：完整 ASCII 会卡死主线程，相位停在 cover。
      const useSimpleFade = reducedMotionRef.current || liteRef.current;
      const duration = useSimpleFade
        ? CURTAIN_REDUCED_DURATION_MS
        : CURTAIN_DURATION_MS;
      const run = runRef.current;
      const progress = Math.min((now - run.startedAt) / duration, 1);

      try {
        if (useSimpleFade) {
          drawCurtainFade(ctx, grid, currentPhase, progress);
        } else {
          drawCurtainFrame(ctx, grid, currentPhase, progress, now);
        }
      } catch {
        completePhase(currentPhase);
        return;
      }

      if (progress < 1) return;
      completePhase(currentPhase);
    };

    gsap.ticker.add(render);
    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("resize", markResize);
    };
  }, [completePhase]);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "idle") {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    liteRef.current = prefersLiteCurtain();
    runRef.current = { startedAt: performance.now(), completed: false };
    const duration =
      reducedMotion || liteRef.current
        ? CURTAIN_REDUCED_DURATION_MS
        : CURTAIN_DURATION_MS;
    // iOS 后台恢复或 Canvas/GPU 异常时，ticker 可能暂停；独立计时确保切屏不会永久卡住。
    const safetyTimer = window.setTimeout(
      () => completePhase(phase),
      duration + 250,
    );
    return () => window.clearTimeout(safetyTimer);
  }, [completePhase, phase, reducedMotion]);

  return <canvas ref={canvasRef} data-ascii-curtain={phase} aria-hidden="true" />;
}
