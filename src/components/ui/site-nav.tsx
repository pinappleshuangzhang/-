"use client";

import { useLayoutEffect, useRef, type Ref } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
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
  /** 「联系我们」跳转最后一屏 */
  onContact?: () => void;
  /** 目录展开时，左侧品牌入口返回首页 */
  onHome?: () => void;
  closeRef?: Ref<HTMLButtonElement>;
  className?: string;
};

const focusRing = "focus-visible:outline-none";

function assignButtonRef(
  ref: Ref<HTMLButtonElement> | undefined,
  node: HTMLButtonElement | null,
) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  ref.current = node;
}

const NAV_TITLE_KEY: Partial<Record<NavVariant, MessageKey>> = {
  "archive-ga-001": "nav.title.ga001",
  "archive-ga-002": "nav.title.ga002",
  "archive-ga-003": "nav.title.ga003",
  "archive-ga-004": "nav.title.ga004",
  contact: "nav.title.contact",
};

const NAV_CODE: Partial<Record<NavVariant, string>> = {
  "archive-ga-001": "ARCHIVE_GA_001",
  "archive-ga-002": "ARCHIVE_GA_002",
  "archive-ga-003": "ARCHIVE_GA_003",
  "archive-ga-004": "GA_ARCHIVE_004",
  contact: "ARCHIVE_GA_005",
};

/**
 * 全站公共导航。目录、语言、标题各只写一份，桌面和手机用同一套节点换样式。
 * 联系我们只在桌面显示。右侧操作区桌面宽 507，与各屏右边栏图左缘对齐。
 */
export function SiteNav({
  variant = "default",
  navVariant = "studio",
  onOpenIndex,
  onCloseIndex,
  onContact,
  onHome,
  closeRef,
  className,
}: SiteNavProps) {
  const isIndex = variant === "index";
  const { locale, setLocale, t } = useLocale();
  const { runWithCurtain, navigationLocked, introOverlayActive, goToScreen } =
    useSectionPager();
  const isEn = locale === "en";
  const indexLabel = isIndex ? t("nav.close") : t("nav.index");
  // 中文态显示「英」；英文态显示「CN」
  const langLabel = isEn ? "CN" : "英";
  const navFont = isEn ? "font-bodoni" : "font-serif-sc";
  const toneDark = navVariant === "studio";
  const ink = toneDark ? "text-white" : "text-grey-400 md:text-white";
  const linkClass = `shrink-0 whitespace-nowrap ${navFont} ${ink} text-12 font-normal uppercase leading-[18px] before:absolute before:inset-y-0 before:-left-2.5 before:-right-2.5 before:content-[''] md:text-[length:calc(var(--su)*12)] md:leading-none md:before:-left-[calc(var(--su)*10)] md:before:-right-[calc(var(--su)*10)] ${focusRing}`;
  // Bodoni 全大写的视觉中线比中文低，方块上提 1px 才与文字对齐
  const markOffsetY = isEn ? -1 : 0;

  const titleKey = NAV_TITLE_KEY[navVariant];
  const code = NAV_CODE[navVariant];
  // 目录展开或首屏：品牌名；其它分屏：编号 + 标题
  const showBrand = isIndex || navVariant === "studio" || !titleKey || !code;
  const indexButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    assignButtonRef(closeRef, isIndex ? indexButtonRef.current : null);
    return () => assignButtonRef(closeRef, null);
  }, [closeRef, isIndex]);

  const titleText = titleKey ? t(titleKey) : null;
  const title = showBrand ? (
    "Grava Design Studio"
  ) : (
    <>
      <span>{code}</span>
      {isEn ? " " : null}
      <span className={isEn ? "italic" : "font-serif-sc"}>{titleText}</span>
    </>
  );
  const indexAriaLabel = isIndex ? t("nav.closeIndex") : t("nav.openIndex");
  const handleIndexClick = isIndex ? onCloseIndex : onOpenIndex;
  // 品牌 logo/标题点击：目录展开时沿用 onHome（先收目录），否则直接回档案首页
  const handleHomeClick = () => {
    if (isIndex && onHome) {
      onHome();
      return;
    }
    goToScreen(0);
  };
  // 语言切换走一次完整幕布：铺满后再换文案，避免字面“跳变”
  const handleLanguageClick = () => {
    const next = locale === "zh" ? "en" : "zh";
    runWithCurtain(() => setLocale(next));
  };
  // 序幕遮罩在场期间一律隐藏：遮罩卸载后才淡入，避免与加载屏顶部信息行重合
  const hideNav = (navigationLocked || introOverlayActive) && !isIndex;

  return (
    <header
      className={`fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] transition-opacity duration-500 ease-out motion-reduce:transition-none md:top-[var(--page-margin)] ${toneDark ? "mix-blend-difference" : "md:mix-blend-difference"} ${isIndex ? "z-[70]" : "z-50"} ${hideNav ? "pointer-events-none opacity-0" : "opacity-100"} ${className ?? ""}`}
      aria-hidden={hideNav}
      {...(hideNav ? { inert: true } : {})}
    >
      <nav
        aria-label="Site"
        className="relative mx-auto flex w-[calc(100%-24px)] items-center md:w-[calc(100%-var(--page-margin)*2)]"
      >
        <button
          type="button"
          onClick={handleHomeClick}
          className={`flex items-center border-0 bg-transparent p-0 text-left font-bodoni text-12 font-normal uppercase leading-[18px] md:gap-[calc(var(--su)*6)] md:text-[length:calc(var(--su)*12)] md:leading-none ${ink} ${focusRing} ${
            showBrand
              ? "whitespace-nowrap"
              : "max-w-[calc(100%-98px)] overflow-hidden text-ellipsis whitespace-nowrap md:max-w-[calc(100%-(var(--su-hero)*507+var(--page-margin)))]"
          }`}
        >
          <BrandLogo className="hidden shrink-0 md:block md:size-[calc(var(--su)*20)]" />
          <span className="md:pt-[calc(var(--su)*2)]">{title}</span>
        </button>

        <div
          data-nav-actions
          className="absolute right-0 top-1/2 flex w-[86px] -translate-y-1/2 items-center justify-between md:w-[calc(var(--su-hero)*507)]"
        >
          <div className="flex w-max shrink-0 items-center md:min-w-[calc(var(--su)*161)] md:justify-between md:gap-[calc(var(--su)*32)]">
            <FlipHoverButton
              ref={indexButtonRef}
              label={indexLabel}
              aria-label={indexAriaLabel}
              data-nav-index=""
              onClick={handleIndexClick}
              markOffsetY={markOffsetY}
              className={`w-[34px] justify-end md:w-auto ${linkClass}`}
            />
            <span className="hidden md:contents">
              <FlipHoverButton
                label={t("nav.contact")}
                data-nav-contact=""
                onClick={onContact}
                markOffsetY={markOffsetY}
                className={linkClass}
              />
            </span>
          </div>
          <FlipHoverButton
            label={langLabel}
            aria-label={t("nav.language")}
            aria-pressed={locale === "en"}
            resetMarkOnClick
            onClick={handleLanguageClick}
            markOffsetY={markOffsetY}
            className={`w-[22px] justify-end md:w-16 ${linkClass}`}
          />
        </div>
      </nav>
    </header>
  );
}
