import gsap from "gsap";

export type CounterController = {
  /** 将显示值平滑推进到目标百分比（0~100） */
  update: (target: number) => void;
  /** 立即归零（序幕重播时使用） */
  reset: () => void;
  kill: () => void;
};

/**
 * 平滑计数器：直接写 DOM 文本，不经过 React state。
 * 每次真实进度更新时调用 update，显示值以缓动追上目标。
 */
export function createCounter(el: HTMLElement): CounterController {
  const proxy = { value: 0 };
  let tween: gsap.core.Tween | null = null;

  const render = () => {
    el.textContent = `${Math.round(proxy.value)}%`;
  };
  render();

  return {
    update(target) {
      tween?.kill();
      tween = gsap.to(proxy, {
        value: target,
        duration: 0.6,
        ease: "power2.out",
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
 * 阶段一 → 阶段二：加载层淡出，交出视频画面。
 */
export function buildLoaderExit(loader: HTMLElement): gsap.core.Timeline {
  return gsap.timeline().to(loader, {
    autoAlpha: 0,
    duration: 0.7,
    ease: "power2.inOut",
  });
}

/**
 * 阶段三：视频最后一帧定格时，大小标题与视频淡出同步进行。
 * 标题层位于视频之上，视频下方是与最后一帧一致的静态背景，
 * 因此视频淡出在视觉上是无缝的。
 */
export function buildHeroReveal({
  video,
  titleLines,
  ornaments,
}: {
  video: HTMLElement;
  titleLines: HTMLElement[];
  ornaments: HTMLElement[];
}): gsap.core.Timeline {
  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
  });

  timeline
    .to(
      titleLines,
      {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.14,
      },
      0,
    )
    .to(
      video,
      {
        autoAlpha: 0,
        duration: 1.1,
        ease: "power2.inOut",
      },
      0.15,
    )
    .to(
      ornaments,
      {
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
      },
      0.6,
    );

  return timeline;
}

/**
 * 降级路径：跳过视频，加载层直接交叉淡化到静态首屏。
 */
export function buildFallbackReveal({
  loader,
  titleLines,
  ornaments,
}: {
  loader: HTMLElement;
  titleLines: HTMLElement[];
  ornaments: HTMLElement[];
}): gsap.core.Timeline {
  return gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .to(loader, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" })
    .to(
      titleLines,
      { yPercent: 0, opacity: 1, duration: 1, stagger: 0.14 },
      "-=0.3",
    )
    .to(ornaments, { opacity: 1, duration: 0.7 }, "-=0.5");
}
