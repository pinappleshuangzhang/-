"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import { startLayerSpin, type SpinLayer } from "@/animations/studio-intro";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SplitWords } from "@/components/ui/split-words";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import layer01Img from "../../public/archive-ga-004/background-layers/layer-01.webp";
import layer03Img from "../../public/archive-ga-004/background-layers/layer-03.webp";
import layer04Img from "../../public/archive-ga-004/background-layers/layer-04.webp";
import cardBottomImg from "../../public/studio-intro/mobile/card-m-bottom.svg";
import cardPhotoImg from "../../public/studio-intro/mobile/card-m-photo.svg";
import cardTopImg from "../../public/studio-intro/mobile/card-m-top.svg";
import cardWorkImg from "../../public/studio-intro/mobile/card-m-work.svg";
import markG20Img from "../../public/studio-intro/mark-g-20.svg";
import plateMarkImg from "../../public/studio-intro/plate-mark.svg";
import platePhotoImg from "../../public/studio-intro/plate-photo.webp";

/** 斜切照片遮罩（移动稿 350×263，斜边朝左上） */
const CARD_MASK_STYLE = {
  WebkitMaskImage: "url(/studio-intro/mobile/card-m-mask.svg)",
  maskImage: "url(/studio-intro/mobile/card-m-mask.svg)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

// 对稿：Libre Bodoni 6px / 行高 14 / 全大写（装饰性对位值，按稿面原值）
const CAPTION_CLASS =
  "absolute font-bodoni text-[6px] uppercase leading-[14px] text-grey-400";

/** 正文行：行内逐词随机浮现（与全站同一套 sd-words 动画） */
function RevealLine({ text }: { text: string }) {
  return (
    <span aria-hidden="true" className="block">
      <SplitWords text={text} />
    </span>
  );
}

/**
 * 《工作室简介》第三屏移动端（Figma 1489:447 / 1489:477，390 画板）。
 * 图一为桌面舞台的 0.91 倍裁片（同源图层，中心锚定 + 上下渐变色条）。
 * 交互：一次下滑 → 图一整层淡出（无放大）→ 图二渐入 + 逐词文字；
 * 图二内容区可原生滚动（矮视口兜底），顶部再上滑返回图一，
 * 首尾边界交回分页器切屏。
 */
export function StudioIntroMobile() {
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { registerScrollInterceptor } = useSectionPager();
  const { t, locale } = useLocale();

  const stageRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
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
    if (stage) gsap.set(stage, { autoAlpha: 1 });
    if (cards) {
      gsap.set(cards, { autoAlpha: 0 });
      setSondavenHidden(cards);
    }
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    resetToStage();
  }, [resetToStage]);

  // 图层组按实际可视高度 ÷ 844 等比缩放：真机 Safari 工具栏会压缩视口，
  // 固定像素中心锚定会裁顶、底部露出图片硬边。Safari 15 不支持 calc 长度
  // 相除，故用 JS 写入 scale；中心文字组不缩放保证可读性。
  useEffect(() => {
    const apply = () => {
      const stage = stageRef.current;
      const cluster = clusterRef.current;
      if (!stage || !cluster) return;
      gsap.set(cluster, { scale: stage.clientHeight / 844 });
    };
    apply();
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
    };
  }, []);

  // 离屏即复位，回屏总是从图一开始
  useEffect(() => {
    if (isActive) return;
    resetToStage();
  }, [isActive, resetToStage]);

  // 圆环旋转：激活时启动，失活移除 ticker 停帧；图二态跳过写入
  useEffect(() => {
    if (!isActive || reducedMotion) return;
    const layers: SpinLayer[] = [];
    if (ringOuterRef.current) layers.push({ el: ringOuterRef.current, dir: 1 });
    if (ringInnerRef.current) layers.push({ el: ringInnerRef.current, dir: -1 });
    if (layers.length === 0) return;
    return startLayerSpin(layers, () => stepRef.current === 2);
  }, [isActive, reducedMotion]);

  // 两步滚动状态机：一次手势一步；图二态内部原生滚动
  useEffect(() => {
    if (!isActive) return;
    return registerScrollInterceptor((deltaY) => {
      const stage = stageRef.current;
      const cards = cardsRef.current;
      const scroller = scrollerRef.current;
      if (!stage || !cards || !scroller) return false;
      const now = performance.now();
      if (now < cooldownUntilRef.current) return true;
      const down = deltaY > 0;
      const step = stepRef.current;

      if (reducedMotion) {
        if (down && step === 0) {
          stepRef.current = 2;
          scroller.scrollTop = 0;
          gsap.set(stage, { autoAlpha: 0 });
          gsap.set(cards, { autoAlpha: 1 });
          setSondavenVisible(cards);
          cooldownUntilRef.current = now + 250;
          return true;
        }
        if (!down && step === 2 && scroller.scrollTop <= 0) {
          resetToStage();
          cooldownUntilRef.current = now + 250;
          return true;
        }
        // 图二态滚轮滚动内容
        if (step === 2) {
          const atBottom =
            scroller.scrollTop + scroller.clientHeight >=
            scroller.scrollHeight - 1;
          if (down && atBottom) return false;
          if (!down && scroller.scrollTop <= 0) return false;
          scroller.scrollTop += deltaY;
          return true;
        }
        return false;
      }

      const begin = (tl: gsap.core.Timeline) => {
        tlRef.current?.kill();
        tlRef.current = tl;
        cooldownUntilRef.current = now + tl.totalDuration() * 1000 + 300;
      };

      if (step === 0) {
        if (!down) return false; // 上滑交回分页器切上一屏
        // 图一整层淡出（无放大），图二交叠渐入 + 逐词文字
        stepRef.current = 2;
        scroller.scrollTop = 0;
        const tl = gsap.timeline();
        tl.to(stage, { autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 0);
        tl.fromTo(
          cards,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          0.35,
        );
        tl.add(playSondavenReveal(cards), 0.55);
        begin(tl);
        return true;
      }

      // step2：先消化内部滚动，再谈切换
      const atTop = scroller.scrollTop <= 0;
      const atBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if (down) {
        if (atBottom) return false; // 交回分页器切下一屏
        scroller.scrollTop += deltaY;
        return true;
      }
      if (!atTop) {
        scroller.scrollTop += deltaY;
        return true;
      }
      // 顶部继续上滑：返回图一
      stepRef.current = 0;
      const tl = gsap.timeline();
      tl.to(cards, { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0);
      tl.add(() => setSondavenHidden(cards));
      tl.to(stage, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 0.3);
      begin(tl);
      return true;
    });
  }, [isActive, reducedMotion, registerScrollInterceptor, resetToStage]);

  const workBody = `${t("studioIntro.card2Body1")}${
    locale === "zh" ? "，" : ", "
  }${t("studioIntro.card2Body2")}`;

  return (
    <ScreenShell aria-label={t("studioIntro.aria")}>
      {/* 图一舞台：桌面图层同源，按移动稿 0.91 倍、视口中心锚定裁切。
          层序对稿（底→顶）：layer-04 → layer-03 → layer-01 */}
      <div ref={stageRef} className="absolute inset-0 bg-white">
        {/* 缩放簇：零尺寸锚点定在视口中心，JS 按 clientHeight/844 写 scale，
            子元素按 844 画板中心相对坐标排布 */}
        <div
          ref={clusterRef}
          className="absolute left-1/2 top-1/2 size-0 origin-top-left"
        >
          {/* layer-04 小圆环（逆时针，最底） */}
          <div className="absolute left-0 top-0 ml-[-263.6px] mt-[-227.8px] size-[492.6px] overflow-hidden rounded-full">
            <Image
              ref={ringInnerRef}
              src={layer04Img}
              alt=""
              sizes="(max-width: 767px) 130vw, 38vw"
              className="h-full w-full"
            />
          </div>
          {/* layer-03 大圆环（顺时针）：还原整圆便于旋转，圆形裁切 */}
          <div className="absolute left-0 top-0 ml-[-510.2px] mt-[-569.9px] h-[1069.1px] w-[1057.1px] overflow-hidden rounded-full">
            <Image
              ref={ringOuterRef}
              src={layer03Img}
              alt=""
              sizes="(max-width: 767px) 100vw, 81vw"
              className="h-full w-full"
            />
          </div>
          {/* layer-01 前景覆盖层（带透明中心） */}
          <div className="absolute left-0 top-0 ml-[-653.4px] mt-[-377px] h-[727.8px] w-[1310.9px]">
            <Image
              src={layer01Img}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 100vw"
              className="object-cover"
            />
          </div>
          {/* 上下渐变色条：贴齐 844 画板上下缘，与 layer-01 上下缘各重叠 1px 盖住接缝 */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 ml-[-700px] mt-[-423px] h-[46px] w-[1400px] bg-gradient-to-r from-[#F3F5F9] via-[#ECEEF2] to-[#E8EAEE]"
          />
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 ml-[-700px] mt-[350px] h-[73px] w-[1400px] bg-gradient-to-r from-[#E4E5E9] via-[#E0E2E6] to-[#DFE1E5]"
          />
        </div>
        {/* 中心口号组：分隔线 + 品牌 logo + 两行文案，逐词随机浮现 */}
        <div
          data-sd-words
          data-sd-delay="0.2"
          aria-label={`${t("studioIntro.line1")} ${t("studioIntro.line2")}`}
          className="absolute left-1/2 top-1/2 ml-[-80px] mt-[-26px] w-[160px]"
        >
          <div
            aria-hidden="true"
            className="mx-auto flex w-[138px] items-center justify-between"
          >
            <span className="sd-word h-[0.3px] w-[49px] bg-grey-300 opacity-0" />
            <span className="sd-word opacity-0">
              <BrandLogo className="block size-[12px] text-grey-400" />
            </span>
            <span className="sd-word h-[0.3px] w-[51px] bg-grey-300 opacity-0" />
          </div>
          <p
            aria-hidden="true"
            className="mt-2 text-center font-serif-sc text-14 leading-[20px] text-grey-400"
          >
            <SplitWords text={t("studioIntro.line1")} />
            <br />
            <SplitWords text={t("studioIntro.line2")} />
          </p>
        </div>
      </div>
      {/* 图二卡片层：初始隐藏，step2 渐入；文字动画手动驱动。
          data-lenis-prevent：分页模式下 Lenis 会拦截 touchmove，
          无此标记的嵌套滚动容器在 iOS 上无法原生滚动 */}
      <div
        ref={cardsRef}
        data-sd-global-ignore
        className="invisible absolute inset-0 bg-[#E0E2E6] opacity-0"
      >
        <div
          ref={scrollerRef}
          data-pager-scroller
          data-lenis-prevent=""
          className="absolute inset-0 overflow-y-scroll overscroll-y-contain touch-pan-y"
        >
          {/* 画布：390 画板纵向 844，矮视口内部滚动；左右页边 20px */}
          <div className="relative h-[844px] w-full">
            {/* 上卡 + 想做的事 */}
            <div className="absolute left-5 right-5 top-[86px] h-[177.7px]">
              <Image src={cardTopImg} alt="" fill unoptimized sizes="100vw" />
              <p className={`${CAPTION_CLASS} left-[12px] top-[12px]`}>
                39.9042° N 116.4074° E
              </p>
              <p className={`${CAPTION_CLASS} right-[12px] top-[12px]`}>
                Real · Tangible
              </p>
              <div
                data-sd-words
                aria-label={`${t("studioIntro.card1Title")} ${t("studioIntro.card1Body")}`}
                className="absolute left-[calc(50%-120px)] top-[50px] font-serif-sc text-12 leading-[23px] text-grey-400"
              >
                <RevealLine text={t("studioIntro.card1Title")} />
                <RevealLine text={t("studioIntro.card1Body")} />
              </div>
            </div>
            {/* 下卡（垂直翻转）+ GRAVA 竖排与 G 标 */}
            <div className="absolute left-5 right-5 top-[646.3px] h-[177.7px]">
              <Image
                src={cardBottomImg}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                className="rotate-180"
              />
              {/* vertical-rl + rotate180 = 西文侧躺、自下而上读 */}
              <p
                className="absolute left-[12px] top-[76.7px] rotate-180 font-bodoni text-10 text-grey-400"
                style={{ writingMode: "vertical-rl" }}
              >
                GRAVA
              </p>
              <Image
                src={markG20Img}
                alt=""
                unoptimized
                className="absolute left-1/2 top-[83.7px] ml-[-10px] size-[20px]"
              />
            </div>
            {/* 照片卡玻璃形底 */}
            <div className="absolute left-5 right-5 top-[218.9px] h-[263px]">
              <Image src={cardPhotoImg} alt="" fill unoptimized sizes="100vw" />
            </div>
            {/* 铭牌照片：按稿斜切裁片 */}
            <div
              className="absolute left-5 right-5 top-[218.9px] h-[263px]"
              style={CARD_MASK_STYLE}
            >
              <div className="absolute left-[-14px] top-[-83.3px] h-[486.7px] w-[calc(100%+14px)]">
                <Image
                  src={platePhotoImg}
                  alt={t("studioIntro.plateAlt")}
                  fill
                  sizes="(max-width: 767px) 100vw, 43vw"
                  className="object-cover"
                />
              </div>
              <Image
                src={plateMarkImg}
                alt=""
                unoptimized
                className="absolute left-[171px] top-[139px] h-[8.3px] w-[7.7px]"
              />
            </div>
            {/* 工作方式卡（旋转 180°）+ 文案 */}
            <div className="absolute left-5 right-5 top-[458.9px] h-[233px]">
              <Image
                src={cardWorkImg}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                className="rotate-180"
              />
              <div
                data-sd-words
                aria-label={`${t("studioIntro.card2Title")} ${workBody}`}
                className="absolute left-[calc(50%-120px)] top-[59px] w-[240px] font-serif-sc text-12 leading-[23px] text-grey-400"
              >
                <RevealLine text={t("studioIntro.card2Title")} />
                <RevealLine text={workBody} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
