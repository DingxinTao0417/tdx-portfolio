import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { serviceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

const schema = z.object({
  path: z.string().startsWith("/").max(300),
  referrer: z.string().max(500).optional(),
  session: z.string().regex(/^[a-z0-9]{8,40}$/i).optional(),
});

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|node-fetch|axios/i;

function device(agent: string) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(agent)) return "tablet";
  if (/mobi|iphone|android/i.test(agent)) return "mobile";
  return "desktop";
}

function referrerHost(value: string | undefined, self: string) {
  if (!value) return null;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return host && host !== self.replace(/^www\./, "") ? host.slice(0, 120) : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/track — records one page view. Stores the path, referring site, country (from the
 * hosting platform's header), device class and a random per-tab id. The IP address is used only
 * for rate limiting in memory and is never stored; the user agent is reduced to a device class.
 */
export async function POST(req: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  const supabase = serviceSupabase();
  const agent = req.headers.get("user-agent") ?? "";
  if (!supabase || !agent || BOT.test(agent)) return done;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`track:${ip}`, 120, 60 * 1000).ok) return done;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return done;
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return done;

  const { path, referrer, session } = parsed.data;
  if (path.startsWith("/admin") || path.startsWith("/api")) return done;

  const { error } = await supabase.from("page_views").insert({
    path: path.split(/[?#]/)[0],
    locale: path === "/en" || path.startsWith("/en/") ? "en" : "zh",
    referrer_host: referrerHost(referrer, req.nextUrl.hostname),
    country: req.headers.get("x-vercel-ip-country")?.slice(0, 8) ?? null,
    device: device(agent),
    session_id: session ?? null,
  });
  if (error) console.error("[track] insert failed", error.message);
  return done;
}
