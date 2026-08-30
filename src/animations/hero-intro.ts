import gsap from "gsap";
import {
  playSondavenReveal,
  setSondavenHidden,
} from "@/animations/sondaven-reveal";

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

/**
 * 降级路径：跳过视频，加载层直接交叉淡化到静态首屏。
 */
export function buildFallbackReveal({
  loader,
  root,
}: {
  loader: HTMLElement;
  root: HTMLElement;
}): gsap.core.Timeline {
  setSondavenHidden(root);
  const reveal = playSondavenReveal(root);

  return gsap
    .timeline()
    .to(loader, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" }, 0)
    .add(reveal, 0.2);
}
