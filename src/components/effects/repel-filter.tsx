"use client";

import { useEffect, useId, useRef, useState } from "react";

type RepelFilterProps = {
  /** 作用半径（px） */
  radius?: number;
  /** 最大位移（px） */
  strength?: number;
  className?: string;
  children: React.ReactNode;
};

/** 排斥效果总开关：暂停使用时置 false，组件退化为普通容器（代码保留） */
const REPEL_ENABLED = false;

const MAP_SIZE = 256;

/**
 * 生成径向位移贴图：R/G 通道编码指向圆心的方向向量（带 smoothstep 衰减），
 * 供 feDisplacementMap 采样，效果为光标周围内容被向外推开。
 */
function buildDisplacementMap(): string {
  const canvas = document.createElement("canvas");
  canvas.width = MAP_SIZE;
  canvas.height = MAP_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(MAP_SIZE, MAP_SIZE);
  const c = (MAP_SIZE - 1) / 2;
  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      const dx = (x - c) / c;
      const dy = (y - c) / c;
      const d = Math.hypot(dx, dy);
      let vx = 0;
      let vy = 0;
      if (d > 0 && d < 1) {
        const t = 1 - d;
        const falloff = t * t * (3 - 2 * t);
        // 编码负方向：采样朝向光标，视觉上内容被推离光标
        vx = (-dx / d) * falloff;
        vy = (-dy / d) * falloff;
      }
      const i = (y * MAP_SIZE + x) * 4;
      img.data[i] = Math.round(127.5 + vx * 127.5);
      img.data[i + 1] = Math.round(127.5 + vy * 127.5);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * 鼠标排斥滤镜容器：容器内的一切（视频、图片、文字）都会被光标推开。
 * 基于 SVG feDisplacementMap，直接作用于 DOM 渲染结果。
 * prefers-reduced-motion 时自动禁用。
 */
export function RepelFilter({
  radius = 140,
  strength = 44,
  className,
  children,
}: RepelFilterProps) {
  const rawId = useId();
  const id = `repel${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!REPEL_ENABLED) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setDataUrl(media.matches ? null : buildDisplacementMap());
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!dataUrl) return;
    const wrap = wrapRef.current;
    const feImage = feImageRef.current;
    if (!wrap || !feImage) return;

    let raf = 0;
    const pointer = { x: -1e4, y: -1e4 };

    const apply = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      feImage.setAttribute("x", String(pointer.x - rect.left - radius));
      feImage.setAttribute("y", String(pointer.y - rect.top - radius));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      schedule();
    };
    const onLeave = () => {
      pointer.x = -1e4;
      pointer.y = -1e4;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dataUrl, radius]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={dataUrl ? { filter: `url(#${id})` } : undefined}
    >
      {children}
      {dataUrl && (
        <svg aria-hidden="true" className="pointer-events-none absolute size-0">
          <defs>
            <filter id={id} colorInterpolationFilters="sRGB">
              <feFlood floodColor="#808080" result="neutral" />
              <feImage
                ref={feImageRef}
                href={dataUrl}
                x={-10000}
                y={-10000}
                width={radius * 2}
                height={radius * 2}
                preserveAspectRatio="none"
                result="map"
              />
              <feComposite in="map" in2="neutral" operator="over" result="dispMap" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="dispMap"
                scale={strength}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  );
}
