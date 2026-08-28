"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  playSondavenReveal,
  setSondavenHidden,
  setSondavenVisible,
} from "@/animations/sondaven-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import foundingPlateImg from "../../public/org-record/founding-plate.webp";
import foundingStatuesImg from "../../public/org-record/founding-statues.webp";

gsap.registerPlugin(useGSAP);

/** 逐字符拆分：空格保留为文本节点，字符 span 由父级 aria-label 兜底语义 */
function SplitChars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((char, index) =>
        char === " " ? (
          " "
        ) : (
          <span
            key={`${char}-${index}`}
            aria-hidden="true"
            className="sd-char inline-block opacity-0"
          >
            {char}
          </span>
        ),
      )}
    </>
  );
}

/**
 * 《组织记录》第二幕：工作室成立。
 * 左列标题带黑色高亮条与雕塑合影，底部成立宣言带绿色高亮条，
 * 右侧为金属铭牌装置图。设计稿 1440×800，纵向锚点按百分比换算。
 * 入场采用 Son Daven 式：文字逐字符随机浮现（高亮条反白副本与
 * 原文共享随机序），高亮条从左擦入，图片在遮罩内上滑显现。
 */
export function OrgFounding() {
  const container = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const isActive = useScreenActive();
  const { t } = useLocale();

  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      if (reducedMotion) {
        setSondavenVisible(root);
        return;
      }
      if (!isActive) {
        setSondavenHidden(root);
        return;
      }
      playSondavenReveal(root);
    },
    { dependencies: [isActive, reducedMotion], scope: container },
  );

  const titleLabel = `${t("org.line1a")} ${t("org.line1b")}`;
  const foundedText = `${t("orgFounding.foundedPrefix")}${t(
    "orgFounding.foundedHighlight",
  )}`;

  return (
    <ScreenShell ref={container} aria-label={t("orgFounding.aria")}>
      {/* 左上：小字标注 + 大标题（黑色高亮条反白） */}
      <p
        data-sd-chars
        data-sd-delay="0.2"
        aria-label={t("orgFounding.designers")}
        className="absolute left-5 top-[30.5%] font-serif-sc text-12 uppercase text-grey-300"
      >
        <SplitChars text={t("orgFounding.designers")} />
      </p>
      <div className="absolute left-5 top-[33.6%] whitespace-nowrap font-serif-sc text-32 uppercase text-grey-400">
        <div className="relative">
          <div
            data-sd-chars
            data-sd-sync="founding-title"
            data-sd-delay="0.35"
            aria-label={titleLabel}
          >
            <p aria-hidden="true">
              <SplitChars text={t("org.line1a")} />
            </p>
            <p aria-hidden="true">
              <SplitChars text={t("org.line1b")} />
            </p>
          </div>
          {/* 高亮条压在原文上：条内是同排版的反白副本，形成切字反色效果 */}
          <div
            aria-hidden="true"
            className="absolute left-[76px] top-[49px] h-[43px] w-[249px] overflow-hidden"
          >
            <span
              data-sd-bar
              data-sd-delay="0.35"
              className="absolute inset-0 origin-left scale-x-0 bg-grey-400"
            />
            <div
              data-sd-chars
              data-sd-sync="founding-title"
              data-sd-delay="0.35"
              className="absolute left-[-76px] top-[-49px] whitespace-nowrap text-white"
            >
              <p>
                <SplitChars text={t("org.line1a")} />
              </p>
              <p>
                <SplitChars text={t("org.line1b")} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 左下：四位设计师雕塑合影 */}
      <div
        data-sd-media
        data-sd-delay="0.55"
        className="absolute left-5 top-[56.9%] size-[325px] overflow-hidden"
      >
        <div
          data-sd-media-inner
          className="absolute inset-0 translate-y-[105%]"
        >
          <Image
            src={foundingStatuesImg}
            alt={t("orgFounding.statuesAlt")}
            fill
            sizes="325px"
            className="object-cover"
          />
        </div>
      </div>

      {/* 底部：成立宣言（绿色高亮条反白）与补充说明，整组贴 20px 底边距 */}
      <div className="absolute bottom-5 left-[calc(25%+5px)]">
        <div className="relative h-[38px] whitespace-nowrap font-serif-sc text-24 uppercase text-grey-400">
          <p
            data-sd-chars
            data-sd-sync="founding-founded"
            data-sd-delay="0.5"
            aria-label={foundedText}
          >
            <SplitChars text={foundedText} />
          </p>
          <div
            aria-hidden="true"
            className="absolute left-[119px] top-0 h-[38px] w-[237px] overflow-hidden"
          >
            <span
              data-sd-bar
              data-sd-delay="0.5"
              className="absolute inset-0 origin-left scale-x-0 bg-green-900"
            />
            <div
              data-sd-chars
              data-sd-sync="founding-founded"
              data-sd-delay="0.5"
              className="absolute left-[-119px] top-0 whitespace-nowrap text-white"
            >
              <p>
                <SplitChars text={foundedText} />
              </p>
            </div>
          </div>
        </div>
        <div
          data-sd-lines
          data-sd-delay="0.75"
          aria-label={`${t("orgFounding.detail1")} ${t("orgFounding.detail2")}`}
          className="mt-1 font-serif-sc text-12 uppercase text-grey-300"
        >
          <span aria-hidden="true" className="block overflow-hidden">
            <span className="sd-line block opacity-0">
              {t("orgFounding.detail1")}
            </span>
          </span>
          <span aria-hidden="true" className="block overflow-hidden">
            <span className="sd-line block opacity-0">
              {t("orgFounding.detail2")}
            </span>
          </span>
        </div>
      </div>

      {/* 右侧：金属铭牌装置，贴 20px 右边距 */}
      <div
        data-sd-media
        data-sd-delay="0.35"
        className="absolute right-5 top-[7.9%] h-[305px] w-[507px] overflow-hidden"
      >
        <div
          data-sd-media-inner
          className="absolute inset-0 translate-y-[105%]"
        >
          <Image
            src={foundingPlateImg}
            alt={t("orgFounding.plateAlt")}
            fill
            sizes="507px"
            className="object-cover"
          />
        </div>
      </div>
    </ScreenShell>
  );
}
