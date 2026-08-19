"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  createWaterSpotlight,
  type WaterSpotlight,
} from "@/lib/water-spotlight-gl";

gsap.registerPlugin(useGSAP);

type SpotlightRevealProps = {
  src: StaticImageData;
  /** 聚光半径（px） */
  radius?: number;
  className?: string;
};

/** WebGL 不可用时的 CSS 蒙版兜底（无水波，仅羽化光圈） */
const FALLBACK_GRADIENT =
  "radial-gradient(circle calc(var(--spot-r)*1px) at calc(var(--spot-x)*1px) calc(var(--spot-y)*1px), #000 70%, transparent 100%)";

/**
 * 水波聚光揭示层：鼠标设备首进全隐藏，移动鼠标后光标周围一圈显现图片；
 * 移动轨迹上散出一圈圈扩散衰减的水波涟漪，圈内内容与光圈轮廓被涟漪
 * 折射扭曲（WebGL 实现，参考 immersive-g.com 的水面 hover 质感）。
 * 键盘用户（Tab 导航）与触屏、减少动效场景整图常显。
 * 纯装饰层（alt=""），不向读屏软件暴露。
 */
export function SpotlightReveal({
  src,
  radius = 160,
  className,
}: SpotlightRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      const canvas = canvasRef.current;
      const imageEl = imageRef.current;
      if (!el || !canvas || !imageEl || reducedMotion) return;
      // 只有悬停型精准指针（鼠标/触控板）才启用聚光模式，触屏保持常显
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }
      const section = el.closest("section");
      if (!section) return;

      // WebGL 渲染器就绪后隐藏静态图；失败则退回 CSS 蒙版
      const renderer: WaterSpotlight | null = createWaterSpotlight(
        canvas,
        src.src,
      );
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

      // 鼠标设备首进即隐藏，移动鼠标才点亮聚光；
      // 若先出现 Tab 键盘导航，则判定为键盘用户，整图常显
      let mode: "pending" | "spotlight" | "full" = "pending";
      let lastX = 0;
      let lastY = 0;
      let lastTime = 0;

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const elapsed = event.timeStamp - lastTime;
        const speed =
          lastTime > 0 && elapsed > 0
            ? Math.hypot(x - lastX, y - lastY) / elapsed
            : 0;
        lastX = x;
        lastY = y;
        lastTime = event.timeStamp;

        if (mode !== "spotlight") {
          mode = "spotlight";
          if (renderer) {
            gsap.set(imageEl, { autoAlpha: 0 });
            renderer.movePointer(x, y, 0);
            renderer.setRadiusTarget(radius);
          } else {
            gsap.set(el, { "--spot-x": x, "--spot-y": y, "--spot-r": 0 });
            gsap.set(imageEl, {
              maskImage: FALLBACK_GRADIENT,
              webkitMaskImage: FALLBACK_GRADIENT,
              autoAlpha: 1,
            });
            gsap.to(el, {
              "--spot-r": radius,
              duration: 0.6,
              ease: "power3.out",
            });
          }
          return;
        }
        if (renderer) {
          renderer.movePointer(x, y, speed);
        } else {
          fallbackTweens.xTo?.(x);
          fallbackTweens.yTo?.(y);
        }
      };
      const onLeave = () => {
        if (mode !== "spotlight") return;
        if (renderer) {
          renderer.setRadiusTarget(0);
        } else {
          gsap.to(el, { "--spot-r": 0, duration: 0.5, ease: "power2.in" });
        }
      };
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || mode !== "spotlight") return;
        if (renderer) {
          renderer.setRadiusTarget(radius);
        } else {
          gsap.to(el, {
            "--spot-r": radius,
            duration: 0.6,
            ease: "power3.out",
          });
        }
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab" || mode !== "pending") return;
        mode = "full";
        gsap.set(imageEl, {
          autoAlpha: 1,
          clearProps: "maskImage,webkitMaskImage",
        });
      };

      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      section.addEventListener("pointerenter", onEnter);
      window.addEventListener("keydown", onKeyDown);
      return () => {
        renderer?.dispose();
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
        section.removeEventListener("pointerenter", onEnter);
        window.removeEventListener("keydown", onKeyDown);
      };
    },
    { dependencies: [reducedMotion, radius, src.src], scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none ${className ?? "absolute inset-0"}`}
    >
      {/* 静态图：触屏 / 键盘 / 减少动效场景常显；鼠标场景由画布接管 */}
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          quality={95}
          className="object-cover"
        />
      </div>
      {/* 水波聚光画布：与图片同尺寸叠放 */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
