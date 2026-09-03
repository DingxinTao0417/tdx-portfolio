import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { absoluteUrl } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { getAllSlugs } from "@/lib/blog";

const staticPaths = ["/", "/projects", "/skills", "/blog", "/about", "/contact"];

function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  return routing.locales.map((locale) => ({
    url: absoluteUrl(locale, path),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, path)])),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  return [
    ...staticPaths.flatMap((p) => entry(p, p === "/" ? 1 : 0.8, "weekly")),
    ...projects.flatMap((p) => entry(`/projects/${p.slug}`, 0.7, "monthly")),
    ...slugs.flatMap((s) => entry(`/blog/${s}`, 0.6, "monthly")),
  ];
}
