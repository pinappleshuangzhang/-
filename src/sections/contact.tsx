"use client";

import Image from "next/image";
import { SpotlightReveal } from "@/components/effects/spotlight-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SplitWords } from "@/components/ui/split-words";
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
        className="absolute inset-0 z-[5]"
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
  const Title = heading;
  const titleFont = locale === "en" ? "font-bodoni" : "font-serif-sc";

  return (
    <div className="absolute inset-0 z-10">
      <Title
        data-sd-words={animated ? "" : undefined}
        data-sd-delay={animated ? "0.2" : undefined}
        aria-label={t("contact.cta")}
        className={`absolute left-3 top-[109px] whitespace-nowrap text-24 font-normal uppercase leading-[34px] text-grey-400 md:left-5 md:top-[133px] md:text-48 md:leading-[68px] ${titleFont}`}
      >
        <SplitWords text={t("contact.cta")} animated={animated} />
      </Title>

      <a
        href="mailto:shuangzhang@fintopia.tech"
        aria-label={`${t("contact.button")}：shuangzhang@fintopia.tech`}
        className={`group absolute left-3 top-[150px] h-[34px] text-left focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 md:left-5 md:top-[204px] md:h-[69px] ${
          locale === "en"
            ? "w-[205px] md:w-[410px]"
            : "w-[177px] md:w-[325px]"
        }`}
      >
        <span
          data-sd-bar={animated ? "" : undefined}
          data-sd-delay={animated ? "0.35" : undefined}
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 w-full origin-left bg-grey-400 ${
            locale === "en"
              ? "top-px h-[29px] md:bottom-3.5 md:top-auto md:h-[60px]"
              : "top-px h-[29px] md:top-0.5 md:h-[66px] md:translate-y-px"
          } ${animated ? "scale-x-0" : ""}`}
        />
        <ContactButtonContent
          label={t("contact.button")}
          arrowSrc="/contact/contact-arrow-white.webp"
          className="text-white"
          fontClassName={titleFont}
          animated={animated}
        />
      </a>

      <dl className="absolute left-3 top-[256px] flex w-[345px] flex-col gap-8 md:left-5 md:right-5 md:top-[379px] md:grid md:w-auto md:grid-cols-8 md:gap-5">
        <ContactFact
          label={t("contact.addressLabel")}
          value={t("contact.address")}
          className="h-[50px] w-[139px] md:col-start-1 md:h-auto md:w-[180px]"
          valueClassName="whitespace-nowrap text-16 leading-6"
          animated={animated}
        />
        <ContactFact
          label={t("contact.foundedLabel")}
          value={t("contact.founded")}
          className="h-[47px] w-[277px] md:col-span-2 md:col-start-4 md:h-auto md:-translate-x-1"
          animated={animated}
        />
        <ContactFact
          label={t("contact.servicesLabel")}
          value={t("contact.services")}
          className="w-[345px] md:col-span-2 md:col-start-6 md:translate-x-1.5"
          highlighted
          animated={animated}
        />
      </dl>
    </div>
  );
}

type ContactButtonContentProps = {
  label: string;
  arrowSrc: string;
  className: string;
  fontClassName: string;
  positionClassName?: string;
  animated?: boolean;
};

function ContactButtonContent({
  label,
  arrowSrc,
  className,
  fontClassName,
  positionClassName = "left-0 top-0",
  animated = false,
}: ContactButtonContentProps) {
  return (
    <span
      data-sd-words={animated ? "" : undefined}
      data-sd-delay={animated ? "0.35" : undefined}
      aria-label={label}
      className={`absolute flex h-[34px] items-center gap-1.5 whitespace-nowrap text-24 font-normal uppercase leading-[34px] md:h-[69px] md:text-48 md:leading-[68px] ${fontClassName} ${positionClassName} ${className}`}
    >
      <span>
        <SplitWords text={label} animated={animated} />
      </span>
      <ContactArrow src={arrowSrc} animated={animated} />
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
      className={`sd-word relative block size-6 shrink-0 overflow-hidden md:-top-0.5 md:size-[51px] ${
        animated ? "opacity-0" : ""
      }`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 767px) 24px, 51px"
        className={`object-contain group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full ${motionClass}`}
      />
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 767px) 24px, 51px"
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
  valueClassName = "text-14 leading-5",
  highlighted = false,
  animated = false,
}: ContactFactProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <dt className="font-serif-sc text-12 font-normal leading-[18px] text-grey-300">
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
            ? "flex h-[26px] items-center text-white"
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
