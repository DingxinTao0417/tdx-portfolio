import { NextResponse } from "next/server";
import { getGitHubSnapshot } from "@/lib/github";

export const runtime = "nodejs";
export const revalidate = 3600;

/** GET /api/github — cached public GitHub profile + recent repos. */
export async function GET() {
  const snapshot = await getGitHubSnapshot();
  if (!snapshot) {
    return NextResponse.json(
      { ok: false, error: "github_unavailable" },
      { status: 503, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  }
  return NextResponse.json(
    { ok: true, ...snapshot },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
