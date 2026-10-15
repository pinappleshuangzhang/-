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
import cardBlImg from "../../public/studio-intro/mobile/card-m-bl.svg";
import cardBrImg from "../../public/studio-intro/mobile/card-m-br.svg";
import cardTlImg from "../../public/studio-intro/mobile/card-m-tl.svg";
import cardTrImg from "../../public/studio-intro/mobile/card-m-tr.svg";
import markG20Img from "../../public/studio-intro/mark-g-20.svg";
import platePhotoMobileImg from "../../public/studio-intro/mobile/plate-photo.webp";

/** 斜切遮罩的水平视觉中心，相对 164.618 宽的包围盒。铭牌对齐这里。 */
const PLATE_VISUAL_CENTER = 91.095 / 164.618;
/** 铭牌照片 728×974，用于按卡片比例计算封面裁切 */
const PLATE_IMAGE_ASPECT = 728 / 974;

/** 斜切照片遮罩（移动稿 164.6×364，已按稿旋转 180°） */
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
function RevealLine({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={className ? `block ${className}` : "block"}>
      <SplitWords text={text} wrap />
    </span>
  );
}

/**
 * 《工作室简介》第三屏移动端（Figma 1489:447 / 1489:477，390 画板）。
 * 图一为桌面舞台的 0.91 倍裁片（同源图层，中心锚定 + 上下渐变色条）。
 * 交互：一次下滑 → 图一整层淡出（无放大）→ 图二渐入 + 逐词文字；
 * 图二页边距固定，卡片随可视高度拉伸或压缩，照片不变形；顶部再上滑返回图一，
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
  const boardWrapRef = useRef<HTMLDivElement>(null);
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

  // 图二铺满可视区域（visualViewport，含 Safari 工具栏）。页边距固定，
  // 卡片用百分比拉伸或压缩，不整板缩放，也不出现内部滚动。
  useEffect(() => {
    const apply = () => {
      const layer = cardsRef.current;
      const wrap = boardWrapRef.current;
      if (!layer || !wrap) return;
      const viewport = window.visualViewport;
      const width = viewport?.width ?? layer.clientWidth;
      const height = viewport?.height ?? layer.clientHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      const offsetLeft = viewport?.offsetLeft ?? 0;
      wrap.style.width = `${width}px`;
      wrap.style.height = `${height}px`;
      wrap.style.marginLeft = `${offsetLeft}px`;
      wrap.style.marginTop = `${offsetTop}px`;
      const photo = wrap.querySelector<HTMLElement>("[data-plate-photo]");
      if (photo && photo.clientWidth > 0 && photo.clientHeight > 0) {
        const renderedWidth = Math.max(
          photo.clientWidth,
          photo.clientHeight * PLATE_IMAGE_ASPECT,
        );
        const overflow = renderedWidth - photo.clientWidth;
        const shift =
          photo.clientWidth * PLATE_VISUAL_CENTER - photo.clientWidth / 2;
        const position = overflow > 1 ? 0.5 - shift / overflow : 0.5;
        photo.style.objectPosition = `${position * 100}% 50%`;
      }
      // 正文在卡片里垂直居中。会盖住上下小字时，两段用同一个比例缩小。
      const copies = [
        ...wrap.querySelectorAll<HTMLElement>("[data-card-copy]"),
      ];
      copies.forEach((copy) => {
        copy.style.transform = "none";
      });
      const gap = 8;
      let scale = 1;
      for (const copy of copies) {
        const card = copy.parentElement?.parentElement;
        if (!card) continue;
        const cardRect = card.getBoundingClientRect();
        const copyRect = copy.getBoundingClientRect();
        if (copyRect.height <= 0 || cardRect.height <= 0) continue;
        const center = cardRect.top + cardRect.height / 2;
        let topBound = cardRect.top;
        let bottomBound = cardRect.bottom;
        for (const caption of card.querySelectorAll("p")) {
          const rect = caption.getBoundingClientRect();
          if (rect.height <= 0) continue;
          const captionMid = rect.top + rect.height / 2;
          if (captionMid < center) topBound = Math.max(topBound, rect.bottom);
          else bottomBound = Math.min(bottomBound, rect.top);
        }
        const room = Math.min(
          center - topBound - gap,
          bottomBound - center - gap,
        );
        if (room > 0) scale = Math.min(scale, (room * 2) / copyRect.height);
      }
      if (scale < 1) {
        for (const copy of copies) {
          copy.style.transform = `scale(${scale})`;
        }
      }
    };
    apply();
    document.fonts.ready.then(apply);
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
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
        // 图一淡出放慢到 2s；图二在它明显变淡后再渐入
        stepRef.current = 2;
        scroller.scrollTop = 0;
        const tl = gsap.timeline();
        tl.to(stage, { autoAlpha: 0, duration: 2, ease: "power2.in" }, 0);
        tl.fromTo(
          cards,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.2, ease: "power2.out" },
          1.2,
        );
        tl.add(playSondavenReveal(cards), 1.6);
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

  const isEn = locale === "en";
  const sloganLines = [
    t("studioIntro.line1"),
    t("studioIntro.line2"),
    t("studioIntro.line3"),
    t("studioIntro.line4"),
  ].filter((line) => line.length > 0);
  const card2Lines =
    locale === "zh"
      ? [
          t("studioIntro.card2Title"),
          `${t("studioIntro.card2Body1")}，${t("studioIntro.card2Body2")}`,
        ]
      : [
          t("studioIntro.card2Title"),
          t("studioIntro.card2Body1"),
          t("studioIntro.card2Body2"),
          t("studioIntro.card2Body3"),
        ].filter((line) => line.length > 0);

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
          {/* layer-04 小圆环（逆时针，最底）。
              注：稿面构图整体偏上 13px（上色带 45 / 下色带 72），真机矮视口下
              上下留白不等；此处整组下移 13.5px 改为严格垂直居中，上下各约 59px */}
          <div className="absolute left-0 top-0 ml-[-263.6px] mt-[-214.3px] size-[492.6px] overflow-hidden rounded-full">
            <Image
              ref={ringInnerRef}
              src={layer04Img}
              alt=""
              sizes="(max-width: 767px) 130vw, 38vw"
              className="h-full w-full"
            />
          </div>
          {/* layer-03 大圆环（顺时针）：还原整圆便于旋转，圆形裁切 */}
          <div className="absolute left-0 top-0 ml-[-510.2px] mt-[-556.4px] h-[1069.1px] w-[1057.1px] overflow-hidden rounded-full">
            <Image
              ref={ringOuterRef}
              src={layer03Img}
              alt=""
              sizes="(max-width: 767px) 100vw, 81vw"
              className="h-full w-full"
            />
          </div>
          {/* layer-01 前景覆盖层（带透明中心） */}
          <div className="absolute left-0 top-0 ml-[-653.4px] mt-[-363.9px] h-[727.8px] w-[1310.9px]">
            <Image
              src={layer01Img}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 100vw"
              className="object-cover"
            />
          </div>
          {/* 上下渐变色条：贴齐 844 画板上下缘，与 layer-01 上下缘各重叠约 1px 盖住接缝 */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 ml-[-700px] mt-[-423px] h-[60px] w-[1400px] bg-gradient-to-r from-[#F3F5F9] via-[#ECEEF2] to-[#E8EAEE]"
          />
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 ml-[-700px] mt-[363px] h-[60px] w-[1400px] bg-gradient-to-r from-[#E4E5E9] via-[#E0E2E6] to-[#DFE1E5]"
          />
        </div>
        {/* 中心口号组：分隔线 + 品牌 logo + 两行文案，逐词随机浮现 */}
        <div
          data-sd-words
          data-sd-delay="0.2"
          aria-label={sloganLines.join(" ")}
          className={
            isEn
              ? "absolute left-1/2 top-1/2 ml-[-118px] mt-[-50px] w-[236px]"
              : "absolute left-1/2 top-1/2 ml-[-80px] mt-[-26px] w-[160px]"
          }
        >
          <div
            aria-hidden="true"
            className="mx-auto flex w-[138px] items-center justify-between"
          >
            <span className="sd-word h-px w-[49px] shrink-0 opacity-0">
              <span className="block h-px w-full origin-center scale-y-50 bg-grey-300" />
            </span>
            <span className="sd-word shrink-0 opacity-0">
              <BrandLogo className="block size-[12px] text-grey-400" />
            </span>
            <span className="sd-word h-px w-[51px] shrink-0 opacity-0">
              <span className="block h-px w-full origin-center scale-y-50 bg-grey-300" />
            </span>
          </div>
          <p
            aria-hidden="true"
            className="mt-2 text-center font-serif-sc text-14 leading-[20px] text-grey-400"
          >
            {sloganLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                <SplitWords text={line} />
              </span>
            ))}
          </p>
        </div>
      </div>
      {/* 图二卡片层：页边距固定（左右 12、上 86、下 23），卡片拉伸或压缩 */}
      <div
        ref={cardsRef}
        data-sd-global-ignore
        className="invisible absolute inset-0 overflow-hidden bg-[#E0E2E6] opacity-0"
      >
        <div ref={scrollerRef} className="absolute inset-0 overflow-hidden">
          <div ref={boardWrapRef} className="relative h-full w-full">
            <div className="absolute bottom-[23px] left-3 right-3 top-[86px]">
              {/* 左上：想做的事 */}
              <div className="absolute left-0 top-0 h-[calc((100%-7px)/2)] w-[63.661%]">
                <Image
                  src={cardTlImg}
                  alt=""
                  fill
                  unoptimized
                  sizes="60vw"
                  className="object-fill"
                />
                <p className={`${CAPTION_CLASS} left-[5.15%] top-[3.3%]`}>
                  39.9042° N 116.4074° E
                </p>
                <p className={`${CAPTION_CLASS} bottom-[3.3%] left-[5.15%]`}>
                  Real · Tangible
                </p>
                <div className="absolute inset-0 flex items-center">
                <div
                  data-sd-words
                  aria-label={`${t("studioIntro.card1Title")} ${t("studioIntro.card1Body")}`}
                  data-card-copy
                  className="ml-[19.74%] w-[51.07%] origin-center font-serif-sc text-14 leading-[28px] text-grey-400"
                >
                  <RevealLine
                    text={t("studioIntro.card1Title")}
                    className="text-16 leading-[28px]"
                  />
                  <RevealLine text={t("studioIntro.card1Body")} />
                </div>
                </div>
              </div>
              {/* 右上：铭牌照片。遮罩随卡拉伸，照片 object-cover 不变形 */}
              <div className="absolute left-[54.645%] top-0 h-[calc((100%-7px)/2)] w-[45.355%]">
                <Image
                  src={cardTrImg}
                  alt=""
                  fill
                  unoptimized
                  sizes="43vw"
                  className="rotate-180 object-fill"
                />
                <div className="absolute inset-0" style={CARD_MASK_STYLE}>
                  <Image
                    src={platePhotoMobileImg}
                    alt={t("studioIntro.plateAlt")}
                    fill
                    sizes="(max-width: 767px) 50vw, 43vw"
                    data-plate-photo=""
                    className="object-cover"
                  />
                </div>
              </div>
              {/* 左下：GRAVA + G */}
              <div className="absolute bottom-0 left-0 h-[calc((100%-7px)/2)] w-[47.268%]">
                <Image
                  src={cardBlImg}
                  alt=""
                  fill
                  unoptimized
                  sizes="45vw"
                  className="object-fill"
                />
                <div className="absolute inset-0 flex items-center">
                  <p
                    className="ml-[4.62%] rotate-180 font-bodoni text-10 text-grey-400"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    GRAVA
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center">
                  <Image
                    src={markG20Img}
                    alt=""
                    unoptimized
                    className="ml-[40.46%] size-[20px]"
                  />
                </div>
              </div>
              {/* 右下：工作方式 */}
              <div className="absolute bottom-0 left-[38.251%] h-[calc((100%-7px)/2)] w-[61.749%]">
                <Image
                  src={cardBrImg}
                  alt=""
                  fill
                  unoptimized
                  sizes="58vw"
                  className="rotate-180 object-fill"
                />
                <p className={`${CAPTION_CLASS} right-[5.31%] top-[3.3%]`}>
                  Complete · Sustainable
                </p>
                <p className={`${CAPTION_CLASS} bottom-[3.3%] right-[5.31%]`}>
                  Strategy · Systems · Visuals · Experience
                </p>
                <div className="absolute inset-0 flex items-center">
                <div
                  data-sd-words
                  aria-label={card2Lines.join(" ")}
                  data-card-copy
                  className="ml-[23.01%] w-[65.49%] origin-center font-serif-sc text-14 leading-[28px] text-grey-400"
                >
                  <RevealLine
                    text={card2Lines[0] ?? ""}
                    className="text-16 leading-[28px]"
                  />
                  {card2Lines.slice(1).map((line) => (
                    <RevealLine key={line} text={line} />
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
