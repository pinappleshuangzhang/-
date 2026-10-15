"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import Image from "next/image";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  AUTO_STEP_INTERVAL,
  GEAR_STEP_DEG,
  playMachineStep,
  revertMachineStep,
} from "@/animations/contact-machine";

const SLIDES = [
  "/contact-survey/machine-slide-1.webp",
  "/contact-survey/machine-slide-2.webp",
  "/contact-survey/machine-slide-3.webp",
  "/contact-survey/machine-slide-4.webp",
  "/contact-survey/machine-slide-5.webp",
  "/contact-survey/machine-slide-6.webp",
] as const;

type SlidePair = [string, string];

/**
 * 取件机叠层（Figma 1468:1495）。
 * 桌面坐标是 1440×800 画板像素，由外层 stage-cover-1440 的 --su 换成与背景相同的 cover 倍率。
 * 移动端坐标是 390×844 画板像素，压在 machine-bg-mobile 的卡片窗和齿轮上，倍率用 --cover。
 * 齿轮节点本身转了 65.25°，这里用的是旋转后的外接框；位图里已经含这次旋转。
 */
export function ContactMachine() {
  const isActive = useScreenActive();
  const reduced = useReducedMotion();
  const gearRef = useRef<HTMLSpanElement>(null);
  const frontLayerRef = useRef<HTMLDivElement>(null);
  const backLayerRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef(0);
  const shownRef = useRef(0);
  const angleRef = useRef(0);
  const [layerSrc, setLayerSrc] = useState<SlidePair>([SLIDES[0], SLIDES[1]]);
  const playingRef = useRef(false);
  const timerRef = useRef(0);
  const activeRef = useRef(isActive);
  const reducedRef = useRef(reduced);
  const machine = useRef({
    start: () => {},
    revert: () => {},
    arm: () => {},
    clear: () => {},
  });

  useEffect(() => {
    const api = machine.current;
    const layer = (index: number) =>
      (index === 0 ? frontLayerRef : backLayerRef).current;

    api.clear = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };

    api.arm = () => {
      api.clear();
      if (!activeRef.current) return;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = 0;
        if (!activeRef.current || playingRef.current) return;
        api.start();
      }, AUTO_STEP_INTERVAL * 1000);
    };

    api.revert = () => {
      const gear = gearRef.current;
      const outgoing = layer(frontRef.current);
      const incoming = layer(1 - frontRef.current);
      if (!gear || !outgoing || !incoming) return;
      playingRef.current = false;
      revertMachineStep(gear, outgoing, incoming, angleRef.current);
    };

    api.start = () => {
      const gear = gearRef.current;
      const outgoing = layer(frontRef.current);
      const incoming = layer(1 - frontRef.current);
      if (!gear || !outgoing || !incoming) return;
      playingRef.current = true;
      api.clear();
      playMachineStep(
        gear,
        outgoing,
        incoming,
        angleRef.current,
        reducedRef.current,
        () => {
          playingRef.current = false;
          angleRef.current += GEAR_STEP_DEG;
          frontRef.current = 1 - frontRef.current;
          shownRef.current = (shownRef.current + 1) % SLIDES.length;
          const queued = (shownRef.current + 1) % SLIDES.length;
          const hidden = 1 - frontRef.current;
          setLayerSrc((current) => {
            if (current[hidden] === SLIDES[queued]) return current;
            const next: SlidePair = [current[0], current[1]];
            next[hidden] = SLIDES[queued];
            return next;
          });
          api.arm();
        },
      );
    };

    const gear = gearRef.current;
    const front = frontLayerRef.current;
    const back = backLayerRef.current;
    if (gear && front && back) {
      gsap.set(gear, { rotation: 0 });
      gsap.set(front, { yPercent: 0 });
      gsap.set(back, { yPercent: -100 });
    }
  }, []);

  useEffect(() => {
    for (const src of SLIDES) {
      const image = new window.Image();
      image.src = src;
    }
  }, []);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const api = machine.current;
    activeRef.current = isActive;
    if (!isActive) {
      api.clear();
      if (playingRef.current) api.revert();
      return;
    }
    api.arm();
    return () => api.clear();
  }, [isActive]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 stage-cover-390 md:contents">
      <div
        className="machine-window absolute overflow-hidden bg-white"
        aria-hidden="true"
      >
        <CardLayer layerRef={frontLayerRef} src={layerSrc[0]} />
        <CardLayer layerRef={backLayerRef} src={layerSrc[1]} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset var(--sx) var(--sy) var(--sb) rgba(0,0,0,0.21)",
          }}
        />
      </div>

      <div
        aria-hidden="true"
        className="machine-gear pointer-events-none absolute"
      >
        <span
          ref={gearRef}
          className="absolute inset-0 block origin-center will-change-transform"
        >
          <Image
            src="/contact-survey/machine-gear.webp"
            alt=""
            fill
            unoptimized
            sizes="227px"
            className="object-fill"
          />
        </span>
      </div>

      <div
        aria-hidden="true"
        className="machine-mask pointer-events-none absolute"
      >
        <Image
          src="/contact-survey/machine-mask.webp"
          alt=""
          fill
          unoptimized
          sizes="81px"
          className="object-fill"
        />
      </div>

      <span
        aria-hidden="true"
        className="machine-highlight-top pointer-events-none absolute"
        style={{ background: "rgba(201,199,204,0.81)" }}
      />
      <span
        aria-hidden="true"
        className="machine-highlight-side pointer-events-none absolute"
        style={{ background: "rgba(201,198,207,0.43)" }}
      />
    </div>
  );
}

function CardLayer({
  layerRef,
  src,
}: {
  layerRef: RefObject<HTMLDivElement | null>;
  src: string;
}) {
  return (
    <div ref={layerRef} className="absolute inset-0 will-change-transform">
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        sizes="104px"
        className="object-cover"
      />
    </div>
  );
}
