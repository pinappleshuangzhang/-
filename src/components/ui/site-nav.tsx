"use client";

import type { Ref } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { FlipHoverButton } from "@/components/ui/flip-hover-button";
import type { MessageKey } from "@/lib/i18n/messages";
import type { NavVariant } from "@/lib/nav-variants";

export type SiteNavVariant = "default" | "index";

type SiteNavProps = {
  /** default：未展开；index：目录展开 */
  variant?: SiteNavVariant;
  /** 当前分屏，左侧显示对应命名 */
  navVariant?: NavVariant;
  onOpenIndex?: () => void;
  onCloseIndex?: () => void;
  onContact?: () => void;
  closeRef?: Ref<HTMLButtonElement>;
  className?: string;
};

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2";

const NAV_TITLE_KEY: Partial<Record<NavVariant, MessageKey>> = {
  "archive-ga-001": "nav.title.ga001",
  "archive-ga-002": "nav.title.ga002",
  "archive-ga-003": "nav.title.ga003",
  "archive-ga-004": "nav.title.ga004",
  "archive-ga-005": "nav.title.ga005",
  contact: "nav.title.contact",
};

const NAV_CODE: Partial<Record<NavVariant, string>> = {
  "archive-ga-001": "ARCHIVE_GA_001",
  "archive-ga-002": "ARCHIVE_GA_002",
  "archive-ga-003": "ARCHIVE_GA_003",
  "archive-ga-004": "GA_ARCHIVE_004",
  "archive-ga-005": "GA_ARCHIVE_005",
  contact: "GA_ARCHIVE_004",
};

/**
 * 全站公共导航（唯一实现）。
 * 左：品牌 / 分屏命名；右：目录、联系我们、语言（Figma 891:2481 / 875:511）。
 * 右侧操作区绝对贴右、固定 507px（与各屏 right-5 + w-[507px] 图左缘对齐），
 * 避免左侧长标题挤缩导致「目录」右移。
 */
export function SiteNav({
  variant = "default",
  navVariant = "studio",
  onOpenIndex,
  onCloseIndex,
  onContact,
  closeRef,
  className,
}: SiteNavProps) {
  const isIndex = variant === "index";
  const { locale, setLocale, t } = useLocale();
  const isEn = locale === "en";
  const indexLabel = isIndex ? t("nav.close") : t("nav.index");
  const contactLabel = t("nav.contact");
  // 中文态显示「英」；英文态显示「CN」
  const langLabel = isEn ? "CN" : "英";
  const navFont = isEn ? "font-bodoni" : "font-serif-sc";
  const linkClass = `shrink-0 whitespace-nowrap ${navFont} text-12 font-normal uppercase leading-none text-grey-400 ${focusRing}`;

  const titleKey = NAV_TITLE_KEY[navVariant];
  const code = NAV_CODE[navVariant];
  // 目录展开或首屏：品牌名；其它分屏：编号 + 标题
  const showBrand = isIndex || navVariant === "studio" || !titleKey || !code;

  return (
    <header
      className={`fixed inset-x-0 top-[20px] ${isIndex ? "z-[70]" : "z-50"} ${className ?? ""}`}
    >
      <nav
        aria-label="Site"
        className="relative mx-auto flex w-[calc(100%-40px)] items-center"
      >
        {showBrand ? (
          <p className="whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-none text-grey-400">
            Grava Design Studio
          </p>
        ) : (
          <p className="max-w-[calc(100%-527px)] whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-none text-grey-400">
            <span>{code}</span>
            {isEn ? " " : null}
            <span className={isEn ? "italic" : "font-serif-sc"}>
              {t(titleKey)}
            </span>
          </p>
        )}

        {/* 与屏内 right-5 + w-[507px] 图同缘：贴版心右、宽 507；目录在区左缘 */}
        <div className="absolute right-0 top-1/2 flex w-[507px] -translate-y-1/2 items-center justify-between">
          {/* 中文落 161 栅格；英文随文案撑开 + gap-8，避免 INDEX 与 CONTACT 及 hover 方块重叠 */}
          <div className="flex min-w-[161px] w-max shrink-0 items-center justify-between gap-8">
            <FlipHoverButton
              ref={isIndex ? closeRef : undefined}
              label={indexLabel}
              aria-label={isIndex ? t("nav.closeIndex") : t("nav.openIndex")}
              onClick={isIndex ? onCloseIndex : onOpenIndex}
              className={linkClass}
            />
            <FlipHoverButton
              label={contactLabel}
              onClick={onContact}
              className={linkClass}
            />
          </div>
          <FlipHoverButton
            label={langLabel}
            aria-label={t("nav.language")}
            aria-pressed={locale === "en"}
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className={`w-16 justify-end ${linkClass}`}
          />
        </div>
      </nav>
    </header>
  );
}
