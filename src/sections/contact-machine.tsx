"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import Image from "next/image";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  AUTO_STEP_INTERVAL,
  DRAG_STEP_PX,
  GEAR_STEP_DEG,
  playMachineStep,
  revertMachineStep,
} from "@/animations/contact-machine";

const SLIDE_SRC = "/contact-survey/machine-slide.webp";

/**
 * 取件机叠层（Figma 1468:1495），只在桌面稿面层里显示。
 * 坐标是 1440×800 画板像素，由外层 stage-cover-1440 的 --su 换成与背景相同的 cover 倍率。
 */
export function ContactMachine() {
  const { t } = useLocale();
  const isActive = useScreenActive();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLSpanElement>(null);
  const frontLayerRef = useRef<HTMLDivElement>(null);
  const backLayerRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef(0);
  const angleRef = useRef(0);
  const playingRef = useRef(false);
  const pendingRef = useRef(0);
  const draggingRef = useRef(false);
  const carryRef = useRef(0);
  const lastYRef = useRef(0);
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
      if (!activeRef.current || draggingRef.current) return;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = 0;
        if (!activeRef.current || draggingRef.current || playingRef.current) {
          return;
        }
        api.start();
      }, AUTO_STEP_INTERVAL * 1000);
    };

    api.revert = () => {
      const gear = gearRef.current;
      const outgoing = layer(frontRef.current);
      const incoming = layer(1 - frontRef.current);
      if (!gear || !outgoing || !incoming) return;
      pendingRef.current = 0;
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
          if (pendingRef.current > 0) {
            pendingRef.current -= 1;
            api.start();
            return;
          }
          if (!draggingRef.current) api.arm();
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

  const stageScale = () => {
    const stage = rootRef.current?.closest(".stage-cover-1440");
    if (!(stage instanceof HTMLElement)) return 1;
    return stage.getBoundingClientRect().width / 1440;
  };

  const queueStep = () => {
    if (playingRef.current) pendingRef.current += 1;
    else machine.current.start();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // 指针已经结束时捕获会失败，后面的 pointermove 仍落在按钮上
    }
    draggingRef.current = true;
    carryRef.current = 0;
    lastYRef.current = event.clientY;
    machine.current.clear();
    if (playingRef.current) machine.current.revert();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    const delta = event.clientY - lastYRef.current;
    lastYRef.current = event.clientY;
    if (delta <= 0) return;
    carryRef.current += delta;
    const threshold = DRAG_STEP_PX * stageScale();
    while (carryRef.current >= threshold) {
      carryRef.current -= threshold;
      queueStep();
    }
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    carryRef.current = 0;
    if (!playingRef.current) machine.current.arm();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== " ") return;
    event.preventDefault();
    machine.current.clear();
    if (playingRef.current) machine.current.revert();
    queueStep();
  };

  return (
    <div ref={rootRef} className="hidden md:contents">
      <div
        className="absolute overflow-hidden md:left-[calc(var(--su)*626.54)] md:top-[calc(var(--su)*480)] md:h-[calc(var(--su)*155)] md:w-[calc(var(--su)*103.93)]"
        aria-hidden="true"
      >
        <CardLayer layerRef={frontLayerRef} />
        <CardLayer layerRef={backLayerRef} />
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow:
              "inset calc(var(--su) * 12) calc(var(--su) * 4) calc(var(--su) * 9.4) rgba(0,0,0,0.21)",
          }}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute opacity-40 md:left-[calc(var(--su)*730)] md:top-[calc(var(--su)*480)] md:h-[calc(var(--su)*188)] md:w-[calc(var(--su)*81)]"
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
        className="pointer-events-none absolute md:left-[calc(var(--su)*732)] md:top-[calc(var(--su)*477)] md:h-[calc(var(--su)*6)] md:w-[calc(var(--su)*79)] md:blur-[2px]"
        style={{ background: "rgba(201,199,204,0.81)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute md:left-[calc(var(--su)*733)] md:top-[calc(var(--su)*637)] md:h-[calc(var(--su)*28)] md:w-[calc(var(--su)*6)] md:blur-[2px]"
        style={{ background: "rgba(201,198,207,0.43)" }}
      />

      <div className="absolute md:left-[calc(var(--su)*822.72)] md:top-[calc(var(--su)*456.41)] md:h-[calc(var(--su)*214.11)] md:w-[calc(var(--su)*207.9)]">
        <button
          type="button"
          aria-label={t("contactSurvey.gearAria")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          onTouchEnd={(event) => event.stopPropagation()}
          className="absolute inset-0 cursor-grab overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-grey-400)] active:cursor-grabbing"
          style={{ clipPath: "circle(calc(var(--su) * 74) at 50% 50%)" }}
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
              sizes="208px"
              className="object-fill"
            />
          </span>
        </button>
      </div>
    </div>
  );
}

function CardLayer({
  layerRef,
}: {
  layerRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={layerRef} className="absolute inset-0 will-change-transform">
      <span className="absolute block md:left-[calc(var(--su)*-9.067)] md:top-[calc(var(--su)*0.611)] md:h-[calc(var(--su)*152.763)] md:w-[calc(var(--su)*123.059)]">
        <Image
          src={SLIDE_SRC}
          alt=""
          fill
          unoptimized
          sizes="124px"
          className="object-fill"
        />
      </span>
    </div>
  );
}
