"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import {
  CARD_HIDDEN,
  CARD_SHOWN,
  STAGE_ZOOM_SCALE,
  ZOOM_IN,
  ZOOM_OUT,
  startLayerSpin,
  type SpinLayer,
} from "@/animations/studio-intro";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { OrgFoundingMobile } from "@/sections/org-founding-mobile";
import { StudioIntroCards } from "@/sections/studio-intro-cards";
import layer01Img from "../../public/archive-ga-004/background-layers/layer-01.webp";
import layer03Img from "../../public/archive-ga-004/background-layers/layer-03.webp";
import layer04Img from "../../public/archive-ga-004/background-layers/layer-04.webp";
import markDarkImg from "../../public/studio-intro/plate-mark.svg";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobileViewport(callback: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileViewportSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileViewportServerSnapshot() {
  return false;
}

/** 入场顺序（自下而上）：data-studio-card 数值即次序 */
function orderedCards(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-studio-card]"),
  ).sort((a, b) => Number(a.dataset.studioCard) - Number(b.dataset.studioCard));
}

/**
 * 《工作室简介》第三屏（桌面态，设计稿 1486:5 / 1486:63）。
 * 三步屏内状态机（registerScrollInterceptor）：
 *   step0 图一舞台（圆环持续旋转）→ 下滑 → step1 整体以视口中心放大
 *   → 下滑 → step2 图一隐藏、图二卡片信封式自下而上入场
 *   → 上滑 → 一条连续时间轴：卡片反向退场 → 舞台从放大态回缩至原始态（直回 step0）
 * 移动端沿用原组织记录屏 OrgFoundingMobile。
 */
export function StudioIntro() {
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { phase, registerScrollInterceptor } = useSectionPager();
  const { t } = useLocale();
  const isMobileViewport = useSyncExternalStore(
    subscribeMobileViewport,
    getMobileViewportSnapshot,
    getMobileViewportServerSnapshot,
  );

  // 首次 idle 后记住：回切时幕布揭开阶段即恢复旋转，不再等 idle
  const [introSettled, setIntroSettled] = useState(false);
  if (isActive && phase === "idle" && !introSettled) {
    setIntroSettled(true);
  }

  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ringOuterRef = useRef<HTMLImageElement>(null);
  const ringInnerRef = useRef<HTMLImageElement>(null);

  const stepRef = useRef<0 | 1 | 2>(0);
  const cooldownUntilRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  /** 回到 step0 的即时复位（离屏 / 初始化用） */
  const resetToStage = useCallback(() => {
    tlRef.current?.kill();
    tlRef.current = null;
    stepRef.current = 0;
    cooldownUntilRef.current = 0;
    const stage = stageRef.current;
    const cards = cardsRef.current;
    if (stage) gsap.set(stage, { scale: 1, autoAlpha: 1 });
    if (cards) {
      gsap.set(cards, { autoAlpha: 0 });
      gsap.set(orderedCards(cards), CARD_HIDDEN);
      setSondavenHidden(cards);
    }
  }, []);

  // 初始几何：舞台以视口中心缩放，卡片带透视（信封 3D 翻入）
  useEffect(() => {
    if (isMobileViewport) return;
    const stage = stageRef.current;
    const cards = cardsRef.current;
    if (stage) gsap.set(stage, { transformOrigin: "50% 50%" });
    if (cards) {
      gsap.set(orderedCards(cards), {
        transformPerspective: 900,
        transformOrigin: "50% 50%",
        force3D: true,
      });
    }
    resetToStage();
  }, [isMobileViewport, resetToStage]);

  // 离屏即复位到 step0，回屏总是从图一开始
  useEffect(() => {
    if (isActive || isMobileViewport) return;
    resetToStage();
  }, [isActive, isMobileViewport, resetToStage]);

  // 圆环旋转：切屏安定后启动，失活即移除 ticker 停帧；图二态跳过写入
  const spinActive =
    isActive &&
    !isMobileViewport &&
    !reducedMotion &&
    (introSettled || phase === "idle");
  useEffect(() => {
    if (!spinActive) return;
    const layers: SpinLayer[] = [];
    if (ringOuterRef.current) layers.push({ el: ringOuterRef.current, dir: 1 });
    if (ringInnerRef.current) layers.push({ el: ringInnerRef.current, dir: -1 });
    if (layers.length === 0) return;
    return startLayerSpin(layers, () => stepRef.current === 2);
  }, [spinActive]);

  // 三步滚动状态机
  useEffect(() => {
    if (!isActive || isMobileViewport) return;
    return registerScrollInterceptor((deltaY) => {
      const stage = stageRef.current;
      const cards = cardsRef.current;
      if (!stage || !cards) return false;
      const now = performance.now();
      // 动画期间吃掉滚轮，结束后留 300ms 吃触控板惯性
      if (now < cooldownUntilRef.current) return true;
      const down = deltaY > 0;
      const step = stepRef.current;

      if (reducedMotion) {
        if (down && step === 0) {
          stepRef.current = 1;
          gsap.set(stage, { scale: STAGE_ZOOM_SCALE });
        } else if (down && step === 1) {
          stepRef.current = 2;
          gsap.set(stage, { autoAlpha: 0 });
          gsap.set(cards, { autoAlpha: 1 });
          gsap.set(orderedCards(cards), CARD_SHOWN);
          setSondavenVisible(cards);
        } else if (!down && step > 0) {
          resetToStage();
        } else {
          return false;
        }
        cooldownUntilRef.current = now + 250;
        return true;
      }

      const begin = (tl: gsap.core.Timeline) => {
        tlRef.current?.kill();
        tlRef.current = tl;
        cooldownUntilRef.current = now + tl.totalDuration() * 1000 + 300;
      };

      if (down) {
        if (step === 0) {
          stepRef.current = 1;
          begin(
            gsap
              .timeline()
              .to(stage, { scale: STAGE_ZOOM_SCALE, ...ZOOM_IN }),
          );
          return true;
        }
        if (step === 1) {
          stepRef.current = 2;
          const tl = gsap.timeline();
          tl.to(stage, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 0);
          tl.set(cards, { autoAlpha: 1 }, 0);
          tl.fromTo(
            orderedCards(cards),
            CARD_HIDDEN,
            { ...CARD_SHOWN, duration: 1.15, ease: "power4.out", stagger: 0.12 },
            0.2,
          );
          tl.add(playSondavenReveal(cards), 0.7);
          begin(tl);
          return true;
        }
        return false; // step2 继续下滑 → 交回分页器切下一屏
      }
      if (step === 2) {
        // 一条连续时间轴：卡片反向退场 → 舞台放大态 → 回缩至原始态
        stepRef.current = 0;
        const tl = gsap.timeline();
        tl.to(
          orderedCards(cards).reverse(),
          { ...CARD_HIDDEN, duration: 0.7, ease: "power4.in", stagger: 0.08 },
          0,
        );
        tl.set(cards, { autoAlpha: 0 });
        tl.add(() => setSondavenHidden(cards));
        tl.set(stage, { autoAlpha: 1, scale: STAGE_ZOOM_SCALE });
        tl.to(stage, { scale: 1, ...ZOOM_OUT });
        begin(tl);
        return true;
      }
      if (step === 1) {
        stepRef.current = 0;
        begin(gsap.timeline().to(stage, { scale: 1, ...ZOOM_OUT }));
        return true;
      }
      return false; // step0 继续上滑 → 交回分页器切上一屏
    });
  }, [
    isActive,
    isMobileViewport,
    reducedMotion,
    registerScrollInterceptor,
    resetToStage,
  ]);

  if (isMobileViewport) {
    return <OrgFoundingMobile />;
  }

  return (
    <ScreenShell aria-label={t("studioIntro.aria")}>
      {/* 图一舞台：设计稿 1440×800，元素以视口中心锚定按 --su 换算 */}
      <div ref={stageRef} className="absolute inset-0">
        <Image
          src={layer01Img}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* layer-03 大圆环（顺时针）：圆形裁切避免矩形图角随旋转扫入画面 */}
        <div className="absolute left-1/2 top-1/2 ml-[calc(var(--su)*-563)] mt-[calc(var(--su)*-612)] h-[calc(var(--su)*1175)] w-[calc(var(--su)*1162)] overflow-hidden rounded-full">
          <Image
            ref={ringOuterRef}
            src={layer03Img}
            alt=""
            sizes="(min-width: 768px) 81vw, 100vw"
            className="h-full w-full"
          />
        </div>
        {/* layer-04 小圆环（逆时针） */}
        <div className="absolute left-1/2 top-1/2 ml-[calc(var(--su)*-292)] mt-[calc(var(--su)*-236)] h-[calc(var(--su)*542)] w-[calc(var(--su)*541)] overflow-hidden rounded-full">
          <Image
            ref={ringInnerRef}
            src={layer04Img}
            alt=""
            sizes="(min-width: 768px) 38vw, 100vw"
            className="h-full w-full"
          />
        </div>
        {/* 中心口号组：分隔线 + G 标 + 两行文案（随整屏逐行入场） */}
        <div className="absolute left-1/2 top-1/2 ml-[calc(var(--su)*-80)] mt-[calc(var(--su)*-23)] w-[calc(var(--su)*160)]">
          <div className="flex items-center justify-between">
            <span
              aria-hidden="true"
              className="h-px w-[calc(var(--su)*49)] bg-grey-300"
            />
            <Image
              src={markDarkImg}
              alt=""
              unoptimized
              className="h-[calc(var(--su)*14)] w-[calc(var(--su)*13)]"
            />
            <span
              aria-hidden="true"
              className="h-px w-[calc(var(--su)*51)] bg-grey-300"
            />
          </div>
          <p
            data-sd-lines
            data-sd-delay="0.5"
            aria-label={`${t("studioIntro.line1")} ${t("studioIntro.line2")}`}
            className="mt-[calc(var(--su)*12)] text-center font-serif-sc text-[length:calc(var(--su)*16)] leading-[calc(var(--su)*26)] text-grey-400"
          >
            <span aria-hidden="true" className="block overflow-hidden">
              <span className="sd-line block opacity-0">
                {t("studioIntro.line1")}
              </span>
            </span>
            <span aria-hidden="true" className="block overflow-hidden">
              <span className="sd-line block opacity-0">
                {t("studioIntro.line2")}
              </span>
            </span>
          </p>
        </div>
      </div>
      {/* 图二卡片层：初始隐藏，step2 信封式入场；文字动画由本组件手动驱动 */}
      <StudioIntroCards ref={cardsRef} />
    </ScreenShell>
  );
}
