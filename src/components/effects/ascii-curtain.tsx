"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  CURTAIN_DURATION_MS,
  CURTAIN_REDUCED_DURATION_MS,
  createCurtainGrid,
  drawCurtainFade,
  drawCurtainFrame,
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
  const callbacksRef = useRef({ onCoverComplete, onRevealComplete });
  const runRef = useRef({ startedAt: 0, completed: false });

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    callbacksRef.current = { onCoverComplete, onRevealComplete };
  }, [reducedMotion, onCoverComplete, onRevealComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let grid: CurtainGrid = createCurtainGrid(canvas, ctx);
    let needsResize = false;
    const markResize = () => {
      needsResize = true;
    };
    window.addEventListener("resize", markResize);

    const render = (time: number) => {
      const currentPhase = phaseRef.current;
      if (currentPhase === "idle") return;

      if (needsResize) {
        grid = createCurtainGrid(canvas, ctx);
        needsResize = false;
      }

      const now = time * 1000;
      const isReduced = reducedMotionRef.current;
      const duration = isReduced
        ? CURTAIN_REDUCED_DURATION_MS
        : CURTAIN_DURATION_MS;
      const run = runRef.current;
      const progress = Math.min((now - run.startedAt) / duration, 1);

      if (isReduced) {
        drawCurtainFade(ctx, grid, currentPhase, progress);
      } else {
        drawCurtainFrame(ctx, grid, currentPhase, progress, now);
      }

      if (progress < 1 || run.completed) return;
      run.completed = true;
      if (currentPhase === "cover") {
        callbacksRef.current.onCoverComplete();
      } else {
        callbacksRef.current.onRevealComplete();
      }
    };

    gsap.ticker.add(render);
    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("resize", markResize);
    };
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "idle") {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    runRef.current = { startedAt: gsap.ticker.time * 1000, completed: false };
  }, [phase]);

  return <canvas ref={canvasRef} data-ascii-curtain={phase} aria-hidden="true" />;
}
