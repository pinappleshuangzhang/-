"use client";

import {
  useId,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { useLocale } from "@/components/providers/locale-provider";
import {
  CONTACT_LIMITS,
  CONTACT_RECIPIENT,
  normalizeContactValues,
  validateContactValues,
  type ContactFormErrorCode,
  type ContactFormErrors,
  type ContactFormField,
  type ContactFormValues,
} from "@/lib/contact-form";
import type { MessageKey } from "@/lib/i18n/messages";

type SubmitStatus = "idle" | "sending" | "sent" | "failed";

type ContactFormProps = {
  firstFieldRef: RefObject<HTMLInputElement | null>;
  onSent: () => void;
};

const EMPTY_VALUES: ContactFormValues = { name: "", email: "", message: "" };

const ERROR_MESSAGE_KEY: Record<ContactFormErrorCode, MessageKey> = {
  required: "contactForm.errorRequired",
  email: "contactForm.errorEmail",
};

const FIELD_LABEL_KEY: Record<ContactFormField, MessageKey> = {
  name: "contactForm.name",
  email: "contactForm.email",
  message: "contactForm.message",
};

const FIELD_ORDER: ContactFormField[] = ["name", "email", "message"];

const FIELD_INPUT: Record<
  ContactFormField,
  { type: "text" | "email"; autoComplete: string; inputMode?: "email" }
> = {
  name: { type: "text", autoComplete: "name" },
  email: { type: "email", autoComplete: "email", inputMode: "email" },
  message: { type: "text", autoComplete: "off" },
};

/**
 * 标签贴在分割线上方 16px；聚焦或有值时标签上移 12px，分割线不动，出现光标。
 * 三项间距 36px（Figma 1327-105 / 1327-147）。
 */
function ContactField({
  field,
  id,
  label,
  labelClassName,
  value,
  error,
  disabled,
  inputRef,
  onChange,
}: {
  field: ContactFormField;
  id: string;
  label: string;
  labelClassName: string;
  value: string;
  error?: string;
  disabled: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  const config = FIELD_INPUT[field];

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-0 bottom-4 origin-left ${labelClassName} ${
          lifted ? "-translate-y-3" : "translate-y-0"
        }`}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={field}
        type={config.type}
        inputMode={config.inputMode}
        autoComplete={config.autoComplete}
        maxLength={CONTACT_LIMITS[field]}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        className={`relative block h-[30px] w-full appearance-none rounded-none border-0 border-b bg-transparent pt-2 pb-1 font-serif-sc text-12 font-medium leading-[18px] text-grey-400 caret-grey-400 outline-none focus-visible:border-grey-400 ${
          error ? "border-grey-400" : "border-grey-100"
        }`}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="pt-1 text-10 leading-[14px] text-grey-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** 弹窗内三段式表单：细标签 + 单线输入，底部黑色发送按钮。 */
export function ContactForm({ firstFieldRef, onSent }: ContactFormProps) {
  const { locale, t } = useLocale();
  const baseId = useId();
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const labelFont = locale === "en" ? "font-bodoni" : "font-serif-sc";
  const sending = status === "sending";

  const update = (field: ContactFormField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const normalized = normalizeContactValues(values);
    const nextErrors = validateContactValues(normalized);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstInvalid) {
        document.getElementById(`${baseId}-${firstInvalid}`)?.focus();
      }
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...normalized, locale }),
      });
      if (!response.ok) {
        setStatus("failed");
        return;
      }
      setStatus("sent");
      onSent();
    } catch {
      setStatus("failed");
    }
  };

  const labelClass = `text-10 font-normal leading-[14px] text-grey-400 transition-transform duration-300 ease-out motion-reduce:transition-none ${labelFont}`;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-9">
        {FIELD_ORDER.map((field) => (
          <ContactField
            key={field}
            field={field}
            id={`${baseId}-${field}`}
            label={t(FIELD_LABEL_KEY[field])}
            labelClassName={labelClass}
            value={values[field]}
            error={
              errors[field]
                ? t(ERROR_MESSAGE_KEY[errors[field]])
                : undefined
            }
            disabled={sending}
            inputRef={field === "name" ? firstFieldRef : undefined}
            onChange={(value) => update(field, value)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={sending}
          className={`inline-flex h-[47px] min-w-[220px] items-center justify-center bg-grey-400 px-20 py-3 text-16 font-normal leading-[23px] text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400 focus-visible:ring-offset-2 disabled:opacity-60 ${labelFont}`}
        >
          {sending ? t("contactForm.sending") : t("contactForm.send")}
        </button>
        {status === "failed" && (
          <p
            role="alert"
            className={`text-center text-10 leading-[14px] text-grey-300 ${labelFont}`}
          >
            {t("contactForm.errorSend")}{" "}
            <a
              href={`mailto:${CONTACT_RECIPIENT}`}
              className="text-grey-400 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grey-400"
            >
              {CONTACT_RECIPIENT}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
