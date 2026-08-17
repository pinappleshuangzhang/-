import type { Ref } from "react";

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
  /** index 关闭按钮的 ref（目录层打开时聚焦） */
  closeRef?: Ref<HTMLButtonElement>;
  /** 叠层，目录展开时需高于 ArchiveIndex */
  className?: string;
};

/** 按钮外壳：纯白 + 白色微边（Figma 483:2 首屏导航 651:369 / 651:376 / 651:379） */
const glassShellDefault =
  "border border-white/70 bg-white backdrop-blur-[1.5px]";
/** 目录展开态外壳：纯白（Figma 651:408 / 651:396） */
const glassShellIndex =
  "border border-white/70 bg-white backdrop-blur-[1.5px]";
/** 右侧卡片按钮的多层细微投影（Figma 651:376 / 651:379） */
const cardShadow =
  "shadow-[0px_2px_1.5px_rgba(92,92,92,0.10),0px_6px_3px_rgba(92,92,92,0.09),1px_14px_4px_rgba(92,92,92,0.05),1px_25px_5px_rgba(92,92,92,0.01)]";
const focusRing =
  "focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2";
const hoverScale =
  "transition-transform duration-300 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100";

/**
 * 全站公共顶栏（对照 Figma 01首屏-1 / 导航）。
 * - default：汉堡 + 中间标题 + 联系我们 + 语言切换
 * - index：关闭 + 工作室名 + 联系我们 + 语言切换
 */
export function SiteNav({
  variant = "default",
  center,
  onOpenIndex,
  onCloseIndex,
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
          <ContactButton shell={isIndex ? glassShellIndex : glassShellDefault} />
          <LanguageSwitch shell={isIndex ? glassShellIndex : glassShellDefault} />
        </div>
      </div>
    </header>
  );
}

function MenuButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label="打开目录"
      onClick={onClick}
      className={`relative flex size-11 items-center justify-center rounded-rs-4 ${glassShellDefault} ${hoverScale} ${focusRing}`}
    >
      <span
        className="flex h-4 w-[15px] flex-col justify-between"
        aria-hidden="true"
      >
        <span className="h-0.5 w-full bg-grey-400" />
        <span className="h-0.5 w-full bg-grey-400" />
        <span className="h-0.5 w-full bg-grey-400" />
      </span>
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
  return (
    <button
      ref={ref}
      type="button"
      aria-label="关闭目录"
      onClick={onClick}
      className={`relative flex size-11 items-center justify-center rounded-rs-4 ${glassShellIndex} ${hoverScale} ${focusRing}`}
    >
      <span aria-hidden="true" className="relative block size-3">
        <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[15px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-grey-400" />
        <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[15px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-grey-400" />
      </span>
    </button>
  );
}

function ContactButton({ shell }: { shell: string }) {
  return (
    <div className={`rounded-rs-4 p-0.5 ${shell} ${cardShadow}`}>
      <button
        type="button"
        className={`rounded-rs-2 bg-white px-1.5 pb-1 pt-0.5 font-serif-sc text-16 uppercase text-grey-400 ${focusRing}`}
      >
        联系我们
      </button>
    </div>
  );
}

function LanguageSwitch({ shell }: { shell: string }) {
  return (
    <div
      className={`flex items-center rounded-rs-4 p-0.5 ${shell} ${cardShadow}`}
      role="group"
      aria-label="语言切换"
    >
      <button
        type="button"
        aria-pressed="true"
        className={`rounded-rs-2 bg-white px-1.5 pb-1 pt-1.5 font-bodoni text-16 uppercase text-grey-400 ${focusRing}`}
      >
        CN
      </button>
      <button
        type="button"
        aria-pressed="false"
        className={`rounded-rm-16 px-1.5 pb-0 pt-0.5 font-bodoni text-16 uppercase text-grey-300 transition-colors duration-300 hover:text-grey-400 ${focusRing}`}
      >
        EN
      </button>
    </div>
  );
}
