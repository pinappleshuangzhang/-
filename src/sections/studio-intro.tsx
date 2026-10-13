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
import { BrandLogo } from "@/components/ui/brand-logo";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SplitWords } from "@/components/ui/split-words";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { OrgFoundingMobile } from "@/sections/org-founding-mobile";
import { StudioIntroCards } from "@/sections/studio-intro-cards";
import layer01Img from "../../public/archive-ga-004/background-layers/layer-01.webp";
import layer03Img from "../../public/archive-ga-004/background-layers/layer-03.webp";
import layer04Img from "../../public/archive-ga-004/background-layers/layer-04.webp";
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

/** 图二整张大卡：信封式 3D 翻入/退场的单一目标 */
function cardGroup(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>("[data-studio-card-group]");
}

/**
 * 《工作室简介》第三屏（桌面态，设计稿 1486:5 / 1486:63）。
 * 两步屏内状态机（registerScrollInterceptor）：
 *   step0 图一舞台（圆环持续旋转）→ 下滑 → 一条连续时间轴：
 *   以视口中心放大（由慢到快）→ 图一淡出 → 图二整卡信封式翻入（step2）
 *   → 上滑 → 反向连续时间轴：整卡退场 → 舞台从放大态回缩至原始态（回 step0）
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

  const stepRef = useRef<0 | 2>(0);
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
      const group = cardGroup(cards);
      if (group) gsap.set(group, CARD_HIDDEN);
      setSondavenHidden(cards);
    }
  }, []);

  // 初始几何：舞台以视口中心缩放，卡片带透视（信封 3D 翻入）
  useEffect(() => {
    if (isMobileViewport) return;
    const stage = stageRef.current;
    const cards = cardsRef.current;
    if (stage) gsap.set(stage, { transformOrigin: "50% 50%" });
    const group = cards ? cardGroup(cards) : null;
    if (group) {
      gsap.set(group, {
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

      const group = cardGroup(cards);
      if (!group) return false;

      if (reducedMotion) {
        if (down && step === 0) {
          stepRef.current = 2;
          gsap.set(stage, { autoAlpha: 0 });
          gsap.set(cards, { autoAlpha: 1 });
          gsap.set(group, CARD_SHOWN);
          setSondavenVisible(cards);
        } else if (!down && step === 2) {
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
          // 一条连续时间轴：放大与淡出同步进行，图一未完全消失时
          // 卡片已开始信封翻入，画面无空档
          stepRef.current = 2;
          const tl = gsap.timeline();
          tl.to(stage, { scale: STAGE_ZOOM_SCALE, ...ZOOM_IN }, 0);
          tl.to(
            stage,
            { autoAlpha: 0, duration: 2.0, ease: "power2.in" },
            0.2,
          );
          tl.set(cards, { autoAlpha: 1 }, 0.55);
          // 整卡信封翻入放缓，文字在卡片大体落定后再逐词浮现
          tl.fromTo(
            group,
            CARD_HIDDEN,
            { ...CARD_SHOWN, duration: 2.6, ease: "power4.out" },
            0.55,
          );
          tl.add(playSondavenReveal(cards), 1.9);
          begin(tl);
          return true;
        }
        return false; // step2 继续下滑 → 交回分页器切下一屏
      }
      if (step === 2) {
        // 一条连续时间轴：卡片反向退场 → 舞台放大态 → 回缩至原始态
        stepRef.current = 0;
        const tl = gsap.timeline();
        tl.to(group, { ...CARD_HIDDEN, duration: 0.7, ease: "power4.in" }, 0);
        tl.set(cards, { autoAlpha: 0 });
        tl.add(() => setSondavenHidden(cards));
        tl.set(stage, { autoAlpha: 1, scale: STAGE_ZOOM_SCALE });
        tl.to(stage, { scale: 1, ...ZOOM_OUT });
        begin(tl);
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
      {/* 图一舞台：设计稿 1440×800，元素以视口中心锚定按 --su 换算；底色对稿 #E0E0E0。
          层序对稿（底→顶）：layer-04 → layer-03 → layer-01 */}
      <div ref={stageRef} className="absolute inset-0 bg-[#E0E0E0]">
        {/* layer-04 小圆环（逆时针，最底） */}
        <div className="absolute left-1/2 top-1/2 ml-[calc(var(--su)*-292)] mt-[calc(var(--su)*-236)] h-[calc(var(--su)*542)] w-[calc(var(--su)*541)] overflow-hidden rounded-full">
          <Image
            ref={ringInnerRef}
            src={layer04Img}
            alt=""
            sizes="(min-width: 768px) 38vw, 100vw"
            className="h-full w-full"
          />
        </div>
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
        {/* layer-01 前景覆盖层（带透明中心），压在双圆环之上 */}
        <Image
          src={layer01Img}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* 中心口号组：分隔线 + 品牌 logo（缩小版 BrandLogo）+ 两行文案，
            全部作为 sd-word 参与同一套逐词随机浮现 */}
        <div
          data-sd-words
          data-sd-delay="0.1"
          aria-label={`${t("studioIntro.line1")} ${t("studioIntro.line2")}`}
          className="absolute left-1/2 top-1/2 ml-[calc(var(--su)*-80)] mt-[calc(var(--su)*-23)] w-[calc(var(--su)*160)]"
        >
          <div
            aria-hidden="true"
            className="mx-auto flex w-[calc(var(--su)*138)] items-center justify-between"
          >
            <span className="sd-word h-[0.3px] w-[calc(var(--su)*49)] bg-grey-300 opacity-0" />
            <span className="sd-word opacity-0">
              <BrandLogo className="block size-[calc(var(--su)*12)] text-grey-400" />
            </span>
            <span className="sd-word h-[0.3px] w-[calc(var(--su)*51)] bg-grey-300 opacity-0" />
          </div>
          <p
            aria-hidden="true"
            className="mt-[calc(var(--su)*6)] text-center font-serif-sc text-[length:calc(var(--su)*16)] leading-[calc(var(--su)*23)] text-grey-400"
          >
            <SplitWords text={t("studioIntro.line1")} />
            <br />
            <SplitWords text={t("studioIntro.line2")} />
          </p>
        </div>
      </div>
      {/* 图二卡片层：初始隐藏，step2 信封式入场；文字动画由本组件手动驱动 */}
      <StudioIntroCards ref={cardsRef} />
    </ScreenShell>
  );
}
