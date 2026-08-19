"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ENTRANCE_HIDDEN,
  ENTRANCE_STAGGER,
  ENTRANCE_TWEEN,
  ENTRANCE_VISIBLE,
} from "@/animations/entrance";
import {
  buildScatterTimeline,
  resetScatter,
} from "@/animations/org-record-scatter";
import { RepelFilter } from "@/components/effects/repel-filter";
import { SpotlightReveal } from "@/components/effects/spotlight-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useScreenActive,
  useSectionPager,
} from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { PLAQUE_STROKES } from "@/lib/plaque-stroke-data";
import plaqueImg from "../../public/org-record/plaque.webp";
import plaqueTextureImg from "../../public/org-record/plaque-texture.webp";
import studioIntroBgImg from "../../public/org-record/studio-intro-bg.webp";

gsap.registerPlugin(useGSAP);

/** 铭牌标题固定中文：笔画飞散动画依赖 PLAQUE_STROKES 的中文字形，不参与 i18n */
const PLAQUE_TITLE = "万有引力设计工作室";

/** 标题笔画飞散总开关：暂停使用时置 false，下滑直接切屏（代码保留） */
const SCATTER_ENABLED = false;

/**
 * 第三屏：档案 GA_002《组织记录》
 * 居中竖排文案 + 金属铭牌；下滑先播标题飞散，再下滑切屏。
 */
type ScatterStatus = "idle" | "playing" | "done" | "reversing";

export function OrgRecord() {
  const container = useRef<HTMLElement>(null);
  const scatterStatusRef = useRef<ScatterStatus>("idle");
  const scatterTlRef = useRef<gsap.core.Timeline | null>(null);

  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { registerScrollInterceptor } = useSectionPager();
  const { t } = useLocale();

  // CSS 预设 opacity-0，进屏后再播位移/旋转入场，避免先看见全文再动画
  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      const lines = gsap.utils.toArray<HTMLElement>("[data-org-line]", root);
      if (!lines.length) return;

      if (reducedMotion) {
        gsap.set(lines, ENTRANCE_VISIBLE);
        return;
      }
      if (!isActive) {
        gsap.set(lines, ENTRANCE_HIDDEN);
        return;
      }

      gsap.fromTo(lines, ENTRANCE_HIDDEN, {
        ...ENTRANCE_VISIBLE,
        ...ENTRANCE_TWEEN,
        delay: 0.4,
        stagger: ENTRANCE_STAGGER,
      });
    },
    { dependencies: [isActive, reducedMotion], scope: container },
  );

  // 离屏或降级时复位飞散笔画
  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      if (!isActive || reducedMotion) {
        scatterTlRef.current?.kill();
        scatterTlRef.current = null;
        scatterStatusRef.current = "idle";
        resetScatter(root);
      }
    },
    { dependencies: [isActive, reducedMotion], scope: container },
  );

  // 下滑：先播笔画迸发，播完再下滑才切屏；上滑：倒放动画让文字飞回来
  useEffect(() => {
    if (!SCATTER_ENABLED || !isActive || reducedMotion) return;

    return registerScrollInterceptor((deltaY) => {
      const status = scatterStatusRef.current;

      if (deltaY < 0) {
        if (status === "idle") return false;
        if (status === "playing" || status === "done") {
          // 倒放加速：去程的重阻尼倒过来起步太慢，会让人以为没响应
          scatterTlRef.current?.timeScale(3).reverse();
          scatterStatusRef.current = "reversing";
        }
        return true;
      }

      if (status === "playing") return true;
      if (status === "done") return false;
      if (status === "reversing") {
        // 倒放途中又下滑：恢复原速接着飞散
        scatterTlRef.current?.timeScale(1).play();
        scatterStatusRef.current = "playing";
        return true;
      }

      const root = container.current;
      if (!root) return false;

      scatterTlRef.current?.kill();
      const timeline = buildScatterTimeline(root);
      scatterTlRef.current = timeline;
      scatterStatusRef.current = "playing";
      timeline.eventCallback("onComplete", () => {
        scatterStatusRef.current = "done";
      });
      timeline.eventCallback("onReverseComplete", () => {
        scatterStatusRef.current = "idle";
        scatterTlRef.current?.kill();
        scatterTlRef.current = null;
        const el = container.current;
        if (el) resetScatter(el);
      });
      return true;
    });
  }, [isActive, reducedMotion, registerScrollInterceptor]);

  return (
    <ScreenShell ref={container}>
      <RepelFilter className="absolute inset-0">
        {/* 主内容：设计稿 1440×800，内容列 y 156~685，中心约在 52.56% 高度 */}
        <div className="absolute left-1/2 top-[52.56%] z-20 flex w-[330px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
          {/* 工作室简介浮雕字揭示层：鼠标聚光显现，无鼠标场景常显。
              锚定在铭牌金属板中心（列内 y=154：顶部文字 58 + 间距 48 + 板高 97/2），
              位移量取图中字母中心 (51.79%, 40.48%)，使字母与铭牌标题完全居中对齐 */}
          <SpotlightReveal
            src={studioIntroBgImg}
            className="absolute left-1/2 top-[154px] -z-10 aspect-[9/5] w-screen -translate-x-[51.79%] -translate-y-[40.48%]"
          />
          <div className="flex w-full flex-col items-center gap-12">
            <div
              data-org-line
              className="text-center font-serif-sc text-20 uppercase text-grey-400 opacity-0"
            >
              <p>{t("org.line1a")}</p>
              <p>{t("org.line1b")}</p>
            </div>

            {/* 金属铭牌：设计坐标 330.272 × 138 */}
            <div
              data-org-line
              className="relative h-[138px] w-[330px] opacity-0"
            >
              {/* 投影 */}
              <span
                aria-hidden="true"
                className="absolute left-[7px] top-[80px] block h-[58px] w-[315px]"
              >
                <span className="absolute inset-[-45.52%_-6.54%_-35.52%_-6.54%]">
                  <Image
                    src="/org-record/plaque-shadow.svg"
                    alt=""
                    fill
                    sizes="356px"
                  />
                </span>
              </span>

              {/* 凹槽内底纹理（旋转后铺入镂空区） */}
              <div
                aria-hidden="true"
                className="absolute left-[27px] top-[17px] flex h-[63px] w-[272px] items-center justify-center"
              >
                <div className="-rotate-90">
                  <div className="relative h-[272px] w-[63px]">
                    <Image
                      src={plaqueTextureImg}
                      alt=""
                      fill
                      sizes="272px"
                      className="object-cover object-bottom"
                    />
                  </div>
                </div>
              </div>

              {/* 金属外框（含内阴影出血） */}
              <div
                aria-hidden="true"
                className="absolute left-0 top-0 h-[97px] w-[330px]"
              >
                <div className="absolute inset-[-0.51%_-4.39%_-18.98%_-1.36%]">
                  <Image
                    src={plaqueImg}
                    alt=""
                    fill
                    sizes="350px"
                    className="object-fill"
                  />
                </div>
              </div>

              {/* 标题：常态显示文字；触发飞散时切到逐笔画 SVG 层 */}
              <p
                aria-label={PLAQUE_TITLE}
                className="absolute left-1/2 top-[27px] flex -translate-x-1/2 items-baseline whitespace-nowrap font-serif-sc text-24 font-medium text-grey-400"
              >
                {Array.from(PLAQUE_TITLE).map((char, index) => (
                  <span
                    key={`${char}-${index}`}
                    aria-hidden="true"
                    className="relative inline-block size-[1em] leading-none"
                  >
                    <span data-scatter-glyph className="absolute inset-0">
                      {char}
                    </span>
                    {/* 笔画层：每一笔一个独立 SVG，便于按屏幕像素位移和模糊 */}
                    <span
                      data-scatter-svg
                      className="pointer-events-none absolute inset-0 opacity-0"
                    >
                      {(PLAQUE_STROKES[char] ?? []).map(
                        (strokePath, strokeIndex) => (
                          <svg
                            key={strokeIndex}
                            data-scatter-stroke
                            viewBox="0 0 1024 1024"
                            className="absolute inset-0 size-full overflow-visible"
                          >
                            <g transform="scale(1, -1) translate(0, -900)">
                              <path d={strokePath} fill="currentColor" />
                            </g>
                          </svg>
                        ),
                      )}
                    </span>
                  </span>
                ))}
              </p>

              <span
                aria-hidden="true"
                className="absolute left-[294px] top-[54px] block size-[10px]"
              >
                <span className="absolute inset-[-3.83%_-2.08%_-4.46%_-4.31%]">
                  <Image
                    src="/org-record/plaque-logo.svg"
                    alt=""
                    fill
                    sizes="11px"
                  />
                </span>
              </span>

              <div className="absolute right-[31px] top-[67px] text-right font-bodoni text-10 uppercase text-grey-400">
                <p>Brand / Visual</p>
                <p>Product / WEB / Motion</p>
              </div>
            </div>
          </div>

          <div className="flex w-[260px] flex-col items-center gap-12 text-center font-serif-sc text-20 uppercase text-grey-400">
            <p data-org-line className="opacity-0">
              {t("org.founded")}
            </p>
            <div data-org-line className="whitespace-nowrap opacity-0">
              <p>{t("org.enter1")}</p>
              <p>{t("org.enter2")}</p>
            </div>
            <div data-org-line className="opacity-0">
              <p>{t("org.archive1")}</p>
              <p>{t("org.archive2")}</p>
            </div>
          </div>
        </div>
      </RepelFilter>
    </ScreenShell>
  );
}
