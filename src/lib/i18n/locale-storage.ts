import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/messages";

/** localStorage 与 cookie 共用键名，cookie 供 SSR 首屏读语言 */
export const LOCALE_STORAGE_KEY = "grava-locale";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseLocale(value: string | null | undefined): Locale {
  return value === "zh" || value === "en" ? value : DEFAULT_LOCALE;
}

/** 客户端写入 cookie，供下次请求的 layout SSR 使用 */
export function persistLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
