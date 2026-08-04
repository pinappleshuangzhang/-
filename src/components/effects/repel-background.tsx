"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const RepelCanvas = dynamic(() => import("./repel-canvas"), { ssr: false });

type RepelBackgroundProps = {
  src: string;
  radius?: number;
  force?: number;
};

/**
 * 背景鼠标排斥效果层：叠在静态背景图之上。
 * - prefers-reduced-motion 时不渲染，保留静态图。
 * - 所在分屏离开视口时暂停渲染循环。
 * - WebGL 不可用或纹理未就绪时画布透明，自动降级为静态图。
 */
export function RepelBackground({
  src,
  radius = 0.1,
  force = 0.2,
}: RepelBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <RepelCanvas src={src} radius={radius} force={force} active={inView} />
    </div>
  );
}
