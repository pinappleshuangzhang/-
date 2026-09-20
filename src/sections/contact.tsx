"use client";

import { useRef, type Ref } from "react";
import Image from "next/image";
import { SpotlightReveal } from "@/components/effects/spotlight-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { CopyCheckIcon } from "@/components/ui/copy-check-icon";
import { FlipChars, type FlipCharsHandle } from "@/components/ui/flip-chars";
import { shouldMarkFocus } from "@/components/ui/flip-hover-button";
import { SplitWords } from "@/components/ui/split-words";
import { CONTACT_RECIPIENT } from "@/lib/contact-form";
import { useCopyContactEmail } from "@/lib/copy-contact-email";
import contactEmbossedBgImg from "../../public/contact/contact-embossed-bg.webp";
import contactEmbossedBgMobileImg from "../../public/contact/contact-embossed-bg-mobile.webp";

/**
 * 最后一屏：GA_ARCHIVE_006《开启一份新调查》。
 * 背景由共享背景层提供，这里只承载联系 CTA 与工作室信息。
 */
export function Contact() {
  const { t } = useLocale();

  return (
    <ScreenShell aria-label={t("contact.aria")}>
      <SpotlightReveal
        src={contactEmbossedBgImg}
        mobileSrc={contactEmbossedBgMobileImg}
        autoMove
        className="absolute inset-0 z-[5] bg-[linear-gradient(97deg,var(--color-white)_0%,var(--color-grey-100)_102.81%)]"
      />
      <div id="contact">
        <ContactLayout heading="h1" animated />
      </div>
    </ScreenShell>
  );
}

function ContactLayout({
  heading,
  animated = false,
}: {
  heading: "h1" | "h2";
  animated?: boolean;
}) {
  const { locale, t } = useLocale();
  const { copied, copy } = useCopyContactEmail();
  const flipRef = useRef<FlipCharsHandle>(null);
  const Title = heading;
  const titleFont = locale === "en" ? "font-bodoni" : "font-serif-sc";

  return (
    <div className="absolute inset-0 z-10">
      <Title
        data-sd-words={animated ? "" : undefined}
        data-sd-delay={animated ? "0.2" : undefined}
        aria-label={t("contact.cta")}
        className={`absolute left-3 top-[109px] whitespace-nowrap text-24 font-normal uppercase leading-[34px] text-grey-400 md:left-[var(--page-margin)] md:top-[calc(var(--su)*133)] md:text-[length:calc(var(--su)*48)] md:leading-[calc(var(--su)*68)] ${titleFont}`}
      >
        <SplitWords text={t("contact.cta")} animated={animated} />
      </Title>

      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        onMouseEnter={() => flipRef.current?.play()}
        onMouseLeave={() => flipRef.current?.reverse()}
        onFocus={(event) => {
          if (shouldMarkFocus(event.currentTarget)) flipRef.current?.play();
        }}
        onBlur={() => flipRef.current?.reverse()}
        aria-live="polite"
        aria-label={
          copied
            ? t("contact.copied")
            : `${t("contact.copyAria")} ${CONTACT_RECIPIENT}`
        }
        className="group absolute left-3 top-[150px] h-[34px] w-max pl-0 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 md:left-[var(--page-margin)] md:top-[calc(var(--su)*204)] md:h-[calc(var(--su)*69)] md:pr-4"
      >
        <span
          data-sd-bar={animated ? "" : undefined}
          data-sd-delay={animated ? "0.35" : undefined}
          aria-hidden="true"
          // 黑条中心对齐文字字形视觉中心：英文 Bodoni 大写偏高，黑条随之上移
          className={`pointer-events-none absolute left-0 w-full origin-left bg-grey-400 ${
            locale === "en"
              ? "top-px h-[29px] md:top-[calc(var(--su)*1)] md:h-[calc(var(--su)*60)]"
              : "top-px h-[29px] md:top-[calc(var(--su)*2.5)] md:h-[calc(var(--su)*66)]"
          } ${animated ? "scale-x-0" : ""}`}
        />
        <ContactButtonContent
          flipRef={flipRef}
          label={copied ? t("contact.copied") : t("contact.button")}
          copiedLabel={t("contact.copied")}
          reserveLabel={t("contact.button")}
          arrowSrc="/contact/contact-arrow-white.webp"
          className="text-white"
          fontClassName={titleFont}
          // 图标可见部分在画布内偏下 5.6%；英文大写视觉中线更高，补偿量更大
          trailingNudge={
            locale === "en"
              ? "-translate-y-[0.132em]"
              : "-translate-y-[0.015em]"
          }
          animated={animated}
        />
      </button>

      {/* 信息行按视口高度百分比下沉（稿面 379/800），大屏与标题区拉开呼吸感 */}
      <dl className="absolute left-3 top-[240px] flex w-[345px] flex-col gap-[22px] md:left-[var(--page-margin)] md:right-[var(--page-margin)] md:top-[47.375%] md:grid md:w-auto md:grid-cols-8 md:gap-5">
        <ContactFact
          label={t("contact.addressLabel")}
          value={t("contact.address")}
          className="h-[50px] w-[139px] md:col-start-1 md:h-auto md:w-[calc(var(--su)*180)]"
          valueClassName="whitespace-nowrap text-16 leading-6 md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*24)]"
          animated={animated}
        />
        <ContactFact
          label={t("contact.foundedLabel")}
          value={t("contact.founded")}
          className="h-[47px] w-[277px] md:col-span-2 md:col-start-4 md:h-auto md:-translate-x-1"
          animated={animated}
        />
        {/* 左缘对齐导航右区（目录）：版心右边向左 --su*507，脱离栅格绝对定位 */}
        <ContactFact
          label={t("contact.servicesLabel")}
          value={t("contact.services")}
          className="w-[345px] md:absolute md:left-[calc(100%-var(--su-hero)*507)] md:top-0 md:w-max"
          highlighted
          animated={animated}
        />
      </dl>
    </div>
  );
}

type ContactButtonContentProps = {
  flipRef: Ref<FlipCharsHandle>;
  label: string;
  copiedLabel: string;
  reserveLabel: string;
  arrowSrc: string;
  className: string;
  fontClassName: string;
  /** 尾部图标对齐文字视觉中线的垂直补偿 */
  trailingNudge: string;
  animated?: boolean;
};

function ContactButtonContent({
  flipRef,
  label,
  copiedLabel,
  reserveLabel,
  arrowSrc,
  className,
  fontClassName,
  trailingNudge,
  animated = false,
}: ContactButtonContentProps) {
  return (
    <span
      data-sd-words={animated ? "" : undefined}
      data-sd-delay={animated ? "0.35" : undefined}
      aria-label={label}
      className={`relative z-10 flex h-full items-center whitespace-nowrap text-24 font-normal uppercase leading-[34px] md:text-[length:calc(var(--su)*48)] md:leading-[calc(var(--su)*68)] ${fontClassName} ${className}`}
    >
      <span className={`sd-word inline-flex items-center leading-none ${animated ? "opacity-0" : ""}`}>
        <FlipChars
          ref={flipRef}
          label={label}
          reserveLabel={reserveLabel}
          flipOnChange
          trailing={(layerLabel) => (
            <span className={`inline-flex items-center ${trailingNudge}`}>
              {layerLabel === copiedLabel ? (
                <CopyCheckIcon variant="contact" />
              ) : (
                <ContactArrow src={arrowSrc} animated={false} />
              )}
            </span>
          )}
        />
      </span>
    </span>
  );
}

function ContactArrow({
  src,
  animated,
}: {
  src: string;
  animated: boolean;
}) {
  const motionClass =
    "transition-transform duration-500 ease-out motion-reduce:transition-none";

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex size-6 shrink-0 items-center justify-center self-center overflow-hidden md:size-[calc(var(--su)*51)] ${
        animated ? "sd-word opacity-0" : ""
      }`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 767px) 24px, calc(100vw * 51 / 1440)"
        className={`object-contain group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full ${motionClass}`}
      />
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 767px) 24px, calc(100vw * 51 / 1440)"
        className={`-translate-x-full translate-y-full object-contain group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 motion-reduce:hidden ${motionClass}`}
      />
    </span>
  );
}

type ContactFactProps = {
  label: string;
  value: string;
  className: string;
  valueClassName?: string;
  highlighted?: boolean;
  animated?: boolean;
};

function ContactFact({
  label,
  value,
  className,
  valueClassName = "text-14 leading-5 md:text-[length:calc(var(--su)*14)] md:leading-[calc(var(--su)*20)]",
  highlighted = false,
  animated = false,
}: ContactFactProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <dt className="font-serif-sc text-12 font-normal leading-[18px] text-grey-300 md:text-[length:calc(var(--su)*12)] md:leading-[calc(var(--su)*18)]">
        <span
          data-sd-words={animated ? "" : undefined}
          data-sd-delay={animated ? "0.5" : undefined}
          aria-label={label}
        >
          <SplitWords text={label} animated={animated} />
        </span>
      </dt>
      <dd
        data-sd-words={animated ? "" : undefined}
        data-sd-delay={animated ? "0.6" : undefined}
        aria-label={value}
        className={`relative font-serif-sc font-normal ${valueClassName} ${
          highlighted
            ? "flex h-[26px] w-max items-center whitespace-nowrap text-white md:h-[calc(var(--su)*26)] md:w-[calc(var(--su-hero)*507+var(--page-margin)/4+17.5px-12.5vw)]"
            : "text-grey-400"
        }`}
      >
        {highlighted && (
          <span
            data-sd-bar={animated ? "" : undefined}
            data-sd-delay={animated ? "0.6" : undefined}
            aria-hidden="true"
            className={`absolute inset-0 origin-left bg-grey-400 ${
              animated ? "scale-x-0" : ""
            }`}
          />
        )}
        <span className="relative z-10">
          <SplitWords text={value} animated={animated} />
        </span>
      </dd>
    </div>
  );
}
