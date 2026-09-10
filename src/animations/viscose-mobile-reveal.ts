import gsap from "gsap";

/**
 * 第五屏移动端入场，节奏对齐第三屏 sondaven-reveal：
 * 词 0.8s、行/条/图 1.2s，power2.out。
 *
 * 标记约定（初始隐藏态由 CSS 类预设）：
 *   [data-mobile-word]   逐词（opacity-0），[data-mobile-swap] 为切换分类时重播的词
 *   [data-mobile-line]   分隔线，左→右擦入（scale-x-0 origin-left）
 *   [data-mobile-bar]    chip 底色，左→右擦入
 *   [data-mobile-copy]   标题/详情整段，从裁切容器下方上浮
 *   [data-mobile-block]  整块淡入（投影、按钮）
 *   media                大图内层，外层 overflow-hidden，自下方滑入
 */

const DUR_M = 0.8;
const DUR_L = 1.2;
const EASE = "power2.out";

const WORD_HIDDEN = { opacity: 0, yPercent: 75, scale: 0 };
const WORD_SHOWN = { opacity: 1, yPercent: 0, scale: 1 };
const BLOCK_HIDDEN = { opacity: 0, yPercent: 100 };
const BLOCK_SHOWN = { opacity: 1, yPercent: 0 };
const BAR_HIDDEN = { scaleX: 0, transformOrigin: "left center" };
const MEDIA_HIDDEN = { yPercent: 105, y: 0 };
const MEDIA_SHOWN = { yPercent: 0, y: 0 };

type RevealTrack = {
  targets: HTMLElement[];
  hidden: gsap.TweenVars;
  shown: gsap.TweenVars;
  duration: number;
  /** 在入场时间轴上的起播时刻（秒） */
  at: number;
  stagger?: gsap.TweenVars["stagger"];
};

function collect(root: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function collectTracks(
  root: HTMLElement,
  media: HTMLElement | null | undefined,
): RevealTrack[] {
  return [
    {
      targets: media ? [media] : [],
      hidden: MEDIA_HIDDEN,
      shown: MEDIA_SHOWN,
      duration: DUR_L,
      at: 0,
    },
    {
      targets: collect(root, "[data-mobile-word]"),
      hidden: WORD_HIDDEN,
      shown: WORD_SHOWN,
      duration: DUR_M,
      at: 0.2,
      stagger: { amount: 1.2, from: "random" as const },
    },
    {
      targets: collect(root, "[data-mobile-line]"),
      hidden: { scaleX: 0 },
      shown: { scaleX: 1 },
      duration: DUR_L,
      at: 0.35,
    },
    {
      targets: collect(root, "[data-mobile-bar]"),
      hidden: BAR_HIDDEN,
      shown: { scaleX: 1 },
      duration: DUR_L,
      at: 0.45,
      stagger: 0.05,
    },
    {
      targets: collect(root, "[data-mobile-copy]"),
      hidden: BLOCK_HIDDEN,
      shown: BLOCK_SHOWN,
      duration: DUR_L,
      at: 0.55,
      stagger: 0.05,
    },
    {
      targets: collect(root, "[data-mobile-block]"),
      hidden: { opacity: 0 },
      shown: { opacity: 1 },
      duration: DUR_M,
      at: 0.6,
      stagger: 0.06,
    },
  ].filter((track) => track.targets.length > 0);
}

/** 播放整屏入场；减少动效时直接落到终态并返回 null */
export function playViscoseMobileReveal(
  root: HTMLElement,
  media: HTMLElement | null | undefined,
): gsap.core.Timeline | null {
  const tracks = collectTracks(root, media);
  for (const track of tracks) gsap.killTweensOf(track.targets);
  if (reducedMotion()) {
    for (const track of tracks) gsap.set(track.targets, track.shown);
    return null;
  }
  const tl = gsap.timeline({ defaults: { ease: EASE } });
  for (const track of tracks) {
    tl.fromTo(
      track.targets,
      track.hidden,
      { ...track.shown, duration: track.duration, stagger: track.stagger },
      track.at,
    );
  }
  return tl;
}

/** 复位到入场前的隐藏态 */
export function setViscoseMobileHidden(
  root: HTMLElement,
  media: HTMLElement | null | undefined,
) {
  for (const track of collectTracks(root, media)) {
    gsap.killTweensOf(track.targets);
    gsap.set(track.targets, track.hidden);
  }
}

/** 切换分类：编号等 swap 词逐词重播，标题/详情整段重新上浮；返回清理函数 */
export function playViscoseMobileSwap(root: HTMLElement): () => void {
  const words = collect(root, "[data-mobile-swap]");
  const copy = collect(root, "[data-mobile-copy]");
  const all = [...words, ...copy];
  gsap.killTweensOf(all);
  if (reducedMotion()) {
    if (words.length) gsap.set(words, WORD_SHOWN);
    if (copy.length) gsap.set(copy, BLOCK_SHOWN);
  } else {
    if (words.length) {
      gsap.fromTo(words, WORD_HIDDEN, {
        ...WORD_SHOWN,
        duration: 0.6,
        ease: EASE,
        stagger: { amount: 0.4, from: "random" },
      });
    }
    if (copy.length) {
      gsap.fromTo(copy, BLOCK_HIDDEN, {
        ...BLOCK_SHOWN,
        duration: DUR_M,
        ease: EASE,
        stagger: 0.05,
      });
    }
  }
  return () => gsap.killTweensOf(all);
}
