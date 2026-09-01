"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  // 整屏分页时停掉 Lenis：Safari 上 Lenis 仍可能改 transform，
  // 破坏 fixed 舞台，出现“首屏下露出下一屏但切不过去”。
  useEffect(() => {
    if (!lenis) return;

    const sync = () => {
      if (document.documentElement.hasAttribute("data-section-pager")) {
        // stop 之后 scrollTo 默认会被忽略，需 force；先归零再停止
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-section-pager"],
    });
    return () => observer.disconnect();
  }, [lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const options = useMemo(
    () => ({
      autoRaf: false,
      lerp: reducedMotion ? 1 : 0.1,
      smoothWheel: !reducedMotion,
      syncTouch: false,
    }),
    [reducedMotion],
  );

  return (
    <ReactLenis root options={options}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
