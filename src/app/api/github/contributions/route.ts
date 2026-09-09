import { NextResponse } from "next/server";
import { getGitHubContributionCalendar } from "@/lib/github";
import { isGitHubContributionYear } from "@/lib/github-contributions";

export const runtime = "nodejs";

/** A missing year requests GitHub's rolling year; a year requests Jan 1 to Dec 31. */
export async function GET(request: Request) {
  const years = new URL(request.url).searchParams.getAll("year");
  const year = years.length === 0 ? undefined : Number(years[0]);
  if (years.length > 1 || (year !== undefined && (!/^\d{4}$/.test(years[0]) || !isGitHubContributionYear(year)))) {
    return NextResponse.json(
      { ok: false, error: "invalid_year" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const calendar = await getGitHubContributionCalendar(year);
  if (!calendar) {
    return NextResponse.json(
      { ok: false, error: "github_contributions_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    { ok: true, ...calendar },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600" } },
  );
}
