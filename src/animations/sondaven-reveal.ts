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

/** 播放整屏入场时间轴 */
export function playSondavenReveal(
  root: HTMLElement | null | undefined,
): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  if (!root) return tl;

  // 词组：同 data-sd-sync 的多份文本共享同一随机顺序，保证反白副本与原文同步
  const syncOrders = new Map<string, number[]>();
  for (const el of gsap.utils.toArray<HTMLElement>("[data-sd-words]", root)) {
    const words = Array.from(el.querySelectorAll<HTMLElement>(".sd-word"));
    if (words.length === 0) continue;
    const delay = readDelay(el);
    const syncId = el.dataset.sdSync;
    let order = syncId ? syncOrders.get(syncId) : undefined;
    if (!order) {
      order = gsap.utils.shuffle(words.map((_, i) => i));
      if (syncId) syncOrders.set(syncId, order);
    }
    words.forEach((word, i) => {
      const offset = order[i] ?? i;
      tl.fromTo(
        word,
        WORD_HIDDEN,
        { ...WORD_VISIBLE, duration: DUR_M },
        delay + offset * WORD_EACH,
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

/** 空列表跳过，避免 GSAP 对空 NodeList 抛 “target not found” 警告 */
function setIfPresent(
  root: HTMLElement,
  selector: string,
  vars: gsap.TweenVars,
) {
  const nodes = root.querySelectorAll(selector);
  if (nodes.length === 0) return;
  gsap.set(nodes, vars);
}

/** 复位到入场前的隐藏态（离屏时用） */
export function setSondavenHidden(root: HTMLElement | null | undefined) {
  if (!root) return;
  setIfPresent(root, ".sd-word", WORD_HIDDEN);
  setIfPresent(root, ".sd-line", LINE_HIDDEN);
  setIfPresent(root, "[data-sd-bar]", BAR_HIDDEN);
  setIfPresent(root, "[data-sd-media-inner]", MEDIA_HIDDEN);
}

/** 直接呈现最终态（减少动效场景用） */
export function setSondavenVisible(root: HTMLElement | null | undefined) {
  if (!root) return;
  setIfPresent(root, ".sd-word", WORD_VISIBLE);
  setIfPresent(root, ".sd-line", LINE_VISIBLE);
  setIfPresent(root, "[data-sd-bar]", BAR_VISIBLE);
  setIfPresent(root, "[data-sd-media-inner]", MEDIA_VISIBLE);
}
