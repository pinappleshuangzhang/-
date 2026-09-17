"use client";

import { useSyncExternalStore } from "react";

/**
 * 联系表单弹窗的开关状态。
 * 导航栏与最后一屏 CTA 分别位于 PageChrome 与分屏内部，没有共同的父级，
 * 用模块级 store 共享状态，避免为此再加一层 Provider。
 */

let isOpen = false;
/** 打开弹窗前的焦点元素，关闭后归还焦点 */
let returnFocusTarget: HTMLElement | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function openContactDialog() {
  if (isOpen) return;
  returnFocusTarget =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  isOpen = true;
  emit();
}

export function closeContactDialog() {
  if (!isOpen) return;
  isOpen = false;
  emit();
  const target = returnFocusTarget;
  returnFocusTarget = null;
  if (target?.isConnected) target.focus({ preventScroll: true });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useContactDialogOpen() {
  return useSyncExternalStore(
    subscribe,
    () => isOpen,
    () => false,
  );
}
