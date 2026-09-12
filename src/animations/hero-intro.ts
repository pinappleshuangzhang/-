import gsap from "gsap";
import {
  playSondavenReveal,
  setSondavenHidden,
} from "@/animations/sondaven-reveal";

/** 加载屏最短时长：资源更快也要铺满 2s，资源较慢则等待实际加载完成 */
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
  /** 停止后续循环，等待当前渐变自然完成 */
  complete: (onComplete?: () => void) => void;
  kill: () => void;
};

/**
 * 居中材质图使用透明度交叉渐隐渐现，不驱动布局。
 */
export function createLoaderMaterialCycle(
  root: HTMLElement,
): LoaderMaterialCycle {
  const layers = Array.from(
    root.querySelectorAll<HTMLElement>("[data-loader-mat]"),
  );
  let index = 0;
  let tween: gsap.core.Timeline | null = null;
  let hold: gsap.core.Tween | null = null;
  let activeTargetIndex: number | null = null;
  let pendingComplete: (() => void) | null = null;
  let stopped = false;

  const showBase = () => {
    layers.forEach((layer, layerIndex) => {
      gsap.set(layer, {
        zIndex: layerIndex === 0 ? 1 : 0,
        autoAlpha: layerIndex === 0 ? 1 : 0,
      });
    });
    index = 0;
    activeTargetIndex = null;
  };

  const cycle = () => {
    if (stopped || layers.length < 2) return;
    const nextIndex = (index + 1) % layers.length;
    const current = layers[index];
    const next = layers[nextIndex];
    if (!current || !next) return;

    activeTargetIndex = nextIndex;
    gsap.set(next, { zIndex: 2, autoAlpha: 0 });
    gsap.set(current, { zIndex: 1 });
    tween = gsap
      .timeline({
        onComplete: () => {
          gsap.set(current, {
            zIndex: 0,
            autoAlpha: 0,
          });
          gsap.set(next, { zIndex: 1, autoAlpha: 1 });
          index = nextIndex;
          activeTargetIndex = null;
          if (stopped) {
            tween = null;
            pendingComplete?.();
            pendingComplete = null;
            return;
          }
          hold = gsap.delayedCall(0.15, cycle);
        },
      })
      .to(current, { autoAlpha: 0, duration: 0.65, ease: "power2.inOut" }, 0)
      .to(next, { autoAlpha: 1, duration: 0.65, ease: "power2.inOut" }, 0);
  };

  showBase();
  hold = gsap.delayedCall(0.2, cycle);

  return {
    reset() {
      tween?.kill();
      hold?.kill();
      pendingComplete = null;
      stopped = false;
      showBase();
      hold = gsap.delayedCall(0.35, cycle);
    },
    complete(onComplete) {
      stopped = true;
      hold?.kill();
      hold = null;
      if (activeTargetIndex !== null && tween?.isActive()) {
        pendingComplete = onComplete ?? null;
        return;
      }
      onComplete?.();
    },
    kill() {
      stopped = true;
      tween?.kill();
      hold?.kill();
      pendingComplete = null;
    },
  };
}

/**
 * 加载到 100% 后做双层错位上裁：
 * 加载层先向上揭开 grey-400，深灰层稍后跟随向上揭开首屏静帧。
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
  const curtain = root.querySelector<HTMLElement>("[data-loader-curtain]");
  if (firstFrame) {
    gsap.set(firstFrame, { autoAlpha: 0, scale: 1 });
  }
  if (curtain) {
    gsap.set(curtain, {
      autoAlpha: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      willChange: "clip-path",
    });
  }
  gsap.set(loader, {
    autoAlpha: 1,
    clipPath: "inset(0% 0% 0% 0%)",
    willChange: "clip-path",
  });

  const timeline = gsap.timeline();
  if (firstFrame) {
    timeline.to(
      firstFrame,
      {
        autoAlpha: 1,
        duration: 0.7,
        ease: "power2.out",
      },
      0.1,
    );
  }
  timeline.to(
    loader,
    {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.85,
      ease: "power2.inOut",
    },
    0,
  );
  if (curtain) {
    timeline.to(
      curtain,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.85,
        ease: "power2.inOut",
      },
      0.14,
    );
  }
  timeline.set(loader, { autoAlpha: 0, clearProps: "willChange" }, 0.85);
  if (curtain) {
    timeline.set(
      curtain,
      { autoAlpha: 0, clearProps: "willChange" },
      0.99,
    );
  }
  return timeline;
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
    timeline.fromTo(
      lastFrame,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 2.3, ease: "power2.inOut" },
      0,
    );
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
  showFirstFrame: (onReady: () => void) => void;
  start: () => void;
  skip: () => void;
  kill: () => void;
} {
  let killed = false;
  let phase: "pre" | "playing" | "done" = "pre";
  let startFrame = 0;
  let firstFrameFade: gsap.core.Tween | null = null;
  const lastFrame = document.querySelector<HTMLElement>(
    '[data-shared-bg="studio"]',
  );
  const titles = root.querySelector<HTMLElement>("[data-hero-titles]");

  const hideTitles = () => {
    setSondavenHidden(root);
    if (titles) gsap.set(titles, { autoAlpha: 0 });
  };

  const finishToTitles = (seekToEnd = false) => {
    if (phase === "done") return;
    phase = "done";
    video.pause();
    if (firstFrame) gsap.set(firstFrame, { autoAlpha: 0 });
    const revealTitles = () => {
      if (killed) return;
      const useStaticLastFrame =
        Boolean(lastFrame) &&
        window.matchMedia("(min-width: 768px)").matches;
      // 桌面：定格视频尾帧后，静态尾帧 0→1 渐入，视频层同步淡出。
      // 手机：无桌面静帧底图，继续定格在视频尾帧。
      gsap.set(videoLayer, { autoAlpha: 1 });
      if (useStaticLastFrame && lastFrame) {
        gsap.fromTo(
          lastFrame,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 2.3, ease: "power2.inOut" },
        );
        gsap.to(videoLayer, {
          autoAlpha: 0,
          duration: 2.3,
          ease: "power2.inOut",
        });
      }
      hideTitles();
      if (titles) gsap.set(titles, { autoAlpha: 1 });
      onRevealStart?.();
      playSondavenReveal(root).eventCallback("onComplete", () => {
        if (!killed) onComplete();
      });
    };
    if (seekToEnd && Number.isFinite(video.duration)) {
      video.addEventListener("seeked", revealTitles, { once: true });
      video.currentTime = Math.max(0, video.duration - 1 / 30);
      return;
    }
    revealTitles();
  };

  const onEnded = () => {
    if (killed || phase !== "playing") return;
    // 部分移动端 ended 时会清空画面，强制停在最后一帧再进入收尾。
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = Math.max(0, video.duration - 1 / 30);
    }
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
    // 先让暂停的视频首帧在静帧下方完成合成；静帧完全渐隐后才正式播放。
    video.pause();
    if (video.currentTime > 0.001) video.currentTime = 0;
    gsap.set(videoLayer, { autoAlpha: 1 });
    startFrame = window.requestAnimationFrame(() => {
      startFrame = window.requestAnimationFrame(() => {
        startFrame = 0;
        if (killed || phase !== "playing") return;
        const startPlayback = () => {
          if (killed || phase !== "playing") return;
          video
            .play()
            .then(() => {
              if (!killed) onPlaying?.();
            })
            .catch(() => {
              if (killed) return;
              gsap.set(videoLayer, { autoAlpha: 0 });
              if (firstFrame) gsap.set(firstFrame, { autoAlpha: 1 });
              if (lastFrame) gsap.set(lastFrame, { autoAlpha: 1 });
              onFallback();
            });
        };
        if (firstFrame) {
          firstFrameFade = gsap.to(firstFrame, {
            autoAlpha: 0,
            duration: 0.65,
            ease: "power2.inOut",
            onComplete: startPlayback,
          });
        } else {
          startPlayback();
        }
      });
    });
  };

  return {
    prepare() {
      if (video.src !== objectUrl) {
        video.src = objectUrl;
        video.load();
      }
    },
    showFirstFrame(onReady) {
      const revealFrame = () => {
        if (killed || phase !== "pre") return;
        video.pause();
        if (video.currentTime > 0.001) video.currentTime = 0;
        gsap.set(videoLayer, { autoAlpha: 1 });
        if (firstFrame) gsap.set(firstFrame, { autoAlpha: 0 });
        window.requestAnimationFrame(onReady);
      };
      if (video.readyState >= 2 && video.src) {
        revealFrame();
        return;
      }
      video.addEventListener("loadeddata", revealFrame, { once: true });
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
      finishToTitles(true);
    },
    kill() {
      killed = true;
      if (startFrame) window.cancelAnimationFrame(startFrame);
      firstFrameFade?.kill();
      video.removeEventListener("loadeddata", playNow);
      video.removeEventListener("error", onError);
      video.removeEventListener("ended", onEnded);
      video.pause();
    },
  };
}
