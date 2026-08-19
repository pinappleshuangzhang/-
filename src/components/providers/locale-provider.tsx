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

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "grava-locale";

// 语言状态放在组件外的微型 store：服务端渲染固定用默认语言，
// 水合后 useSyncExternalStore 读到本地存储的语言再自动重渲染，
// 避免在 effect 里同步 setState 造成级联渲染。
let cachedLocale: Locale | null = null;
const localeListeners = new Set<() => void>();

function readLocale(): Locale {
  if (cachedLocale) return cachedLocale;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    cachedLocale = saved === "zh" || saved === "en" ? saved : DEFAULT_LOCALE;
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
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 忽略写入失败
  }
  localeListeners.forEach((listener) => listener());
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    readLocale,
    () => DEFAULT_LOCALE,
  );

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.locale = locale;
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
