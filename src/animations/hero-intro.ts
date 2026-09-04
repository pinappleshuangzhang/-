import gsap from "gsap";
import {
  playSondavenReveal,
  setSondavenHidden,
} from "@/animations/sondaven-reveal";

/** 加载屏最短时长：资源更快也要铺满 2s */
export const LOADER_MIN_DURATION_MS = 2000;
/** 到 100% 后短停再退场 */
export const LOADER_HOLD_MS = 700;
/** Safari matchMedia 未触发时的加载层保险上限 */
export const LOADER_FAILSAFE_MS = 20000;
/** 稿面证件顶边：252 / 800 */
export const LOADER_CARD_REVEAL = 252 / 800;

export type LoaderProgressController = {
  /** 将显示值推进到目标百分比（0~100），同时驱动浅色裁切与状态文案 */
  update: (target: number) => void;
  /** 立即归零（序幕重播时使用） */
  reset: () => void;
  kill: () => void;
};

type LoaderProgressElements = {
  wipe: HTMLElement;
  status: HTMLElement;
  phase: HTMLElement;
  percent: HTMLElement;
};

function phaseCopyFor(progress01: number, status: HTMLElement): string {
  const approved = status.dataset.copyApproved ?? "";
  const review = status.dataset.copyReview ?? "";
  const apply = status.dataset.copyApply ?? "";
  if (progress01 >= 1) return approved;
  if (progress01 >= LOADER_CARD_REVEAL) return review;
  return apply;
}

/**
 * 加载进度写 DOM：clip-path 高度 = 百分比，状态字跟在浅色下沿。
 * 不用 React state，避免每帧重渲染。
 */
export function createLoaderProgress(
  elements: LoaderProgressElements,
): LoaderProgressController {
  const { wipe, status, phase, percent } = elements;
  const proxy = { value: 0 };
  let tween: gsap.core.Tween | null = null;

  const render = () => {
    const progress01 = Math.min(Math.max(proxy.value / 100, 0), 1);
    const hidden = (1 - progress01) * 100;
    wipe.style.clipPath =
      hidden < 0.05 ? "none" : `inset(0% 0% ${hidden}% 0%)`;

    const viewportHeight = wipe.clientHeight || window.innerHeight;
    const statusHeight = status.offsetHeight || 26;
    const wipeBottom = progress01 * viewportHeight;
    const maxShift = Math.max(0, viewportHeight - 40 - statusHeight);
    const shift = Math.min(wipeBottom, maxShift);
    status.style.transform = `translateY(${shift}px)`;

    const covered = wipeBottom > 20 + shift + 2;
    status.classList.toggle("text-grey-400", covered);
    status.classList.toggle("text-white", !covered);

    const pct = `${Math.round(proxy.value)}%`;
    if (percent.textContent !== pct) percent.textContent = pct;
    const nextPhase = phaseCopyFor(progress01, status);
    if (phase.textContent !== nextPhase) phase.textContent = nextPhase;
  };
  render();

  return {
    update(target) {
      tween?.kill();
      tween = gsap.to(proxy, {
        value: target,
        duration: 0.12,
        ease: "none",
        onUpdate: render,
      });
    },
    reset() {
      tween?.kill();
      proxy.value = 0;
      render();
    },
    kill() {
      tween?.kill();
    },
  };
}

/**
 * 阶段一 → 阶段二：加载层快速淡出，交出视频画面。
 * 底层视频此时定格在与加载层底图相同的首帧上，淡出期间画面静止、无重影。
 */
export function buildLoaderExit(loader: HTMLElement): gsap.core.Timeline {
  return gsap.timeline().to(loader, {
    autoAlpha: 0,
    duration: 0.35,
    ease: "power2.out",
  });
}

/**
 * 阶段三：首屏文字复用第三屏的 Son Daven 随机逐词入场。
 */
export function buildHeroReveal(root: HTMLElement): gsap.core.Timeline {
  setSondavenHidden(root);
  return playSondavenReveal(root);
}

/** 首帧露出后停留多久再渐入尾帧 */
export const FIRST_FRAME_HOLD_S = 1.2;

/**
 * 无视频路径：加载层淡出露出首帧（01首屏-1 静帧）→ 停留 →
 * 首帧渐隐露出尾帧底图（01首屏-2），标题同时逐词入场。
 */
export function buildFallbackReveal({
  loader,
  firstFrame,
  root,
}: {
  loader: HTMLElement;
  firstFrame: HTMLElement | null;
  root: HTMLElement;
}): gsap.core.Timeline {
  setSondavenHidden(root);
  const reveal = playSondavenReveal(root);
  const revealAt = 0.8 + FIRST_FRAME_HOLD_S;

  const timeline = gsap
    .timeline()
    .to(loader, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" }, 0);

  if (firstFrame) {
    timeline.to(
      firstFrame,
      { autoAlpha: 0, duration: 1, ease: "power2.inOut" },
      revealAt,
    );
  }

  return timeline.add(reveal, revealAt + 0.2);
}
