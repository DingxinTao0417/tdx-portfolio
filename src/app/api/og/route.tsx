import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { site } from "@/data/site";

export const runtime = "nodejs";

/**
 * Loads a Google Font subset containing exactly the glyphs we need (so CJK
 * titles render), returning undefined if the network is unavailable.
 */
async function loadGoogleFont(family: string, weight: number, text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:woff2|woff|truetype|opentype)'\)/)?.[1];
    if (!url) return undefined;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return undefined;
  }
}

/**
 * GET /api/og?title=…&subtitle=…&locale=en|zh&hue=22&kind=post|page
 * Renders the social preview card used across the site.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = (searchParams.get("title") ?? site.name).slice(0, 90);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 140);
  const locale = searchParams.get("locale") === "zh" ? "zh" : "en";
  const hue = Number(searchParams.get("hue") ?? 22);
  const kind = searchParams.get("kind") ?? "page";

  const glyphs = `${title}${subtitle}${site.name}${site.nameZh}AI Full-Stack Engineer · FDE`;
  const fontFamily = locale === "zh" ? "Noto Sans SC" : "Bricolage Grotesque";
  const fontData = await loadGoogleFont(fontFamily, 700, glyphs);

  const accent = `hsl(${hue} 100% 56%)`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0a0b10",
          color: "#f4efe8",
          fontFamily: fontData ? '"Display"' : "sans-serif",
          position: "relative",
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(244,239,232,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,239,232,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -200,
            width: 640,
            height: 640,
            borderRadius: 999,
            background: accent,
            opacity: 0.35,
            filter: "blur(120px)",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "#f4efe8",
                color: "#0a0b10",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {site.initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{site.name}</span>
              <span style={{ fontSize: 16, opacity: 0.6, letterSpacing: 2 }}>
                {site.nameZh} · AI FULL-STACK · FDE
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid rgba(244,239,232,0.2)",
              fontSize: 16,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: accent }} />
            {kind === "post" ? (locale === "zh" ? "博客" : "Blog") : locale === "zh" ? "作品集" : "Portfolio"}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
          <div
            style={{
              fontSize: title.length > 40 ? 60 : 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 28, lineHeight: 1.35, opacity: 0.72 }}>{subtitle}</div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            letterSpacing: 2,
            opacity: 0.7,
          }}
        >
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 2, background: accent }} />
            <span>UCI &apos;26 · USC &apos;27</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData ? [{ name: "Display", data: fontData, weight: 700, style: "normal" }] : undefined,
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
