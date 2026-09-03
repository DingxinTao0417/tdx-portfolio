import { NextResponse, type NextRequest } from "next/server";
import { absoluteUrl } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { getAllPosts } from "@/lib/blog";

export const runtime = "nodejs";

/**
 * GET /api/blog?locale=en|zh
 * JSON feed of published posts — handy for RSS readers, external widgets, or
 * anything else that wants the blog index without scraping HTML.
 */
export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get("locale") ?? routing.defaultLocale;
  const locale = (routing.locales as readonly string[]).includes(requested)
    ? requested
    : routing.defaultLocale;
  const posts = await getAllPosts(locale);

  return NextResponse.json(
    {
      ok: true,
      locale,
      count: posts.length,
      posts: posts.map((p) => ({
        ...p,
        url: absoluteUrl(locale, `/blog/${p.slug}`),
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" } },
  );
}
