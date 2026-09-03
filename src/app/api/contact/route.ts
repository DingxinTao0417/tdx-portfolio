import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/data/site";
import { contactSchema } from "@/lib/contact-schema";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

/**
 * POST /api/contact
 * Validates the payload, applies a per-IP rate limit, and delivers the message
 * through Resend when `RESEND_API_KEY` is configured. Without it, the message
 * is logged server-side and the client is told delivery isn't configured.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot tripped: pretend everything is fine, deliver nothing.
  if (data.website) {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[contact] delivery not configured — message logged only", {
      name: data.name,
      email: data.email,
      topic: data.topic,
      company: data.company,
      locale: data.locale,
      preview: data.message.slice(0, 120),
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `[Portfolio] ${data.topic.toUpperCase()} — ${data.name}`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#16120e">
          <h2 style="margin:0 0 12px">New message from ${escapeHtml(data.name)}</h2>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}<br/>
          <strong>Company:</strong> ${escapeHtml(data.company || "—")}<br/>
          <strong>Topic:</strong> ${escapeHtml(data.topic)}<br/>
          <strong>Locale:</strong> ${data.locale}<br/>
          <strong>IP:</strong> ${escapeHtml(ip)}</p>
          <hr style="border:0;border-top:1px solid #eee;margin:16px 0"/>
          <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
        </div>`,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] delivery failed", err);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }
}
