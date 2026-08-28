"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ENTRANCE_HIDDEN,
  ENTRANCE_STAGGER,
  ENTRANCE_TWEEN,
  ENTRANCE_VISIBLE,
} from "@/animations/entrance";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import foundingPlateImg from "../../public/org-record/founding-plate.webp";
import foundingStatuesImg from "../../public/org-record/founding-statues.webp";

gsap.registerPlugin(useGSAP);

/**
 * 《组织记录》第二幕：工作室成立。
 * 左列标题带黑色高亮条与雕塑合影，底部成立宣言带绿色高亮条，
 * 右侧为金属铭牌装置图。设计稿 1440×800，纵向锚点按百分比换算。
 */
export function OrgFounding() {
  const container = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { t } = useLocale();

  // CSS 预设 opacity-0，进屏后统一播位移/旋转入场
  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      const lines = gsap.utils.toArray<HTMLElement>(
        "[data-founding-line]",
        root,
      );
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

  return (
    <ScreenShell ref={container} aria-label={t("orgFounding.aria")}>
      {/* 左上：小字标注 + 大标题（黑色高亮条反白） */}
      <p
        data-founding-line
        className="absolute left-5 top-[30.5%] font-serif-sc text-12 uppercase text-grey-300 opacity-0"
      >
        {t("orgFounding.designers")}
      </p>
      <div
        data-founding-line
        className="absolute left-5 top-[33.6%] whitespace-nowrap font-serif-sc text-32 uppercase text-grey-400 opacity-0"
      >
        <div className="relative">
          <p>{t("org.line1a")}</p>
          <p>{t("org.line1b")}</p>
          {/* 高亮条压在原文上：条内是同排版的反白副本，形成切字反色效果 */}
          <div
            aria-hidden="true"
            className="absolute left-[76px] top-[49px] h-[43px] w-[249px] overflow-hidden bg-grey-400"
          >
            <div className="absolute left-[-76px] top-[-49px] whitespace-nowrap text-white">
              <p>{t("org.line1a")}</p>
              <p>{t("org.line1b")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 左下：四位设计师雕塑合影 */}
      <div
        data-founding-line
        className="absolute left-5 top-[56.9%] size-[325px] opacity-0"
      >
        <Image
          src={foundingStatuesImg}
          alt={t("orgFounding.statuesAlt")}
          fill
          sizes="325px"
          className="object-cover"
        />
      </div>

      {/* 底部：成立宣言（绿色高亮条反白）与补充说明，整组贴 20px 底边距 */}
      <div className="absolute bottom-5 left-[calc(25%+5px)]">
        <div
          data-founding-line
          className="relative h-[38px] whitespace-nowrap font-serif-sc text-24 uppercase text-grey-400 opacity-0"
        >
          <p>
            {t("orgFounding.foundedPrefix")}
            {t("orgFounding.foundedHighlight")}
          </p>
          <div
            aria-hidden="true"
            className="absolute left-[119px] top-0 h-[38px] w-[237px] overflow-hidden bg-green-900"
          >
            <div className="absolute left-[-119px] top-0 whitespace-nowrap text-white">
              <p>
                {t("orgFounding.foundedPrefix")}
                {t("orgFounding.foundedHighlight")}
              </p>
            </div>
          </div>
        </div>
        <div
          data-founding-line
          className="mt-1 font-serif-sc text-12 uppercase text-grey-300 opacity-0"
        >
          <p>{t("orgFounding.detail1")}</p>
          <p>{t("orgFounding.detail2")}</p>
        </div>
      </div>

      {/* 右侧：金属铭牌装置，贴 20px 右边距 */}
      <div
        data-founding-line
        className="absolute right-5 top-[7.9%] h-[305px] w-[507px] opacity-0"
      >
        <Image
          src={foundingPlateImg}
          alt={t("orgFounding.plateAlt")}
          fill
          sizes="507px"
          className="object-cover"
        />
      </div>
    </ScreenShell>
  );
}
