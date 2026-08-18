"use client";

import type { Ref } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { useDissolveHoverFill } from "@/hooks/use-dissolve-hover-fill";
import type { Locale } from "@/lib/i18n/messages";

export type SiteNavVariant = "default" | "index";

type SiteNavProps = {
  /** default：未展开（汉堡 + 联系我们）；index：目录展开（关闭） */
  variant?: SiteNavVariant;
  /** 导航中间内容；index 变体默认工作室名 */
  center?: React.ReactNode;
  /** default：打开目录 */
  onOpenIndex?: () => void;
  /** index：关闭目录 */
  onCloseIndex?: () => void;
  /** 跳转到联系分屏 */
  onContact?: () => void;
  /** index 关闭按钮的 ref（目录层打开时聚焦） */
  closeRef?: Ref<HTMLButtonElement>;
  /** 叠层，目录展开时需高于 ArchiveIndex */
  className?: string;
};

/** 控件外壳：40% 半透明白磨砂 + 白色微边（Figma 651:369 / 651:376 / 651:379），内层按钮保持纯白 */
const glassShell =
  "border border-white/70 bg-white/40 backdrop-blur-[1.5px]";
/** 导航控件的多层细微投影：drop-shadow 滤镜跟随轮廓，不污染半透明内部（Figma 670:1296 / 670:1299） */
const cardShadow =
  "[filter:drop-shadow(0px_2px_1.5px_rgba(92,92,92,0.10))_drop-shadow(0px_6px_3px_rgba(92,92,92,0.09))_drop-shadow(1px_14px_4px_rgba(92,92,92,0.05))_drop-shadow(1px_25px_5px_rgba(92,92,92,0.01))]";
/** 汉堡按钮投影：同参数 box-shadow，全强度不随 40% 半透明填充衰减，观感与右侧控件一致 */
const menuShadow =
  "shadow-[0px_2px_1.5px_rgba(92,92,92,0.10),0px_6px_3px_rgba(92,92,92,0.09),1px_14px_4px_rgba(92,92,92,0.05),1px_25px_5px_rgba(92,92,92,0.01)]";
const focusRing =
  "focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2";

/** 溶解白底层：绝对铺满圆角，由 useDissolveHoverFill 驱动显现 */
function DissolveFill({
  fillRef,
}: {
  fillRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={fillRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white opacity-0"
    />
  );
}

/**
 * 全站公共顶栏（对照 Figma 01首屏-1 / 导航）。
 * - default：汉堡 + 中间标题 + 联系我们 + 语言切换
 * - index：关闭 + 工作室名 + 联系我们 + 语言切换
 * 交互按钮 hover 使用站内斑块溶解遮罩（与成员卡 / 作品卡同语言）。
 */
export function SiteNav({
  variant = "default",
  center,
  onOpenIndex,
  onCloseIndex,
  onContact,
  closeRef,
  className,
}: SiteNavProps) {
  const isIndex = variant === "index";

  return (
    <header
      className={`fixed inset-x-0 top-[30px] ${isIndex ? "z-[70]" : "z-50"} ${className ?? ""}`}
    >
      <div className="relative mx-auto flex w-[calc(100%-60px)] items-center justify-between">
        {isIndex ? (
          <CloseButton ref={closeRef} onClick={onCloseIndex} />
        ) : (
          <MenuButton onClick={onOpenIndex} />
        )}

        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
          {isIndex ? (
            <p className="whitespace-nowrap font-bodoni text-20 font-normal uppercase text-grey-400">
              Grava Design Studio
            </p>
          ) : (
            (center ?? (
              <p className="whitespace-nowrap font-bodoni text-20 uppercase text-grey-400">
                Grava Design Studio
              </p>
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <ContactButton onClick={onContact} />
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}

function MenuButton({ onClick }: { onClick?: () => void }) {
  const dissolve = useDissolveHoverFill();
  const { t } = useLocale();
  return (
    <button
      type="button"
      aria-label={t("nav.openIndex")}
      onClick={onClick}
      onMouseEnter={dissolve.onMouseEnter}
      onMouseLeave={dissolve.onMouseLeave}
      className={`relative flex size-[34px] items-center justify-center overflow-hidden rounded-rs-4 ${glassShell} ${menuShadow} ${focusRing}`}
    >
      <DissolveFill fillRef={dissolve.fillRef} />
      <Image
        src="/nav/menu.svg"
        alt=""
        width={12}
        height={11}
        className="relative z-10 h-[11px] w-[12px]"
      />
    </button>
  );
}

function CloseButton({
  onClick,
  ref,
}: {
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  const dissolve = useDissolveHoverFill();
  const { t } = useLocale();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={t("nav.closeIndex")}
      onClick={onClick}
      onMouseEnter={dissolve.onMouseEnter}
      onMouseLeave={dissolve.onMouseLeave}
      className={`relative flex size-[34px] items-center justify-center overflow-hidden rounded-rs-4 ${glassShell} ${menuShadow} ${focusRing}`}
    >
      <DissolveFill fillRef={dissolve.fillRef} />
      <Image
        src="/nav/close.svg"
        alt=""
        width={10}
        height={10}
        className="relative z-10 size-[10px]"
      />
    </button>
  );
}

function ContactButton({ onClick }: { onClick?: () => void }) {
  const dissolve = useDissolveHoverFill();
  const { t } = useLocale();
  return (
    <div
      className={`flex h-[34px] items-stretch rounded-rs-4 p-0.5 ${glassShell} ${cardShadow}`}
    >
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={dissolve.onMouseEnter}
        onMouseLeave={dissolve.onMouseLeave}
        className={`relative flex items-center overflow-hidden rounded-rs-2 bg-transparent px-1.5 font-serif-sc text-16 uppercase leading-none text-grey-400 ${focusRing}`}
      >
        <DissolveFill fillRef={dissolve.fillRef} />
        <span className="relative z-10">{t("nav.contact")}</span>
      </button>
    </div>
  );
}

function LanguageOption({
  code,
  active,
  onSelect,
}: {
  code: Locale;
  active: boolean;
  onSelect: () => void;
}) {
  const dissolve = useDissolveHoverFill();
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      onMouseEnter={active ? undefined : dissolve.onMouseEnter}
      onMouseLeave={active ? undefined : dissolve.onMouseLeave}
      className={
        active
          ? `relative flex h-full items-center rounded-rs-2 bg-white px-1.5 font-bodoni text-16 uppercase leading-none text-grey-400 ${focusRing}`
          : `relative flex h-full items-center overflow-hidden rounded-rs-2 px-1.5 font-bodoni text-16 uppercase leading-none text-grey-300 transition-colors duration-300 hover:text-grey-400 motion-reduce:transition-none ${focusRing}`
      }
    >
      {!active && <DissolveFill fillRef={dissolve.fillRef} />}
      <span className="relative z-10 translate-y-px">{code.toUpperCase()}</span>
    </button>
  );
}

function LanguageSwitch() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      className={`flex h-[34px] items-center rounded-rs-4 p-0.5 ${glassShell} ${cardShadow}`}
      role="group"
      aria-label={t("nav.language")}
    >
      <LanguageOption
        code="zh"
        active={locale === "zh"}
        onSelect={() => setLocale("zh")}
      />
      <LanguageOption
        code="en"
        active={locale === "en"}
        onSelect={() => setLocale("en")}
      />
    </div>
  );
}
