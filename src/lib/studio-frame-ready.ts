type StudioFramePhase = "blocked" | "allowed" | "settled";

let phase: StudioFramePhase = "blocked";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeStudioFrame(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStudioFramePhase() {
  return phase;
}

export function getStudioFrameServerPhase(): StudioFramePhase {
  return "blocked";
}

function markSettled() {
  if (phase === "settled") return;
  phase = "settled";
  emit();
}

/** 加载层还在时允许开始下桌面尾帧。图已经在页面上就直接算完成。 */
export function allowStudioFrame() {
  if (phase === "blocked") {
    phase = "allowed";
    emit();
  }
  const img = document.querySelector<HTMLImageElement>(
    '[data-shared-bg="studio"] img',
  );
  if (img?.complete) markSettled();
}

export function markStudioFrameSettled() {
  markSettled();
}

export function resetStudioFrame() {
  if (phase === "blocked") return;
  phase = "blocked";
  emit();
}

/**
 * 桌面等尾帧 onLoad 或 onError 后再揭开。手机没有这张图，直接揭开。
 * 返回取消函数，避免超时回调在卸载后还去改画面。
 */
export function whenStudioFrameReady(present: () => void) {
  if (!window.matchMedia("(min-width: 768px)").matches) {
    present();
    return () => {};
  }
  let done = false;
  let unsubscribe = () => {};
  const finish = () => {
    if (done || getStudioFramePhase() !== "settled") return;
    done = true;
    unsubscribe();
    present();
  };
  unsubscribe = subscribeStudioFrame(finish);
  allowStudioFrame();
  finish();
  return () => {
    done = true;
    unsubscribe();
  };
}
