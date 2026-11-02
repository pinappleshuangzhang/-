/**
 * 对外分享用的地址后缀。只用英文和连字符，复制、转发时不会变成 %E5%91%A8 这类编码。
 * 中英文界面共用同一条地址。
 * legacy 是改版前的中文后缀，旧链接仍能打开，打开后地址栏会换成现在的英文后缀。
 */
const SCREEN_ROUTES: { key: string; slug: string; legacy: string[] }[] = [
  { key: "studio", slug: "archive-home", legacy: ["档案室首页"] },
  { key: "archive-ga-001", slug: "what-is-gravity", legacy: ["什么是引力？"] },
  { key: "archive-ga-002", slug: "organization", legacy: ["组织记录"] },
  { key: "archive-ga-003", slug: "members", legacy: ["成员记录"] },
  { key: "archive-ga-004", slug: "investigations", legacy: ["视觉调查档案"] },
  { key: "contact", slug: "contact", legacy: ["联系我们"] },
];

/**
 * 与 SURVEY_WORKS 顺序一致。后缀是完整英文名，空格写成连字符，
 * 标点不进地址。新增作品时在这里补一条。
 */
const WORK_ROUTES: { slug: string; legacy: string[] }[] = [
  {
    slug: "The-Apple-Moment-AI-Creativity-Program",
    legacy: ["苹果时刻：AI创造力实验计划", "apple-moment"],
  },
  {
    slug: "Future-Creative-2026",
    legacy: ["未来创意2026", "future-creative-2026"],
  },
  {
    slug: "Easycash-Digital-Visual-Reframing",
    legacy: ["Easycash数字品牌视觉重塑", "easycash-visual"],
  },
  {
    slug: "Design-AI-Ops-Field-Notes",
    legacy: ["DesignAIOps实战笔记", "design-ai-ops"],
  },
  {
    slug: "Easycash-9th-Anniversary-Visual-System",
    legacy: ["Easycash9周年视觉系统", "easycash-9th"],
  },
  {
    slug: "Shared-Website-Architecture",
    legacy: ["金融产品网站重构，打造跨地区通用架构", "shared-architecture"],
  },
];

const GALLERY_SCREEN_KEY = "archive-ga-004";

export type PageLocation =
  | { type: "intro" }
  | { type: "screen"; screenKey: string }
  | { type: "work"; workIndex: number };

/** 旧中文地址里不留空格，对照时同样去掉。 */
function legacySlug(title: string) {
  return title.replace(/^《/, "").replace(/》$/, "").replace(/\s+/g, "");
}

export function workSlug(workIndex: number) {
  return WORK_ROUTES[workIndex]?.slug ?? null;
}

export function screenPath(screenKey: string) {
  const route = SCREEN_ROUTES.find((item) => item.key === screenKey);
  if (!route) return "/";
  return `/${route.slug}`;
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

function matchesSlug(slug: string, route: { slug: string; legacy: string[] }) {
  return route.slug === slug || route.legacy.includes(legacySlug(slug));
}

/** 认不出的地址返回 null，调用方回到进站加载幕。 */
export function resolvePathname(pathname: string): PageLocation | null {
  const path = normalizePath(pathname);
  if (path === "/") return { type: "intro" };

  const slug = path.slice(1);
  const screen = SCREEN_ROUTES.find((item) => matchesSlug(slug, item));
  if (screen) return { type: "screen", screenKey: screen.key };

  const workIndex = WORK_ROUTES.findIndex((item) => matchesSlug(slug, item));
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
