"use client";

import type { ReactNode, Ref } from "react";
import { FlipHoverButton } from "@/components/ui/flip-hover-button";

type MobileSiteNavProps = {
  elevated: boolean;
  title: ReactNode;
  showBrand: boolean;
  isEnglish: boolean;
  /** 浅色底用实色字，避免 mix-blend 在滚动时每帧重采样 */
  tone?: "light" | "dark";
  indexLabel: string;
  indexAriaLabel: string;
  onIndexClick?: () => void;
  languageLabel: string;
  languageAriaLabel: string;
  onLanguageClick: () => void;
  closeRef?: Ref<HTMLButtonElement>;
  /** 首屏序幕期间隐藏：淡出并让出键盘与指针 */
  concealed?: boolean;
  className?: string;
};

const focusRing = "focus-visible:outline-none";

/** Figma 926:1342：移动端公共导航，仅保留目录与语言入口。页边 12px。 */
export function MobileSiteNav({
  elevated,
  title,
  showBrand,
  isEnglish,
  tone = "dark",
  indexLabel,
  indexAriaLabel,
  onIndexClick,
  languageLabel,
  languageAriaLabel,
  onLanguageClick,
  closeRef,
  concealed = false,
  className,
}: MobileSiteNavProps) {
  const navFont = isEnglish ? "font-bodoni" : "font-serif-sc";
  const ink = tone === "light" ? "text-grey-400" : "text-white";
  const linkClass = `shrink-0 whitespace-nowrap ${navFont} text-12 font-normal uppercase leading-[18px] ${ink} ${focusRing}`;
  // Bodoni 全大写的视觉中线比中文低，方块上提 1px 才与文字对齐
  const markOffsetY = isEnglish ? -1 : 0;
  // 仅深色屏保留 mix-blend；浅色屏实色字，减轻滑动合成成本
  const blend = tone === "dark" ? "mix-blend-difference" : "";

  return (
    <header
      className={`fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] transition-opacity duration-500 ease-out md:hidden motion-reduce:transition-none ${blend} ${elevated ? "z-[70]" : "z-50"} ${concealed ? "pointer-events-none opacity-0" : "opacity-100"} ${className ?? ""}`}
      aria-hidden={concealed}
      {...(concealed ? { inert: true } : {})}
    >
      <nav
        aria-label="Site"
        className="relative mx-auto flex w-[calc(100%-24px)] items-center"
      >
        <p
          className={
            showBrand
              ? `whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-[18px] ${ink}`
              : `max-w-[calc(100%-98px)] whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-[18px] ${ink}`
          }
        >
          {title}
        </p>

        <div className="absolute right-0 top-1/2 flex w-[86px] -translate-y-1/2 items-center justify-between">
          <FlipHoverButton
            ref={closeRef}
            label={indexLabel}
            aria-label={indexAriaLabel}
            onClick={onIndexClick}
            markOffsetY={markOffsetY}
            className={`w-[34px] justify-end ${linkClass}`}
          />
          <FlipHoverButton
            label={languageLabel}
            aria-label={languageAriaLabel}
            aria-pressed={isEnglish}
            resetMarkOnClick
            onClick={onLanguageClick}
            markOffsetY={markOffsetY}
            className={`w-[22px] justify-end ${linkClass}`}
          />
        </div>
      </nav>
    </header>
  );
}
