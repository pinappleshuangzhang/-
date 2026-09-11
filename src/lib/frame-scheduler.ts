type FrameTick = (nowMs: number) => void;

/**
 * 共享 rAF 调度器：页面上所有雾玻璃引擎共用一个 requestAnimationFrame 循环。
 * 首个 tick 注册时启动，注册表清空即整体停止——非第四屏时无任何雾相关 rAF。
 */
const ticks = new Set<FrameTick>();
let rafId = 0;
let running = false;

function loop(nowMs: number) {
  rafId = requestAnimationFrame(loop);
  for (const tick of ticks) tick(nowMs);
}

export function addFrameTick(tick: FrameTick) {
  ticks.add(tick);
  if (!running) {
    running = true;
    rafId = requestAnimationFrame(loop);
  }
}

export function removeFrameTick(tick: FrameTick) {
  ticks.delete(tick);
  if (ticks.size === 0 && running) {
    running = false;
    cancelAnimationFrame(rafId);
  }
}
