"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function copyWithExecCommand(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "0";
  field.style.left = "0";
  field.style.width = "1px";
  field.style.height = "1px";
  field.style.opacity = "0";
  field.style.pointerEvents = "none";
  document.body.appendChild(field);
  field.focus();
  field.select();
  field.setSelectionRange(0, text.length);
  const ok = document.execCommand("copy");
  field.remove();
  return ok;
}

/** 复制文本；先同步 execCommand 保住点击手势，再尝试 Clipboard API */
export async function copyText(text: string): Promise<boolean> {
  if (copyWithExecCommand(text)) return true;
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * 复制反馈态：同一页面多个复制入口用 key 区分，复制成功后 resetMs 内保持「已复制」。
 */
export function useCopyTarget(resetMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const copy = useCallback(
    async (key: string, text: string) => {
      const ok = await copyText(text);
      if (!ok) return false;
      setCopiedKey(key);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopiedKey(null), resetMs);
      return true;
    },
    [resetMs],
  );

  return { copiedKey, copy };
}
