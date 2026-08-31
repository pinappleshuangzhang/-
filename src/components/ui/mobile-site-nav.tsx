"use client";

import type { ReactNode, Ref } from "react";
import { FlipHoverButton } from "@/components/ui/flip-hover-button";

type MobileSiteNavProps = {
  elevated: boolean;
  title: ReactNode;
  showBrand: boolean;
  isEnglish: boolean;
  indexLabel: string;
  indexAriaLabel: string;
  onIndexClick?: () => void;
  languageLabel: string;
  languageAriaLabel: string;
  onLanguageClick: () => void;
  closeRef?: Ref<HTMLButtonElement>;
  className?: string;
};

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2";

/** Figma 926:1342：移动端公共导航，仅保留目录与语言入口。 */
export function MobileSiteNav({
  elevated,
  title,
  showBrand,
  isEnglish,
  indexLabel,
  indexAriaLabel,
  onIndexClick,
  languageLabel,
  languageAriaLabel,
  onLanguageClick,
  closeRef,
  className,
}: MobileSiteNavProps) {
  const navFont = isEnglish ? "font-bodoni" : "font-serif-sc";
  const linkClass = `shrink-0 whitespace-nowrap ${navFont} text-12 font-normal uppercase leading-[18px] text-grey-400 ${focusRing}`;

  return (
    <header
      className={`fixed inset-x-0 top-[15px] md:hidden ${elevated ? "z-[70]" : "z-50"} ${className ?? ""}`}
    >
      <nav
        aria-label="Site"
        className="relative mx-auto flex w-[calc(100%-30px)] items-center"
      >
        <p
          className={
            showBrand
              ? "whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-[18px] text-grey-400"
              : "max-w-[calc(100%-98px)] whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-[18px] text-grey-400"
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
            className={`w-[34px] justify-end ${linkClass}`}
          />
          <FlipHoverButton
            label={languageLabel}
            aria-label={languageAriaLabel}
            aria-pressed={isEnglish}
            onClick={onLanguageClick}
            className={`w-[22px] justify-end ${linkClass}`}
          />
        </div>
      </nav>
    </header>
  );
}
