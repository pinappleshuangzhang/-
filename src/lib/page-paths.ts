import { MESSAGES, type MessageKey } from "@/lib/i18n/messages";
import { SURVEY_WORKS } from "@/lib/survey-details";

/**
 * 对外分享用的地址后缀。与档案目录、作品抽屉的中文名称一致，
 * 不随界面语言改变，这样同一条链接在中英文下都打开同一处。
 * 书名号只出现在界面上，不进地址。
 */
const SCREEN_ROUTES: { key: string; titleKey: MessageKey }[] = [
  { key: "studio", titleKey: "index.ga000" },
  { key: "archive-ga-001", titleKey: "index.ga001" },
  { key: "archive-ga-002", titleKey: "index.ga002" },
  { key: "archive-ga-003", titleKey: "index.ga003" },
  { key: "archive-ga-004", titleKey: "index.ga004" },
  { key: "contact", titleKey: "index.ga005" },
];

const GALLERY_SCREEN_KEY = "archive-ga-004";

export type PageLocation =
  | { type: "intro" }
  | { type: "screen"; screenKey: string }
  | { type: "work"; workIndex: number };

/** 地址里不留空格，否则浏览器会把它显示成 %20。 */
function toSlug(title: string) {
  return title.replace(/^《/, "").replace(/》$/, "").replace(/\s+/g, "");
}

function screenSlug(titleKey: MessageKey) {
  return toSlug(MESSAGES.zh[titleKey]);
}

export function workSlug(workIndex: number) {
  const work = SURVEY_WORKS[workIndex];
  if (!work) return null;
  return toSlug(MESSAGES.zh[work.titleKey]);
}

export function screenPath(screenKey: string) {
  const route = SCREEN_ROUTES.find((item) => item.key === screenKey);
  if (!route) return "/";
  return `/${screenSlug(route.titleKey)}`;
}

export function normalizePath(pathname: string) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }
  if (decoded.length > 1 && decoded.endsWith("/")) {
    decoded = decoded.slice(0, -1);
  }
  return decoded || "/";
}

/** 认不出的地址返回 null，调用方回到进站加载幕。 */
export function resolvePathname(pathname: string): PageLocation | null {
  const path = normalizePath(pathname);
  if (path === "/") return { type: "intro" };

  const slug = toSlug(path.slice(1));
  const screen = SCREEN_ROUTES.find((item) => screenSlug(item.titleKey) === slug);
  if (screen) return { type: "screen", screenKey: screen.key };

  const workIndex = SURVEY_WORKS.findIndex(
    (work) => toSlug(MESSAGES.zh[work.titleKey]) === slug,
  );
  if (workIndex >= 0) return { type: "work", workIndex };
  return null;
}

export function isSameLocation(a: PageLocation | null, b: PageLocation | null) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "screen" && b.type === "screen") {
    return a.screenKey === b.screenKey;
  }
  if (a.type === "work" && b.type === "work") {
    return a.workIndex === b.workIndex;
  }
  return true;
}

export function screenIndexForLocation(
  location: PageLocation | null,
  screenKeys: readonly string[],
) {
  if (!location || location.type === "intro") return 0;
  const key =
    location.type === "work" ? GALLERY_SCREEN_KEY : location.screenKey;
  const index = screenKeys.indexOf(key);
  return index < 0 ? 0 : index;
}

export function pathForView(
  screenKey: string | undefined,
  workIndex: number | null,
) {
  if (screenKey === GALLERY_SCREEN_KEY && workIndex !== null) {
    const slug = workSlug(workIndex);
    if (slug) return `/${slug}`;
  }
  if (!screenKey) return "/";
  return screenPath(screenKey);
}
