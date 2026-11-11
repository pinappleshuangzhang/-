import gsap from "gsap";

/**
 * Son Daven（sondaven.com）式入场：参数取自其源码
 *   durM=0.8 durL=1.2 逐词随机序 stagger，行 stagger 0.05
 *   缓动 CustomEase "Out" = cubic-bezier(0.25,1,0.5,1)，以内置 power2.out 近似
 *
 * 标记约定（初始隐藏态由 CSS 类预设，避免 JS 就绪前闪现）：
 *   [data-sd-words]        逐词组，子词为 .sd-word（初始 opacity-0）
 *     data-sd-delay        组起播延迟（秒）
 *     data-sd-sync         同步组 id：同 id 的多份文本共享同一随机序（高亮条反白副本用）
 *   [data-sd-lines]        行组，行为 .sd-line（初始 opacity-0，外层需 overflow-hidden）
 *   [data-sd-bar]          高亮条色块，从左向右擦入（初始 scale-x-0 origin-left）
 *   [data-sd-media]        媒体遮罩容器（overflow-hidden），
 *     [data-sd-media-inner]  实际图层，上滑入场（初始 translate-y-[105%]）
 */

const DUR_M = 0.8;
const DUR_L = 1.2;
// 词的数量比字符少，间隔加大以保留可感知的错落节奏
const WORD_EACH = 0.05;
const LINE_EACH = 0.05;
const EASE = "power2.out";

const WORD_HIDDEN = { opacity: 0, yPercent: 75, scale: 0 };
const WORD_VISIBLE = { opacity: 1, yPercent: 0, scale: 1 };
const LINE_HIDDEN = { opacity: 0, yPercent: 250 };
const LINE_VISIBLE = { opacity: 1, yPercent: 0 };
// y: 0 显式清掉初始 CSS translate 类被 GSAP 折算出的像素基值，避免残留偏移
const MEDIA_HIDDEN = { yPercent: 105, y: 0 };
const MEDIA_VISIBLE = { yPercent: 0, y: 0 };
const BAR_HIDDEN = { scaleX: 0, transformOrigin: "left center" };
const BAR_VISIBLE = { scaleX: 1 };

function readDelay(el: HTMLElement): number {
  const value = parseFloat(el.dataset.sdDelay ?? "0");
  return Number.isFinite(value) ? value : 0;
}

type SondavenRevealOptions = {
  /** 跳过位于这些祖先容器内的节点 */
  exclude?: string;
  /** 返回 true 的图片不进开场时间轴，保持在下方，等进入视口再滑入 */
  deferMedia?: (el: HTMLElement) => boolean;
  /**
   * 传 false 时词仍是同一套缩放上浮，但不提升成独立合成层。
   * 旁边播透明视频时，每个词一层会把合成线程拖卡。
   */
  force3D?: boolean;
  /** 窄屏：含图片或视频的图层直接就位，不做裁切上滑 */
  snapMedia?: boolean;
  /** 窄屏：文字只做透明度和位移，不做 scale */
  plainText?: boolean;
};

function collectTargets(
  root: HTMLElement,
  selector: string,
  options?: SondavenRevealOptions,
): HTMLElement[] {
  return gsap.utils
    .toArray<HTMLElement>(selector, root)
    .filter((node) => !options?.exclude || !node.closest(options.exclude));
}

/** 播放整屏入场时间轴 */
export function playSondavenReveal(
  root: HTMLElement | null | undefined,
  options?: SondavenRevealOptions,
): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  if (!root) return tl;

  // 词组：同 data-sd-sync 的多份文本共享同一随机顺序，保证反白副本与原文同步
  const syncOrders = new Map<string, number[]>();
  for (const el of collectTargets(root, "[data-sd-words]", options)) {
    const words = Array.from(el.querySelectorAll<HTMLElement>(".sd-word"));
    if (words.length === 0) continue;
    const delay = readDelay(el);
    const syncId = el.dataset.sdSync;
    let order = syncId ? syncOrders.get(syncId) : undefined;
    if (!order) {
      order = gsap.utils.shuffle(words.map((_, i) => i));
      if (syncId) syncOrders.set(syncId, order);
    }
    const flat = options?.force3D === false ? { force3D: false as const } : {};
    const wordFrom = options?.plainText
      ? { opacity: 0, yPercent: 75, scale: 1 }
      : WORD_HIDDEN;
    const wordTo = options?.plainText
      ? { opacity: 1, yPercent: 0, scale: 1 }
      : WORD_VISIBLE;
    words.forEach((word, i) => {
      const offset = order[i] ?? i;
      tl.fromTo(
        word,
        { ...wordFrom, ...flat },
        { ...wordTo, ...flat, duration: DUR_M },
        delay + offset * WORD_EACH,
      );
    });
  }

  for (const el of collectTargets(root, "[data-sd-lines]", options)) {
    const lines = el.querySelectorAll<HTMLElement>(".sd-line");
    if (lines.length === 0) continue;
    tl.fromTo(
      lines,
      LINE_HIDDEN,
      { ...LINE_VISIBLE, duration: DUR_L, stagger: LINE_EACH },
      readDelay(el),
    );
  }

  for (const el of collectTargets(root, "[data-sd-bar]", options)) {
    tl.fromTo(
      el,
      BAR_HIDDEN,
      { ...BAR_VISIBLE, duration: DUR_L },
      readDelay(el),
    );
  }

  for (const el of collectTargets(root, "[data-sd-media]", options)) {
    if (options?.deferMedia?.(el)) continue;
    const inner = el.querySelector<HTMLElement>("[data-sd-media-inner]");
    if (!inner) continue;
    if (options?.snapMedia && el.querySelector("img, video")) {
      gsap.set(inner, MEDIA_VISIBLE);
      continue;
    }
    tl.fromTo(
      inner,
      MEDIA_HIDDEN,
      { ...MEDIA_VISIBLE, duration: DUR_L },
      readDelay(el),
    );
  }

  return tl;
}

function mediaInnerOffsetY(inner: HTMLElement) {
  const yPercent = gsap.getProperty(inner, "yPercent");
  if (typeof yPercent === "number" && yPercent > 1) return yPercent;
  const transform = getComputedStyle(inner).transform;
  const match = transform.match(/^matrix\(([^)]+)\)$/);
  if (!match) return 0;
  const offsetY = Number(match[1].split(",")[5]);
  return Number.isFinite(offsetY) ? offsetY : 0;
}

/**
 * 抽屉内容热更新后，新挂上的画面不在当初的入场名单里，会停在裁切区下方。
 * 没有正在进行的动画、且仍被裁在框外时，补一次上滑。
 */
export function revealParkedMediaInner(
  frame: HTMLElement | null,
  reducedMotion: boolean,
) {
  const inner = frame?.querySelector<HTMLElement>("[data-sd-media-inner]");
  if (!inner || gsap.isTweening(inner) || mediaInnerOffsetY(inner) <= 40) return;
  gsap.killTweensOf(inner);
  if (
    reducedMotion ||
    window.matchMedia("(max-width: 767px)").matches
  ) {
    gsap.set(inner, MEDIA_VISIBLE);
    return;
  }
  gsap.to(inner, {
    ...MEDIA_VISIBLE,
    duration: DUR_L,
    ease: EASE,
    overwrite: "auto",
  });
}

/** 单张图片从下往上滑入，时长与开场媒体一致 */
function slideMediaIn(inner: HTMLElement) {
  gsap.killTweensOf(inner);
  return gsap.fromTo(inner, MEDIA_HIDDEN, {
    ...MEDIA_VISIBLE,
    duration: DUR_L,
    ease: EASE,
  });
}

/**
 * 抽屉里视口以下的图片先停在裁切区下方，滚进滚动容器后再滑入。
 * 返回清理函数。
 */
export function observeDeferredDrawerMedia(
  frames: HTMLElement[],
  scroller: HTMLElement | null,
): () => void {
  const tweens: gsap.core.Tween[] = [];
  if (!scroller || frames.length === 0) return () => undefined;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const inner = entry.target.querySelector<HTMLElement>(
          "[data-sd-media-inner]",
        );
        if (!inner) continue;
        observer.unobserve(entry.target);
        if (window.matchMedia("(max-width: 767px)").matches) {
          gsap.set(inner, MEDIA_VISIBLE);
          continue;
        }
        tweens.push(slideMediaIn(inner));
      }
    },
    { root: scroller, rootMargin: "0px 0px 80px 0px", threshold: 0 },
  );
  for (const frame of frames) observer.observe(frame);
  return () => {
    observer.disconnect();
    for (const tween of tweens) tween.kill();
  };
}

/** 空列表跳过，避免 GSAP 对空 NodeList 抛 “target not found” 警告 */
function setIfPresent(
  root: HTMLElement,
  selector: string,
  vars: gsap.TweenVars,
  options?: SondavenRevealOptions,
) {
  const nodes = collectTargets(root, selector, options);
  if (nodes.length === 0) return;
  gsap.set(nodes, vars);
}

/** 复位到入场前的隐藏态（离屏时用） */
export function setSondavenHidden(
  root: HTMLElement | null | undefined,
  options?: SondavenRevealOptions,
) {
  if (!root) return;
  setIfPresent(
    root,
    ".sd-word",
    options?.force3D === false ? { ...WORD_HIDDEN, force3D: false } : WORD_HIDDEN,
    options,
  );
  setIfPresent(root, ".sd-line", LINE_HIDDEN, options);
  setIfPresent(root, "[data-sd-bar]", BAR_HIDDEN, options);
  setIfPresent(root, "[data-sd-media-inner]", MEDIA_HIDDEN, options);
}

/** 直接呈现最终态（减少动效场景用） */
export function setSondavenVisible(
  root: HTMLElement | null | undefined,
  options?: SondavenRevealOptions,
) {
  if (!root) return;
  setIfPresent(root, ".sd-word", WORD_VISIBLE, options);
  setIfPresent(root, ".sd-line", LINE_VISIBLE, options);
  setIfPresent(root, "[data-sd-bar]", BAR_VISIBLE, options);
  setIfPresent(root, "[data-sd-media-inner]", MEDIA_VISIBLE, options);
}
