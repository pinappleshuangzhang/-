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
/** 文案阶段：0–35% 申请 / 35–65% 连接 / 65–100% 已批准 */
export const LOADER_PHASE_REVIEW = 0.35;
export const LOADER_PHASE_APPROVED = 0.65;

export type LoaderProgressController = {
  /** 将显示值推进到目标百分比（0~100），同时驱动进度条与阶段文案 */
  update: (target: number) => void;
  /** 立即归零（序幕重播时使用） */
  reset: () => void;
  kill: () => void;
};

type LoaderProgressElements = {
  bar: HTMLElement;
  progressbar: HTMLElement;
  phaseTrack: HTMLElement;
  percent: HTMLElement;
  live: HTMLElement;
};

function phaseIndexFor(progress01: number): number {
  if (progress01 >= LOADER_PHASE_APPROVED) return 2;
  if (progress01 >= LOADER_PHASE_REVIEW) return 1;
  return 0;
}

/**
 * 加载进度写 DOM：进度条用 scaleX，阶段文案纵向丝滑切换。
 * 不用 React state，避免每帧重渲染。
 */
export function createLoaderProgress(
  elements: LoaderProgressElements,
): LoaderProgressController {
  const { bar, progressbar, phaseTrack, percent, live } = elements;
  const proxy = { value: 0 };
  let tween: gsap.core.Tween | null = null;
  let phaseTween: gsap.core.Tween | null = null;
  let stage = 0;

  const lineHeight = () =>
    phaseTrack.firstElementChild?.getBoundingClientRect().height || 20;

  const phaseLabel = () => {
    const child = phaseTrack.children[stage];
    return child?.textContent?.trim() ?? "";
  };

  const render = () => {
    const progress01 = Math.min(Math.max(proxy.value / 100, 0), 1);
    gsap.set(bar, { scaleX: progress01 });

    const pct = `${Math.round(proxy.value)}%`;
    if (percent.textContent !== pct) percent.textContent = pct;
    progressbar.setAttribute("aria-valuenow", String(Math.round(proxy.value)));

    const nextStage = phaseIndexFor(progress01);
    if (nextStage !== stage) {
      stage = nextStage;
      phaseTween?.kill();
      phaseTween = gsap.to(phaseTrack, {
        y: -lineHeight() * stage,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    const announcement = `${live.dataset.role ?? ""}${live.dataset.id ?? ""} ${phaseLabel()} ${pct}`;
    if (live.textContent !== announcement) live.textContent = announcement;
  };
  gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
  gsap.set(phaseTrack, { y: 0 });
  render();

  return {
    update(target) {
      tween?.kill();
      tween = gsap.to(proxy, {
        value: target,
        duration: 0.2,
        ease: "power1.out",
        onUpdate: render,
      });
    },
    reset() {
      tween?.kill();
      phaseTween?.kill();
      proxy.value = 0;
      stage = 0;
      gsap.set(phaseTrack, { y: 0 });
      render();
    },
    kill() {
      tween?.kill();
      phaseTween?.kill();
    },
  };
}

export type LoaderMaterialCycle = {
  reset: () => void;
  kill: () => void;
};

/**
 * 居中材质图自下而上蒙层循环替换（clip-path，不驱动布局）。
 */
export function createLoaderMaterialCycle(
  root: HTMLElement,
): LoaderMaterialCycle {
  const layers = Array.from(
    root.querySelectorAll<HTMLElement>("[data-loader-mat]"),
  );
  let index = 0;
  let tween: gsap.core.Tween | null = null;
  let hold: gsap.core.Tween | null = null;
  let stopped = false;

  const showBase = () => {
    layers.forEach((layer, layerIndex) => {
      gsap.set(layer, {
        zIndex: layerIndex === 0 ? 1 : 0,
        clipPath: layerIndex === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
      });
    });
    index = 0;
  };

  const cycle = () => {
    if (stopped || layers.length < 2) return;
    const current = layers[index];
    const next = layers[(index + 1) % layers.length];
    if (!current || !next) return;

    gsap.set(next, { zIndex: 2, clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(current, { zIndex: 1 });
    tween = gsap.to(next, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.85,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(current, {
          zIndex: 0,
          clipPath: "inset(100% 0% 0% 0%)",
        });
        gsap.set(next, { zIndex: 1 });
        index = (index + 1) % layers.length;
        hold = gsap.delayedCall(0.15, cycle);
      },
    });
  };

  showBase();
  hold = gsap.delayedCall(0.2, cycle);

  return {
    reset() {
      tween?.kill();
      hold?.kill();
      stopped = false;
      showBase();
      hold = gsap.delayedCall(0.35, cycle);
    },
    kill() {
      stopped = true;
      tween?.kill();
      hold?.kill();
    },
  };
}

/**
 * 加载层淡出，停在 01首屏-1 档案盒页；标题与尾帧先藏住。
 */
export function revealArchiveHold({
  loader,
  firstFrame,
  lastFrame,
  root,
}: {
  loader: HTMLElement;
  firstFrame: HTMLElement | null;
  lastFrame: HTMLElement | null;
  root: HTMLElement;
}): gsap.core.Timeline {
  setSondavenHidden(root);
  const titles = root.querySelector<HTMLElement>("[data-hero-titles]");
  if (titles) gsap.set(titles, { autoAlpha: 0 });
  if (lastFrame) gsap.set(lastFrame, { autoAlpha: 0 });
  if (firstFrame) gsap.set(firstFrame, { autoAlpha: 1 });

  return gsap.timeline().to(loader, {
    autoAlpha: 0,
    duration: 0.8,
    ease: "power2.inOut",
  });
}

/**
 * 档案盒页继续向下：首帧渐隐，尾帧与标题入场。
 */
export function revealHeroFinale({
  firstFrame,
  lastFrame,
  root,
  onRevealStart,
}: {
  firstFrame: HTMLElement | null;
  lastFrame: HTMLElement | null;
  root: HTMLElement;
  onRevealStart?: () => void;
}): gsap.core.Timeline {
  setSondavenHidden(root);
  const titles = root.querySelector<HTMLElement>("[data-hero-titles]");
  const reveal = playSondavenReveal(root);

  const timeline = gsap.timeline();
  if (firstFrame) {
    timeline.to(firstFrame, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" }, 0);
  }
  if (lastFrame) {
    timeline.set(lastFrame, { autoAlpha: 1 }, 0);
  }
  timeline.call(() => {
    if (titles) gsap.set(titles, { autoAlpha: 1 });
    onRevealStart?.();
  }, undefined, 0.4);
  return timeline.add(reveal, 0.4);
}

type HeroVideoSequenceOptions = {
  video: HTMLVideoElement;
  videoLayer: HTMLElement;
  firstFrame: HTMLElement | null;
  root: HTMLElement;
  objectUrl: string;
  onPlaying?: () => void;
  onRevealStart?: () => void;
  onComplete: () => void;
  onFallback: () => void;
};

/**
 * 从档案盒页起播开场视频；播完或跳过后切到尾帧并让标题入场。
 */
export function createHeroVideoSequence({
  video,
  videoLayer,
  firstFrame,
  root,
  objectUrl,
  onPlaying,
  onRevealStart,
  onComplete,
  onFallback,
}: HeroVideoSequenceOptions): {
  prepare: () => void;
  start: () => void;
  skip: () => void;
  kill: () => void;
} {
  let killed = false;
  let phase: "pre" | "playing" | "done" = "pre";
  const lastFrame = document.querySelector<HTMLElement>(
    '[data-shared-bg="studio"]',
  );
  const titles = root.querySelector<HTMLElement>("[data-hero-titles]");

  const hideTitles = () => {
    setSondavenHidden(root);
    if (titles) gsap.set(titles, { autoAlpha: 0 });
  };

  const finishToTitles = () => {
    if (phase === "done") return;
    phase = "done";
    video.pause();
    if (firstFrame) gsap.set(firstFrame, { autoAlpha: 0 });
    if (lastFrame) gsap.set(lastFrame, { autoAlpha: 1 });
    gsap.to(videoLayer, { autoAlpha: 0, duration: 0.45, ease: "power2.out" });
    hideTitles();
    if (titles) gsap.set(titles, { autoAlpha: 1 });
    onRevealStart?.();
    playSondavenReveal(root).eventCallback("onComplete", () => {
      if (!killed) onComplete();
    });
  };

  const onEnded = () => {
    if (killed || phase !== "playing") return;
    finishToTitles();
  };

  const onError = () => {
    if (killed || phase === "done") return;
    if (lastFrame) gsap.set(lastFrame, { autoAlpha: 1 });
    onFallback();
  };

  const playNow = () => {
    if (killed || phase !== "pre") return;
    phase = "playing";
    hideTitles();
    // 静帧与视频首帧已像素级对齐：等浏览器真正呈现出视频第一帧后瞬间切层。
    // 若用交叉渐隐，视频在淡出期间已开始运动，会与静帧叠出重影闪烁；
    // 若在绘制首帧前就显示视频层，seek 空档会露出白底闪一下。
    const swapToVideo = () => {
      if (killed || phase !== "playing") return;
      gsap.set(videoLayer, { autoAlpha: 1 });
      if (firstFrame) gsap.set(firstFrame, { autoAlpha: 0 });
      onPlaying?.();
    };
    if (video.currentTime > 0.001) video.currentTime = 0;
    video
      .play()
      .then(() => {
        const withFrameCallback = video as HTMLVideoElement & {
          requestVideoFrameCallback?: (callback: () => void) => number;
        };
        if (withFrameCallback.requestVideoFrameCallback) {
          withFrameCallback.requestVideoFrameCallback(swapToVideo);
        } else {
          swapToVideo();
        }
      })
      .catch(() => {
        if (lastFrame) gsap.set(lastFrame, { autoAlpha: 1 });
        onFallback();
      });
  };

  return {
    prepare() {
      if (video.src !== objectUrl) {
        video.src = objectUrl;
        video.load();
      }
    },
    start() {
      if (killed || phase !== "pre") return;
      hideTitles();
      video.addEventListener("error", onError, { once: true });
      video.addEventListener("ended", onEnded);
      if (video.readyState >= 2 && video.src) {
        playNow();
        return;
      }
      video.addEventListener("loadeddata", playNow, { once: true });
      if (video.src !== objectUrl) {
        video.src = objectUrl;
        video.load();
      }
    },
    skip() {
      if (killed || phase !== "playing") return;
      finishToTitles();
    },
    kill() {
      killed = true;
      video.removeEventListener("loadeddata", playNow);
      video.removeEventListener("error", onError);
      video.removeEventListener("ended", onEnded);
      video.pause();
    },
  };
}
