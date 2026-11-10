import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/** 目录、抽屉、灯箱、轮播各自有跟随光标，这里让出。 */
const OWN_CURSOR =
  "[data-own-cursor], [data-survey-drawer], [data-survey-lightbox]";
const TEXT_FIELD = "input, textarea, select, [contenteditable='true']";
const MAGNETIC =
  "a[href], button:not(:disabled), [role='button'], [role='link'], summary, [data-magnetic]";

const STICK = 0.42;
const SHIFT = 0.32;
/** 离开控件边缘后仍保持吸附，避免位移把指针甩出热点。 */
const HOLD_PAD = 16;
/** 稿面 12px，随桌面 --su 同一封顶放大 */
const MAX_SHIFT = 12;
/** 比这更大的点击区只放大光环，避免被吸到画面中央 */
const MAX_BOX = { width: 480, height: 160 };

function clamp(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

function shiftLimit() {
  return (Math.min(window.innerWidth, 1680) / 1440) * MAX_SHIFT;
}

function restingCenter(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const currentX = Number(gsap.getProperty(el, "x")) || 0;
  const currentY = Number(gsap.getProperty(el, "y")) || 0;
  return {
    x: rect.left + rect.width / 2 - currentX,
    y: rect.top + rect.height / 2 - currentY,
    width: rect.width,
    height: rect.height,
  };
}

function held(el: HTMLElement, x: number, y: number) {
  const rect = el.getBoundingClientRect();
  return (
    x >= rect.left - HOLD_PAD &&
    x <= rect.right + HOLD_PAD &&
    y >= rect.top - HOLD_PAD &&
    y <= rect.bottom + HOLD_PAD
  );
}

type Pull = {
  x: (value: number) => void;
  y: (value: number) => void;
};

/** 光标位移与按钮吸附都写在 GSAP 上，不经 React state。 */
export function useMagneticCursor(
  active: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    const ring = root?.querySelector<HTMLElement>("[data-cursor-ring]");
    const ringShape = root?.querySelector<HTMLElement>("[data-cursor-ring-shape]");
    const dot = root?.querySelector<HTMLElement>("[data-cursor-dot]");
    if (!ring || !ringShape || !dot) return;

    gsap.set([ring, dot], {
      xPercent: -50,
      yPercent: -50,
      x: -100,
      y: -100,
      autoAlpha: 0,
    });
    // scale 会拆成 scaleX/scaleY，quickTo 无法 reset，悬停时每帧报警且放大不生效。
    gsap.set(ringShape, { scaleX: 1, scaleY: 1 });

    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    const ringScaleEase = { duration: 0.35, ease: "power3.out" };
    const ringScaleX = gsap.quickTo(ringShape, "scaleX", ringScaleEase);
    const ringScaleY = gsap.quickTo(ringShape, "scaleY", ringScaleEase);
    const ringScale = (value: number) => {
      ringScaleX(value);
      ringScaleY(value);
    };
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });

    const pulls = new WeakMap<HTMLElement, Pull>();
    const releases = new WeakMap<HTMLElement, gsap.core.Tween>();
    const shifting = new WeakSet<HTMLElement>();
    let current: HTMLElement | null = null;
    let visible = false;
    let pointerX = -100;
    let pointerY = -100;

    const pullFor = (el: HTMLElement) => {
      let pull = pulls.get(el);
      if (!pull) {
        const ease = { duration: 0.4, ease: "power3.out" };
        pull = {
          x: gsap.quickTo(el, "x", ease),
          y: gsap.quickTo(el, "y", ease),
        };
        pulls.set(el, pull);
      }
      return pull;
    };

    const allowShift = (el: HTMLElement) => {
      if (shifting.has(el)) return true;
      if (getComputedStyle(el).transform !== "none") return false;
      shifting.add(el);
      return true;
    };

    const release = (el: HTMLElement | null) => {
      if (!el || !shifting.has(el)) return;
      releases.get(el)?.kill();
      const tween = gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: () => {
          if (current === el) return;
          gsap.set(el, { clearProps: "x,y" });
        },
      });
      releases.set(el, tween);
    };

    const setVisible = (next: boolean) => {
      if (visible === next) return;
      visible = next;
      if (next) {
        document.documentElement.setAttribute("data-magnetic-cursor", "");
        gsap.to([ring, dot], { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
        return;
      }
      document.documentElement.removeAttribute("data-magnetic-cursor");
      gsap.set([ring, dot], { autoAlpha: 0 });
    };

    const resolveMagnetic = (node: Element | null) => {
      const found = node?.closest(MAGNETIC);
      if (!(found instanceof HTMLElement)) return null;
      if (found.getAttribute("aria-disabled") === "true") return null;
      if (found.closest("[data-no-magnetic]")) return null;
      return found;
    };

    const place = (clientX: number, clientY: number, target: EventTarget | null) => {
      pointerX = clientX;
      pointerY = clientY;
      dotX(clientX);
      dotY(clientY);

      const node = target instanceof Element ? target : null;
      if (!node || node.closest(OWN_CURSOR) || node.closest(TEXT_FIELD)) {
        setVisible(false);
        release(current);
        current = null;
        ringX(clientX);
        ringY(clientY);
        ringScale(1);
        return;
      }

      setVisible(true);
      let magnetic = resolveMagnetic(node);
      if (!magnetic && current && held(current, clientX, clientY)) {
        magnetic = current;
      }

      if (magnetic !== current) {
        release(current);
        current = magnetic;
      }

      if (!magnetic) {
        ringX(clientX);
        ringY(clientY);
        ringScale(1);
        return;
      }

      const center = restingCenter(magnetic);
      const compact = center.width <= MAX_BOX.width && center.height <= MAX_BOX.height;
      if (!compact) {
        ringX(clientX);
        ringY(clientY);
        ringScale(1.35);
        return;
      }

      ringX(clientX + (center.x - clientX) * STICK);
      ringY(clientY + (center.y - clientY) * STICK);
      ringScale(1.75);

      if (!allowShift(magnetic)) return;
      releases.get(magnetic)?.kill();
      const limit = shiftLimit();
      const pull = pullFor(magnetic);
      pull.x(clamp((clientX - center.x) * SHIFT, limit));
      pull.y(clamp((clientY - center.y) * SHIFT, limit));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      place(event.clientX, event.clientY, event.target);
    };

    const onScroll = () => {
      place(pointerX, pointerY, document.elementFromPoint(pointerX, pointerY));
    };

    const onLeave = () => {
      setVisible(false);
      release(current);
      current = null;
      ringScale(1);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, true);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll, true);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeAttribute("data-magnetic-cursor");
      release(current);
      gsap.set([ring, dot], { autoAlpha: 0 });
    };
  }, [active, rootRef]);
}
