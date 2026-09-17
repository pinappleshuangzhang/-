"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { useLocale } from "@/components/providers/locale-provider";
import { useSectionPager } from "@/components/providers/section-pager-provider";
import { ContactForm } from "@/components/ui/contact-form";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  closeContactDialog,
  useContactDialogOpen,
} from "@/lib/contact-dialog-store";
import flapImg from "../../../public/contact/contact-dialog-flap.webp";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CARD_ENTER = {
  autoAlpha: 0,
  yPercent: -55,
  y: 0,
  z: -220,
  rotationY: -80,
  rotationX: 18,
  scale: 0.86,
};
const CARD_SHOWN = {
  autoAlpha: 1,
  yPercent: 0,
  y: 0,
  z: 0,
  rotationY: 0,
  rotationX: 0,
  scale: 1,
};
const CARD_EXIT = {
  autoAlpha: 0,
  yPercent: 55,
  y: 0,
  z: -220,
  rotationY: 80,
  rotationX: -16,
  scale: 0.86,
};

/**
 * 联系表单弹窗（Figma 1323-10073 / 1327-147）：
 * 白色信纸卡片 + 底部黑色信封口。
 * 入场：3D 翻转同时自上方落到中间；退场：翻转同时从中间落到下方。
 */
export function ContactDialog() {
  const open = useContactDialogOpen();
  const { locale, t } = useLocale();
  const { registerScrollInterceptor } = useSectionPager();
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(open);
  const [sent, setSent] = useState(false);
  if (open && !mounted) setMounted(true);
  if (!mounted && sent) setSent(false);

  const titleFont = locale === "en" ? "font-bodoni" : "font-serif-sc";

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const card = cardRef.current;
    if (!overlay || !card || !mounted) return;

    gsap.set(card, {
      transformPerspective: 900,
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      force3D: true,
    });

    if (reducedMotion) {
      gsap.set(overlay, { opacity: open ? 1 : 0 });
      gsap.set(card, open ? CARD_SHOWN : { autoAlpha: 0, yPercent: 0, y: 0 });
      if (open) return;
      const frame = window.requestAnimationFrame(() => setMounted(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const tl = gsap.timeline();
    if (open) {
      tl.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 1.15, ease: "none" },
        0,
      );
      tl.fromTo(
        card,
        CARD_ENTER,
        { ...CARD_SHOWN, duration: 1.15, ease: "power4.out" },
        0,
      );
    } else {
      tl.eventCallback("onComplete", () => setMounted(false));
      tl.to(overlay, { opacity: 0, duration: 0.9, ease: "none" }, 0);
      tl.to(card, { ...CARD_EXIT, duration: 0.9, ease: "power4.in" }, 0);
    }
    return () => {
      tl.kill();
    };
  }, [open, mounted, reducedMotion]);

  useEffect(() => {
    if (!open) return;
    const unregister = registerScrollInterceptor(() => true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 打开时聚焦弹窗容器，避免自动聚焦输入框把标签抬起
    const focusTimer = window.setTimeout(() => {
      rootRef.current?.focus({ preventScroll: true });
    }, 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeContactDialog();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unregister();
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, registerScrollInterceptor]);

  if (!mounted) return null;

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const root = rootRef.current;
    if (!root) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.tabIndex !== -1);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-contact-dialog=""
      data-lenis-prevent=""
      onKeyDown={trapFocus}
      tabIndex={-1}
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden p-3 outline-none ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <button
        ref={overlayRef}
        type="button"
        tabIndex={-1}
        aria-label={t("nav.close")}
        onClick={closeContactDialog}
        className="absolute inset-0 touch-none bg-grey-400/60 opacity-0 focus-visible:outline-none"
      />
      <div
        ref={cardRef}
        className="relative z-10 w-[min(537px,100%)] bg-white opacity-0"
      >
        <div className="flex max-h-[calc(100dvh-24px)] flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col px-7 pt-7">
            <div className="flex items-start justify-between gap-5">
              <h2
                id={titleId}
                className={`text-16 font-normal leading-6 text-grey-400 md:text-20 md:leading-7 ${titleFont}`}
              >
                {sent ? t("contactForm.successTitle") : t("contactForm.title")}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={t("nav.close")}
                onClick={closeContactDialog}
                className="group relative -mr-1 -mt-0.5 flex size-8 shrink-0 items-center justify-center text-grey-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400"
              >
                <span
                  aria-hidden="true"
                  className="relative size-[22px] transition-transform duration-500 ease-out group-hover:rotate-[360deg] group-focus-visible:rotate-[360deg] motion-reduce:transition-none"
                >
                  <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 rotate-45 bg-current" />
                  <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 -rotate-45 bg-current" />
                </span>
              </button>
            </div>

            <div className="mt-10">
              {sent ? (
                <p
                  className={`min-h-[120px] text-14 leading-6 text-grey-300 ${titleFont}`}
                >
                  {t("contactForm.successBody")}
                </p>
              ) : (
                <ContactForm
                  firstFieldRef={firstFieldRef}
                  onSent={() => setSent(true)}
                />
              )}
            </div>
          </div>

          <div className="relative mt-1 aspect-[1074/353] w-full shrink-0">
            <Image
              src={flapImg}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 537px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
