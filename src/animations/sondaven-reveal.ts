import gsap from "gsap";

/**
 * Son Daven（sondaven.com）式入场：参数取自其源码
 *   durM=0.8 durL=1.2 字符 stagger 0.025 随机序，行 stagger 0.05
 *   缓动 CustomEase "Out" = cubic-bezier(0.25,1,0.5,1)，以内置 power2.out 近似
 *
 * 标记约定（初始隐藏态由 CSS 类预设，避免 JS 就绪前闪现）：
 *   [data-sd-chars]        逐字符组，子字符为 .sd-char（初始 opacity-0）
 *     data-sd-delay        组起播延迟（秒）
 *     data-sd-sync         同步组 id：同 id 的多份文本共享同一随机序（高亮条反白副本用）
 *   [data-sd-lines]        行组，行为 .sd-line（初始 opacity-0，外层需 overflow-hidden）
 *   [data-sd-bar]          高亮条色块，从左向右擦入（初始 scale-x-0 origin-left）
 *   [data-sd-media]        媒体遮罩容器（overflow-hidden），
 *     [data-sd-media-inner]  实际图层，上滑入场（初始 translate-y-[105%]）
 */

const DUR_M = 0.8;
const DUR_L = 1.2;
const CHAR_EACH = 0.025;
const LINE_EACH = 0.05;
const EASE = "power2.out";

const CHAR_HIDDEN = { opacity: 0, yPercent: 75, scale: 0 };
const CHAR_VISIBLE = { opacity: 1, yPercent: 0, scale: 1 };
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

/** 播放整屏入场时间轴 */
export function playSondavenReveal(root: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: EASE } });

  // 字符组：同 data-sd-sync 的多份文本共享同一随机顺序，保证反白副本与原文同步
  const syncOrders = new Map<string, number[]>();
  for (const el of gsap.utils.toArray<HTMLElement>("[data-sd-chars]", root)) {
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".sd-char"));
    if (chars.length === 0) continue;
    const delay = readDelay(el);
    const syncId = el.dataset.sdSync;
    let order = syncId ? syncOrders.get(syncId) : undefined;
    if (!order) {
      order = gsap.utils.shuffle(chars.map((_, i) => i));
      if (syncId) syncOrders.set(syncId, order);
    }
    chars.forEach((char, i) => {
      const offset = order[i] ?? i;
      tl.fromTo(
        char,
        CHAR_HIDDEN,
        { ...CHAR_VISIBLE, duration: DUR_M },
        delay + offset * CHAR_EACH,
      );
    });
  }

  for (const el of gsap.utils.toArray<HTMLElement>("[data-sd-lines]", root)) {
    const lines = el.querySelectorAll<HTMLElement>(".sd-line");
    if (lines.length === 0) continue;
    tl.fromTo(
      lines,
      LINE_HIDDEN,
      { ...LINE_VISIBLE, duration: DUR_L, stagger: LINE_EACH },
      readDelay(el),
    );
  }

  for (const el of gsap.utils.toArray<HTMLElement>("[data-sd-bar]", root)) {
    tl.fromTo(
      el,
      BAR_HIDDEN,
      { ...BAR_VISIBLE, duration: DUR_L },
      readDelay(el),
    );
  }

  for (const el of gsap.utils.toArray<HTMLElement>("[data-sd-media]", root)) {
    const inner = el.querySelector<HTMLElement>("[data-sd-media-inner]");
    if (!inner) continue;
    tl.fromTo(
      inner,
      MEDIA_HIDDEN,
      { ...MEDIA_VISIBLE, duration: DUR_L },
      readDelay(el),
    );
  }

  return tl;
}

/** 复位到入场前的隐藏态（离屏时用） */
export function setSondavenHidden(root: HTMLElement) {
  gsap.set(root.querySelectorAll(".sd-char"), CHAR_HIDDEN);
  gsap.set(root.querySelectorAll(".sd-line"), LINE_HIDDEN);
  gsap.set(root.querySelectorAll("[data-sd-bar]"), BAR_HIDDEN);
  gsap.set(root.querySelectorAll("[data-sd-media-inner]"), MEDIA_HIDDEN);
}

/** 直接呈现最终态（减少动效场景用） */
export function setSondavenVisible(root: HTMLElement) {
  gsap.set(root.querySelectorAll(".sd-char"), CHAR_VISIBLE);
  gsap.set(root.querySelectorAll(".sd-line"), LINE_VISIBLE);
  gsap.set(root.querySelectorAll("[data-sd-bar]"), BAR_VISIBLE);
  gsap.set(root.querySelectorAll("[data-sd-media-inner]"), MEDIA_VISIBLE);
}
