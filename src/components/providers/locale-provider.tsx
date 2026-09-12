"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  MESSAGES,
  type Locale,
  type MessageKey,
} from "@/lib/i18n/messages";
import {
  LOCALE_STORAGE_KEY,
  parseLocale,
  persistLocaleCookie,
} from "@/lib/i18n/locale-storage";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// 语言状态放在组件外的微型 store：服务端用 cookie/默认语言，
// 客户端读 localStorage；两者在切换时同步，避免刷新后先闪中文。
let cachedLocale: Locale | null = null;
const localeListeners = new Set<() => void>();

function readLocale(): Locale {
  if (cachedLocale) return cachedLocale;
  try {
    cachedLocale = parseLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    // 隐私模式等场景下忽略本地存储
    cachedLocale = DEFAULT_LOCALE;
  }
  return cachedLocale;
}

function subscribeLocale(listener: () => void) {
  localeListeners.add(listener);
  return () => {
    localeListeners.delete(listener);
  };
}

function writeLocale(next: Locale) {
  cachedLocale = next;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // 忽略写入失败
  }
  try {
    persistLocaleCookie(next);
  } catch {
    // 忽略 cookie 写入失败
  }
  localeListeners.forEach((listener) => listener());
}

type LocaleProviderProps = {
  children: ReactNode;
  /** 来自 cookie 的服务端语言，保证 SSR 与水合后一致 */
  initialLocale?: Locale;
};

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LocaleProviderProps) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    readLocale,
    () => initialLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.locale = locale;
    // 旧会话可能只有 localStorage：补写 cookie，下次刷新 SSR 即为正确语言。
    try {
      persistLocaleCookie(locale);
    } catch {
      // 忽略
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next);
  }, []);

  const t = useCallback(
    (key: MessageKey) => MESSAGES[locale][key] ?? MESSAGES.zh[key] ?? key,
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocale 必须在 LocaleProvider 内使用");
  }
  return value;
}
