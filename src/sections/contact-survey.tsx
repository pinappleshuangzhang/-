"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { useScreenActive } from "@/components/providers/section-pager-provider";
import { CopiedBubble, CopiedToast } from "@/components/ui/copied-bubble";
import { FlipHoverButton } from "@/components/ui/flip-hover-button";
import { ScreenShell } from "@/components/ui/screen-shell";
import { ContactMachine } from "@/sections/contact-machine";
import { SplitWords } from "@/components/ui/split-words";
import { useCopyTarget } from "@/lib/copy-text";

const CONTACT_EMAIL = "grava.6.67430@gmail.com";
const CONTACT_PHONE = "+86 13016116021";

/**
 * 最后一屏：ARCHIVE_GA_005《联系我们》。
 * 背景取件机由共享背景层提供，这里只承载调查文案与联系方式。
 * 图片进屏才挂载：六屏都叠在视口里，一进站就下会和开场视频抢带宽。
 */
export function ContactSurvey() {
  const { t } = useLocale();
  const { copiedKey, copy } = useCopyTarget();
  const isActive = useScreenActive();
  const [mediaReady, setMediaReady] = useState(false);
  if (isActive && !mediaReady) setMediaReady(true);

  return (
    <ScreenShell aria-label={t("contactSurvey.aria")}>
      <div id="contact" className="absolute inset-0 z-10">
        <CopiedToast label={t("contact.copied")} visible={copiedKey !== null} />

        {/*
         * 桌面态把文案铺在一张与背景同步 cover 缩放的 1440×800 稿面层上：
         * 层内 --su = 背景 cover 倍率，内容随取件机一起放大、一起裁切。
         * 移动端 display:contents，子元素仍相对 #contact 按 390 画板定位。
         */}
        <div className="contents md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2 stage-cover-1440">
          <ContactMachine />
          {/* 移动端英文会折行，三组改为纵向流动；桌面仍按稿面绝对定位 */}
          <div className="absolute inset-x-5 top-[112px] flex flex-col items-center gap-2 [@media(max-width:767px)_and_(min-height:860px)]:top-auto [@media(max-width:767px)_and_(min-height:860px)]:bottom-[calc(41vh+80px)] md:contents">
          <h1
            data-sd-words
            data-sd-delay="0.2"
            aria-label={t("contactSurvey.headline")}
            className="w-full max-w-[340px] text-center font-serif-sc text-14 font-normal leading-6 text-grey-400 md:absolute md:left-[calc(var(--su)*707.5)] md:top-[calc(var(--su)*114)] md:w-max md:max-w-none md:-translate-x-1/2 md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*26)]"
          >
            <SplitWords text={t("contactSurvey.headline")} />
          </h1>

          <div className="flex w-full max-w-[340px] flex-col gap-1 text-center font-serif-sc text-14 font-normal text-grey-400 md:absolute md:left-[calc(var(--su)*707.5)] md:top-[calc(var(--su)*151)] md:block md:w-[calc(var(--su)*491)] md:max-w-none md:-translate-x-1/2 md:text-[length:calc(var(--su)*16)]">
            <SurveyLine delay="0.3" before={t("contactSurvey.line1")}>
              <SurveyIcon
                src="/contact-survey/survey-icon-1.webp"
                load={mediaReady}
              />
            </SurveyLine>
            <SurveyLine delay="0.35" after={t("contactSurvey.line2")}>
              <SurveyIcon
                src="/contact-survey/survey-icon-2.webp"
                load={mediaReady}
              />
            </SurveyLine>
            <SurveyLine delay="0.4" before={t("contactSurvey.line3")}>
              <SurveyIcon
                src="/contact-survey/survey-icon-3.webp"
                load={mediaReady}
              />
            </SurveyLine>
            <SurveyLine delay="0.45" before={t("contactSurvey.line4")} />
          </div>

          <div className="flex flex-col items-center gap-3 md:absolute md:left-[calc(var(--su)*707.5)] md:top-[calc(var(--su)*315)] md:-translate-x-1/2 md:flex-row md:gap-[calc(var(--su)*24)]">
            <ContactCopyButton
              label={CONTACT_EMAIL}
              ariaLabel={`${t("contactSurvey.emailAria")} ${CONTACT_EMAIL}`}
              copiedLabel={t("contact.copied")}
              copied={copiedKey === "email"}
              onCopy={() => {
                void copy("email", CONTACT_EMAIL);
              }}
              delay="0.55"
              icon={
                mediaReady ? (
                  <Image
                    src="/contact-survey/icon-mail.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="size-4 shrink-0 translate-y-0.5 md:size-[calc(var(--su)*20)] md:translate-y-[calc(var(--su)*2)]"
                  />
                ) : null
              }
            />
            <ContactCopyButton
              label={CONTACT_PHONE}
              ariaLabel={`${t("contactSurvey.phoneAria")} ${CONTACT_PHONE}`}
              copiedLabel={t("contact.copied")}
              copied={copiedKey === "phone"}
              onCopy={() => {
                void copy("phone", CONTACT_PHONE);
              }}
              delay="0.6"
              icon={
                mediaReady ? (
                  <Image
                    src="/contact-survey/icon-phone.svg"
                    alt=""
                    width={22}
                    height={20}
                    className="h-4 w-[17px] shrink-0 translate-y-px md:h-[calc(var(--su)*20)] md:w-[calc(var(--su)*22)] md:translate-y-[calc(var(--su)*1)]"
                  />
                ) : null
              }
            />
          </div>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

/**
 * 正文单行：文案与括号内的图标插槽同处一行。
 * 行高 38 与插槽内图标的纵向对位绑定，改动需同步核对。
 */
function SurveyLine({
  before,
  after,
  delay,
  children,
}: {
  before?: string;
  after?: string;
  delay?: string;
  children?: ReactNode;
}) {
  const text = [before, after].filter(Boolean).join(" ");

  return (
    <p
      data-sd-words
      data-sd-delay={delay}
      aria-label={text}
      className="leading-7 md:leading-[calc(var(--su)*38)]"
    >
      {before && <SplitWords text={before} />}
      {children && (
        <>
          {/* 稿面括号组前后各留一个空格；行首空格须用 nbsp，否则被行盒吃掉 */}
          {before ? " " : "\u00A0"}
          <span className="sd-word inline-block opacity-0">(</span>
          {children}
          <span className="sd-word inline-block opacity-0">)</span>
          {after && " "}
        </>
      )}
      {after && <SplitWords text={after} />}
    </p>
  );
}

/** 括号内的图标插槽：图标可超出行高，不参与行盒撑高 */
function GapSlot({ children }: { children: ReactNode }) {
  return (
    <span className="sd-word relative inline-block h-[1em] w-7 align-middle opacity-0 md:w-[calc(var(--su)*36)]">
      {children}
    </span>
  );
}

/** 括号内图标：源图 108×108，移动端 26，桌面稿面 28 */
function SurveyIcon({ src, load }: { src: string; load: boolean }) {
  return (
    <GapSlot>
      <span className="absolute left-1/2 top-1/2 block size-[26px] -translate-x-1/2 -translate-y-1/2 md:size-[calc(var(--su)*28)]">
        {load ? (
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 767px) 26px, 28px"
            className="object-contain"
          />
        ) : null}
      </span>
    </GapSlot>
  );
}

/** 联系方式：点击复制文本，上方弹出「已复制」气泡。悬停逐字翻滚，与导航相同。 */
function ContactCopyButton({
  label,
  ariaLabel,
  copiedLabel,
  copied,
  onCopy,
  icon,
  delay,
}: {
  label: string;
  ariaLabel: string;
  copiedLabel: string;
  copied: boolean;
  onCopy: () => void;
  icon: ReactNode;
  delay: string;
}) {
  return (
    <span
      data-sd-words
      data-sd-delay={delay}
      className="inline-flex items-center gap-2 md:gap-[calc(var(--su)*8)]"
    >
      <span className="sd-word inline-flex shrink-0 opacity-0">{icon}</span>
      <FlipHoverButton
        label={label}
        aria-label={copied ? copiedLabel : ariaLabel}
        aria-live="polite"
        showHoverMark={false}
        onClick={onCopy}
        className="sd-word font-serif-sc text-16 font-normal leading-[23px] text-grey-400 opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*26)] [&_[data-flip-in]]:underline [&_[data-flip-out]]:underline [&_[data-flip-in]]:decoration-solid [&_[data-flip-out]]:decoration-solid [&_[data-flip-in]]:underline-offset-2 [&_[data-flip-out]]:underline-offset-2"
      >
        <CopiedBubble label={copiedLabel} visible={copied} />
      </FlipHoverButton>
    </span>
  );
}
