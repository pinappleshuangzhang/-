"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONTACT_RECIPIENT } from "@/lib/contact-form";

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

/** 复制工作室联系邮箱；先同步 execCommand 保住点击手势，再尝试 Clipboard API */
export async function copyContactEmail(): Promise<boolean> {
  if (copyWithExecCommand(CONTACT_RECIPIENT)) return true;
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(CONTACT_RECIPIENT);
    return true;
  } catch {
    return false;
  }
}

export function useCopyContactEmail(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const copy = useCallback(async () => {
    const ok = await copyContactEmail();
    if (!ok) return false;
    setCopied(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), resetMs);
    return true;
  }, [resetMs]);

  return { copied, copy };
}
