"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { CopiedBubble, CopiedToast } from "@/components/ui/copied-bubble";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SplitWords } from "@/components/ui/split-words";
import { useCopyTarget } from "@/lib/copy-text";

const CONTACT_EMAIL = "grava.6.67430@gmail.com";
const CONTACT_PHONE = "+86 13016116021";

/**
 * 稿面 1440×800（Figma 1489:292）：标题、正文、联系方式三组的中心都落在 707.5，
 * 比画板中线左移 12.5，用于对齐背景中的取件机。
 * 桌面态的 left 是稿面层内坐标（见 stage-cover-1440），移动端按 390 画板居中。
 */
const GROUP_CENTER =
  "left-1/2 -translate-x-1/2 md:left-[calc(var(--su)*707.5)]";

/**
 * 最后一屏：GA_ARCHIVE_004《开启一份新调查》。
 * 背景取件机由共享背景层提供，这里只承载调查文案与联系方式。
 */
export function ContactSurvey() {
  const { t } = useLocale();
  const { copiedKey, copy } = useCopyTarget();

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
          <h1
            data-sd-words
            data-sd-delay="0.2"
            aria-label={t("contactSurvey.headline")}
            className={`absolute top-[137px] w-[266px] text-center font-serif-sc text-14 font-normal uppercase leading-5 text-grey-400 md:top-[calc(var(--su)*114)] md:w-max md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*26)] ${GROUP_CENTER}`}
          >
            <SplitWords text={t("contactSurvey.headline")} />
          </h1>

          <div
            className={`absolute top-[169px] w-[266px] text-center font-serif-sc text-14 font-normal uppercase text-grey-400 md:top-[calc(var(--su)*151)] md:w-[calc(var(--su)*491)] md:text-[length:calc(var(--su)*16)] ${GROUP_CENTER}`}
          >
            <SurveyLine delay="0.3" before={t("contactSurvey.line1")}>
              <SurveyIcon src="/contact-survey/survey-icon-1.webp" />
            </SurveyLine>
            <SurveyLine delay="0.35" after={t("contactSurvey.line2")}>
              <SurveyIcon src="/contact-survey/survey-icon-2.webp" />
            </SurveyLine>
            <SurveyLine delay="0.4" before={t("contactSurvey.line3")}>
              <SurveyIcon src="/contact-survey/survey-icon-3.webp" />
            </SurveyLine>
            <SurveyLine delay="0.45" before={t("contactSurvey.line4")} />
          </div>

          <div
            className={`absolute top-[297px] flex flex-col items-center gap-3 md:top-[calc(var(--su)*315)] md:flex-row md:gap-[calc(var(--su)*24)] ${GROUP_CENTER}`}
          >
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
                <Image
                  src="/contact-survey/icon-mail.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-4 shrink-0 md:size-[calc(var(--su)*20)]"
                />
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
                <Image
                  src="/contact-survey/icon-phone.svg"
                  alt=""
                  width={22}
                  height={20}
                  className="h-4 w-[17px] shrink-0 md:h-[calc(var(--su)*20)] md:w-[calc(var(--su)*22)]"
                />
              }
            />
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
      className="leading-[29px] md:leading-[calc(var(--su)*38)]"
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

/** 括号内图标：源图 108×108，按稿面占位 28×28 居中 */
function SurveyIcon({ src }: { src: string }) {
  return (
    <GapSlot>
      <span className="absolute left-1/2 top-1/2 block size-[18px] -translate-x-1/2 -translate-y-1/2 md:size-[calc(var(--su)*28)]">
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 767px) 18px, 28px"
          className="object-contain"
        />
      </span>
    </GapSlot>
  );
}

/** 联系方式：点击复制文本，上方弹出「已复制」气泡 */
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
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      aria-label={copied ? copiedLabel : ariaLabel}
      data-sd-words
      data-sd-delay={delay}
      className="relative flex items-end gap-2 font-serif-sc text-16 font-normal leading-[23px] text-grey-400 underline decoration-solid underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 md:gap-[calc(var(--su)*8)] md:text-[length:calc(var(--su)*16)] md:leading-[calc(var(--su)*26)]"
    >
      <CopiedBubble label={copiedLabel} visible={copied} />
      <span className="sd-word inline-flex shrink-0 opacity-0">{icon}</span>
      <span className="sd-word inline-block whitespace-nowrap opacity-0">
        {label}
      </span>
    </button>
  );
}
