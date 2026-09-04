"use client";

import { useLayoutEffect, useRef, type Ref } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { FlipHoverButton } from "@/components/ui/flip-hover-button";
import { MobileSiteNav } from "@/components/ui/mobile-site-nav";
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

const focusRing = "focus-visible:outline-none";

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
 * 全站公共导航入口。
 * 移动端委托 MobileSiteNav；桌面端右侧保留目录、联系我们、语言。
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
  const { runWithCurtain, navigationLocked } = useSectionPager();
  const isEn = locale === "en";
  const indexLabel = isIndex ? t("nav.close") : t("nav.index");
  const contactLabel = t("nav.contact");
  // 中文态显示「英」；英文态显示「CN」
  const langLabel = isEn ? "CN" : "英";
  const navFont = isEn ? "font-bodoni" : "font-serif-sc";
  const linkClass = `shrink-0 whitespace-nowrap ${navFont} text-12 font-normal uppercase leading-none text-white ${focusRing}`;
  // Bodoni 全大写的视觉中线比中文低，方块上提 1px 才与文字对齐
  const markOffsetY = isEn ? -1 : 0;

  const titleKey = NAV_TITLE_KEY[navVariant];
  const code = NAV_CODE[navVariant];
  // 目录展开或首屏：品牌名；其它分屏：编号 + 标题
  const showBrand = isIndex || navVariant === "studio" || !titleKey || !code;
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const desktopCloseRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!closeRef) return;
    const media = window.matchMedia("(max-width: 767px)");
    const assignCloseRef = (node: HTMLButtonElement | null) => {
      if (typeof closeRef === "function") {
        closeRef(node);
      } else {
        closeRef.current = node;
      }
    };
    const syncCloseRef = () => {
      assignCloseRef(
        isIndex
          ? media.matches
            ? mobileCloseRef.current
            : desktopCloseRef.current
          : null,
      );
    };

    syncCloseRef();
    media.addEventListener("change", syncCloseRef);
    return () => {
      media.removeEventListener("change", syncCloseRef);
      assignCloseRef(null);
    };
  }, [closeRef, isIndex]);

  const title = showBrand ? (
    "Grava Design Studio"
  ) : (
    <>
      <span>{code}</span>
      {isEn ? " " : null}
      <span className={isEn ? "italic" : "font-serif-sc"}>
        {titleKey ? t(titleKey) : null}
      </span>
    </>
  );
  const indexAriaLabel = isIndex ? t("nav.closeIndex") : t("nav.openIndex");
  const handleIndexClick = isIndex ? onCloseIndex : onOpenIndex;
  // 语言切换走一次完整幕布：铺满后再换文案，避免字面“跳变”
  const handleLanguageClick = () => {
    const next = locale === "zh" ? "en" : "zh";
    runWithCurtain(() => setLocale(next));
  };
  const hideNav = navigationLocked && !isIndex;

  return (
    <>
      <MobileSiteNav
        elevated={isIndex}
        title={title}
        showBrand={showBrand}
        isEnglish={isEn}
        tone={navVariant === "studio" ? "dark" : "light"}
        indexLabel={indexLabel}
        indexAriaLabel={indexAriaLabel}
        onIndexClick={handleIndexClick}
        languageLabel={langLabel}
        languageAriaLabel={t("nav.language")}
        onLanguageClick={handleLanguageClick}
        closeRef={mobileCloseRef}
        className={`${hideNav ? "invisible pointer-events-none" : ""} ${className ?? ""}`}
      />

      <header
        className={`fixed inset-x-0 top-[20px] hidden mix-blend-difference md:block ${isIndex ? "z-[70]" : "z-50"} ${hideNav ? "invisible pointer-events-none" : ""} ${className ?? ""}`}
        aria-hidden={hideNav}
        {...(hideNav ? { inert: true } : {})}
      >
        <nav
          aria-label="Site"
          className="relative mx-auto flex w-[calc(100%-40px)] items-center"
        >
          <p
            className={
              showBrand
                ? "whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-none text-white"
                : "max-w-[calc(100%-527px)] whitespace-nowrap font-bodoni text-12 font-normal uppercase leading-none text-white"
            }
          >
            {title}
          </p>

          {/* 与屏内 right-5 + w-[507px] 图同缘：贴版心右、宽 507；目录在区左缘 */}
          <div className="absolute right-0 top-1/2 flex w-[507px] -translate-y-1/2 items-center justify-between">
            <div className="flex w-max min-w-[161px] shrink-0 items-center justify-between gap-8">
            <FlipHoverButton
              ref={desktopCloseRef}
              label={indexLabel}
              aria-label={indexAriaLabel}
              onClick={handleIndexClick}
              markOffsetY={markOffsetY}
              className={linkClass}
            />
            <FlipHoverButton
              label={contactLabel}
              onClick={onContact}
              markOffsetY={markOffsetY}
              className={linkClass}
            />
          </div>
          <FlipHoverButton
            label={langLabel}
            aria-label={t("nav.language")}
            aria-pressed={locale === "en"}
            resetMarkOnClick
            onClick={handleLanguageClick}
            markOffsetY={markOffsetY}
            className={`w-16 justify-end ${linkClass}`}
          />
          </div>
        </nav>
      </header>
    </>
  );
}
