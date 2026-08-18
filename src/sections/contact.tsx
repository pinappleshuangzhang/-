"use client";

import Image from "next/image";
import { useLocale } from "@/components/providers/locale-provider";
import { ScreenShell } from "@/components/ui/screen-shell";

/**
 * 最后一屏：GA_ARCHIVE_006《开启一份新调查》。
 * 背景由共享背景层提供，这里只承载设计稿中的联系信息。
 */
export function Contact() {
  const { t } = useLocale();

  return (
    <ScreenShell aria-label={t("contact.aria")}>
      <div
        id="contact"
        className="absolute left-[11.528%] top-[31.375%] flex w-[374px] flex-col gap-11"
      >
        <div className="flex w-[342px] flex-col gap-6">
          <h1 className="font-bodoni text-44 font-normal uppercase leading-[52px] text-grey-400">
            Grava Design
            <br />
            Studio
          </h1>
          <p className="font-serif-sc text-20 font-normal uppercase leading-[28px] text-grey-400">
            China Beijing
          </p>
        </div>

        <div aria-hidden="true" className="relative h-px w-[373px]">
          <Image
            src="/contact/divider.svg"
            alt=""
            fill
            sizes="373px"
            className="object-fill"
          />
        </div>

        <div className="flex w-[280px] flex-col items-start gap-6">
          <p className="font-serif-sc text-20 font-normal uppercase leading-normal text-grey-400">
            {t("contact.cta")}
          </p>
          <button
            type="button"
            className="rounded-rs-4 bg-grey-400 px-5 py-1.5 text-white transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <span className="flex items-center justify-center rounded-rs-2 px-1.5 pb-1 pt-0.5 font-serif-sc text-20 font-normal uppercase leading-[28px]">
              {t("contact.button")}
            </span>
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
