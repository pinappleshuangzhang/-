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
import { SpotlightReveal } from "@/components/effects/spotlight-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SectionBackground } from "@/components/ui/section-background";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SECTION_BACKGROUNDS } from "@/lib/section-backgrounds";
import contactEmbossedBgImg from "../../public/contact/contact-embossed-bg.webp";

gsap.registerPlugin(useGSAP);

/**
 * 最后一屏：GA_ARCHIVE_006《开启一份新调查》。
 * 背景由共享背景层提供，这里只承载联系 CTA 与工作室信息。
 */
export function Contact() {
  const container = useRef<HTMLElement>(null);
  const isActive = useScreenActive();
  const reducedMotion = useReducedMotion();
  const { locale, t } = useLocale();

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
    { dependencies: [isActive, reducedMotion, locale], scope: container },
  );

  return (
    <ScreenShell ref={container} aria-label={t("contact.aria")}>
      <SpotlightReveal
        src={contactEmbossedBgImg}
        autoMove
        className="absolute inset-0 z-[5]"
      />
      <div id="contact">
        <ContactLayout heading="h1" animated />
      </div>
    </ScreenShell>
  );
}

/** 嵌在作品详情底部的整屏联系区块：自带联系页背景，不依赖分屏共享层。 */
export function ContactEmbed() {
  const { t } = useLocale();
  const background = SECTION_BACKGROUNDS.contact;

  return (
    <section
      aria-label={t("contact.aria")}
      className={`relative min-h-full overflow-hidden ${background.fallbackClassName}`}
    >
      <SectionBackground
        src={background.src}
        imageClassName={background.imageClassName}
        unoptimized={background.unoptimized}
      />
      <ContactLayout heading="h2" />
    </section>
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
        className={`absolute left-5 top-[133px] text-48 font-normal uppercase leading-[68px] text-grey-400 ${titleFont}`}
      >
        <SplitChars text={t("contact.cta")} animated={animated} />
      </Title>

      <a
        href="mailto:shuangzhang@fintopia.tech"
        aria-label={`${t("contact.button")}：shuangzhang@fintopia.tech`}
        className="group absolute left-5 top-[204px] h-[69px] w-[325px] overflow-hidden text-left focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0.5 h-[66px] w-full translate-y-px bg-grey-400"
        />
        <ContactButtonContent
          label={t("contact.button")}
          arrowSrc="/contact/contact-arrow-white.png"
          className="text-white"
          animated={animated}
        />
      </a>

      <dl className="absolute left-5 right-5 top-[379px] grid grid-cols-8 gap-5">
        <ContactFact
          label={t("contact.addressLabel")}
          value={t("contact.address")}
          className="col-start-1 w-[180px]"
          valueClassName="text-16 leading-6"
          animated={animated}
        />
        <ContactFact
          label={t("contact.foundedLabel")}
          value={t("contact.founded")}
          className="col-span-2 col-start-4 w-[277px] -translate-x-1"
          animated={animated}
        />
        <ContactFact
          label={t("contact.servicesLabel")}
          value={t("contact.services")}
          className="col-span-2 col-start-6 w-[345px] translate-x-1.5"
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
  positionClassName?: string;
  animated?: boolean;
};

function ContactButtonContent({
  label,
  arrowSrc,
  className,
  positionClassName = "left-0 top-0",
  animated = false,
}: ContactButtonContentProps) {
  return (
    <span
      data-sd-words={animated ? "" : undefined}
      data-sd-delay={animated ? "0.35" : undefined}
      aria-label={label}
      className={`absolute flex h-[69px] items-center gap-1.5 whitespace-nowrap font-serif-sc text-48 font-normal uppercase leading-[68px] ${positionClassName} ${className}`}
    >
      <span>
        <SplitChars text={label} animated={animated} />
      </span>
      <ContactArrow src={arrowSrc} />
    </span>
  );
}

function ContactArrow({ src }: { src: string }) {
  const motionClass =
    "transition-transform duration-500 ease-out motion-reduce:transition-none";

  return (
    <span aria-hidden="true" className="relative block size-[51px] overflow-hidden">
      <Image
        src={src}
        alt=""
        fill
        sizes="51px"
        className={`object-contain group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full ${motionClass}`}
      />
      <Image
        src={src}
        alt=""
        fill
        sizes="51px"
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
          <SplitChars text={label} animated={animated} />
        </span>
      </dt>
      <dd
        data-sd-words={animated ? "" : undefined}
        data-sd-delay={animated ? "0.6" : undefined}
        aria-label={value}
        className={`font-serif-sc font-normal ${valueClassName} ${
          highlighted
            ? "flex h-[26px] items-center bg-grey-400 text-white"
            : "text-grey-400"
        }`}
      >
        <SplitChars text={value} animated={animated} />
      </dd>
    </div>
  );
}

function SplitChars({ text, animated }: { text: string; animated: boolean }) {
  return (
    <>
      {Array.from(text).map((char, index) =>
        char === " " ? (
          "\u00A0"
        ) : (
          <span
            key={`${char}-${index}`}
            aria-hidden="true"
            className={`sd-word inline-block ${animated ? "opacity-0" : ""}`}
          >
            {char}
          </span>
        ),
      )}
    </>
  );
}
