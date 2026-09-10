"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  createWaterSpotlight,
  type WaterSpotlight,
} from "@/lib/water-spotlight-gl";

gsap.registerPlugin(useGSAP);

type SpotlightRevealProps = {
  src: StaticImageData;
  /** 小于 768px 时使用的移动端构图 */
  mobileSrc?: StaticImageData;
  /** 聚光半径（px） */
  radius?: number;
  /** 移动端聚光半径（px），默认沿用桌面值 */
  mobileRadius?: number;
  /** 无鼠标输入时，让聚光点沿内容区域自动巡游 */
  autoMove?: boolean;
  className?: string;
};

/** WebGL 不可用时的 CSS 蒙版兜底（无水波，仅羽化光圈） */
const FALLBACK_GRADIENT =
  "radial-gradient(circle calc(var(--spot-r)*1px) at calc(var(--spot-x)*1px) calc(var(--spot-y)*1px), #000 70%, rgba(0,0,0,0) 100%)";

/**
 * 水波聚光揭示层：鼠标设备首进全隐藏，移动鼠标后光标周围一圈显现图片；
 * 移动轨迹上散出一圈圈扩散衰减的水波涟漪，圈内内容与光圈轮廓被涟漪
 * 折射扭曲（WebGL 实现，参考 immersive-g.com 的水面 hover 质感）。
 * 键盘用户（Tab 导航）与触屏、减少动效场景整图常显。
 * 纯装饰层（alt=""），不向读屏软件暴露。
 */
export function SpotlightReveal({
  src,
  mobileSrc,
  radius = 160,
  mobileRadius,
  autoMove = false,
  className,
}: SpotlightRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WaterSpotlight | null>(null);
  const isActive = useScreenActive();
  const isActiveRef = useRef(isActive);
  // 自动巡游循环的开关，由 useGSAP 内部赋值；离屏停 rAF，回屏再启动
  const autoLoopControlRef = useRef<((run: boolean) => void) | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    isActiveRef.current = isActive;
    rendererRef.current?.setPaused(!isActive);
    autoLoopControlRef.current?.(isActive);
  }, [isActive]);

  useGSAP(
    () => {
      const el = ref.current;
      const canvas = canvasRef.current;
      const imageEl = imageRef.current;
      if (!el || !canvas || !imageEl || reducedMotion) return;
      const hasPrecisePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      // 移动端只保留静态压印图，不创建流体 WebGL。
      if (isMobile || (!autoMove && !hasPrecisePointer)) {
        return;
      }
      const section = el.closest("section");
      if (!section) return;
      const activeSrc = mobileSrc && isMobile ? mobileSrc : src;
      const activeRadius = isMobile ? (mobileRadius ?? radius) : radius;

      // WebGL 渲染器就绪后隐藏静态图；失败则退回 CSS 蒙版
      const renderer: WaterSpotlight | null = createWaterSpotlight(
        canvas,
        activeSrc.src,
      );
      rendererRef.current = renderer;
      renderer?.setPaused(!isActive);
      let fallbackTweens: { xTo?: gsap.QuickToFunc; yTo?: gsap.QuickToFunc } =
        {};
      if (renderer) {
        gsap.set(imageEl, { autoAlpha: 0 });
      } else {
        gsap.set(el, { "--spot-x": 0, "--spot-y": 0, "--spot-r": 0 });
        gsap.set(imageEl, {
          maskImage: FALLBACK_GRADIENT,
          webkitMaskImage: FALLBACK_GRADIENT,
        });
        fallbackTweens = {
          xTo: gsap.quickTo(el, "--spot-x", { duration: 0.45, ease: "power3" }),
          yTo: gsap.quickTo(el, "--spot-y", { duration: 0.45, ease: "power3" }),
        };
      }

      // 可选自动巡游；鼠标输入会立即接管，闲置后再恢复自动模式。
      // 若先出现 Tab 键盘导航，则判定为键盘用户，整图常显。
      let mode: "pending" | "auto" | "pointer" | "full" = autoMove
        ? "auto"
        : "pending";
      let lastX = 0;
      let lastY = 0;
      let lastTime = 0;
      let autoFrame = 0;
      let autoRunning = false;
      let idleTimer = 0;

      // rect 缓存：每帧调 getBoundingClientRect 会反复触发布局查询，
      // 位置只在尺寸变化 / 循环重启时才需要重新量。
      let sectionRect = section.getBoundingClientRect();
      let elRect = el.getBoundingClientRect();
      const refreshRects = () => {
        sectionRect = section.getBoundingClientRect();
        elRect = el.getBoundingClientRect();
      };

      const setRadius = (value: number) => {
        if (renderer) {
          renderer.setRadiusTarget(value);
        } else {
          gsap.to(el, {
            "--spot-r": value,
            duration: 0.6,
            ease: "power3.out",
          });
        }
      };

      const moveSpotlight = (x: number, y: number, time: number) => {
        const elapsed = time - lastTime;
        const speed =
          lastTime > 0 && elapsed > 0
            ? Math.hypot(x - lastX, y - lastY) / elapsed
            : 0;
        lastX = x;
        lastY = y;
        lastTime = time;

        if (renderer) {
          renderer.movePointer(x, y, speed);
        } else if (mode === "auto") {
          gsap.set(el, { "--spot-x": x, "--spot-y": y });
        } else {
          fallbackTweens.xTo?.(x);
          fallbackTweens.yTo?.(y);
        }
      };

      const activateAuto = () => {
        if (!autoMove || mode === "full") return;
        mode = "auto";
        lastTime = 0;
        setRadius(activeRadius);
      };

      const scheduleAuto = () => {
        if (!autoMove) return;
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(activateAuto, 1600);
      };

      const animateAuto = (time: number) => {
        if (!autoRunning) return;
        if (mode === "auto") {
          const x =
            sectionRect.left +
            sectionRect.width * (0.5 + 0.4 * Math.sin(time * 0.00022)) -
            elRect.left;
          const y =
            sectionRect.top +
            sectionRect.height *
              (0.72 + 0.12 * Math.sin(time * 0.00031 + 1.3)) -
            elRect.top;
          moveSpotlight(x, y, time);
        }
        autoFrame = window.requestAnimationFrame(animateAuto);
      };

      const startAutoLoop = () => {
        if (!autoMove || autoRunning || mode === "full") return;
        autoRunning = true;
        lastTime = 0;
        refreshRects();
        autoFrame = window.requestAnimationFrame(animateAuto);
      };
      const stopAutoLoop = () => {
        autoRunning = false;
        window.cancelAnimationFrame(autoFrame);
      };
      autoLoopControlRef.current = (run) => {
        if (run) startAutoLoop();
        else stopAutoLoop();
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || mode === "full") return;
        const x = event.clientX - elRect.left;
        const y = event.clientY - elRect.top;

        if (mode !== "pointer") {
          mode = "pointer";
          lastTime = 0;
          if (renderer) {
            gsap.set(imageEl, { autoAlpha: 0 });
            renderer.movePointer(x, y, 0);
          } else {
            gsap.set(el, { "--spot-x": x, "--spot-y": y, "--spot-r": 0 });
            gsap.set(imageEl, {
              maskImage: FALLBACK_GRADIENT,
              webkitMaskImage: FALLBACK_GRADIENT,
              autoAlpha: 1,
            });
          }
          setRadius(activeRadius);
        }
        moveSpotlight(x, y, event.timeStamp);
        scheduleAuto();
      };
      const onLeave = () => {
        if (mode !== "pointer") return;
        if (autoMove) {
          activateAuto();
        } else if (renderer) {
          renderer.setRadiusTarget(0);
        } else {
          gsap.to(el, {
            "--spot-r": 0,
            duration: 0.5,
            ease: "power2.in",
          });
        }
      };
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || mode !== "pointer") return;
        setRadius(activeRadius);
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (
          event.key !== "Tab" ||
          (mode !== "pending" && mode !== "auto")
        ) {
          return;
        }
        mode = "full";
        window.clearTimeout(idleTimer);
        stopAutoLoop();
        setRadius(0);
        gsap.set(imageEl, {
          autoAlpha: 1,
          clearProps: "maskImage,webkitMaskImage",
        });
      };

      if (autoMove) {
        moveSpotlight(
          sectionRect.left + sectionRect.width * 0.5 - elRect.left,
          sectionRect.top + sectionRect.height * 0.72 - elRect.top,
          performance.now(),
        );
        setRadius(activeRadius);
        // 巡游循环只在本屏激活时运行，离屏由 autoLoopControlRef 停掉
        if (isActiveRef.current) startAutoLoop();
      }

      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      section.addEventListener("pointerenter", onEnter);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", refreshRects);
      return () => {
        autoLoopControlRef.current = null;
        rendererRef.current = null;
        renderer?.dispose();
        stopAutoLoop();
        window.clearTimeout(idleTimer);
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
        section.removeEventListener("pointerenter", onEnter);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", refreshRects);
      };
    },
    {
      dependencies: [
        autoMove,
        mobileRadius,
        mobileSrc?.src,
        reducedMotion,
        radius,
        src.src,
      ],
      scope: ref,
    },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none ${className ?? "absolute inset-0"}`}
    >
      {/* 静态图：触屏 / 键盘 / 减少动效场景常显；鼠标场景由画布接管 */}
      <div ref={imageRef} className="absolute inset-0">
        {mobileSrc && (
          <Image
            src={mobileSrc}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 0px"
            unoptimized
            className="object-cover object-bottom md:hidden"
          />
        )}
        <Image
          src={src}
          alt=""
          fill
          sizes={mobileSrc ? "(min-width: 768px) 100vw, 0px" : "100vw"}
          quality={95}
          className={`object-cover ${mobileSrc ? "hidden md:block" : ""}`}
        />
      </div>
      {/* 水波聚光画布：与图片同尺寸叠放 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full bg-transparent outline-none"
      />
    </div>
  );
}
