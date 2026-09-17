import { NextResponse } from "next/server";
import {
  CONTACT_RECIPIENT,
  normalizeContactValues,
  validateContactValues,
  type ContactFormValues,
} from "@/lib/contact-form";

/**
 * 联系表单投递：校验后经 Resend HTTP API 发信到工作室邮箱。
 * 运行所需环境变量：
 *   RESEND_API_KEY  Resend 密钥（必填，缺失时返回 503）
 *   CONTACT_FROM    发件人，须为 Resend 已验证域名下的地址
 *                   （默认 onboarding@resend.dev，仅供测试）
 *   CONTACT_TO      收件人，默认 shuangzhang@fintopia.tech
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Grava Design <onboarding@resend.dev>";
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

/** 单实例内存限流：同一 IP 每 10 分钟最多 5 次 */
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function buildEmail(values: ContactFormValues, locale: string) {
  const zh = locale !== "en";
  const subject = zh
    ? `【万有引力】新的调查申请 — ${values.name}`
    : `[Grava Design] New survey request — ${values.name}`;
  const text = [
    zh ? `调查发起人：${values.name}` : `Name: ${values.name}`,
    zh ? `邮箱：${values.email}` : `Email: ${values.email}`,
    "",
    zh ? "调查内容：" : "Inquiry:",
    values.message,
  ].join("\n");
  return { subject, text };
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const values = normalizeContactValues(body);
  const errors = validateContactValues(values);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "invalid_fields", errors }, { status: 422 });
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const locale = typeof body.locale === "string" ? body.locale : "zh";
  const { subject, text } = buildEmail(values, locale);

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? DEFAULT_FROM,
      to: [process.env.CONTACT_TO ?? CONTACT_RECIPIENT],
      reply_to: values.email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[contact] resend ${response.status}: ${detail}`);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
