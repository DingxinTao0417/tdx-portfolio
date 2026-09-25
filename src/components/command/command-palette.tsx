import { getLocale, getTranslations } from "next-intl/server";
import { navItems } from "@/data/nav";
import { projects } from "@/data/projects";
import { pick } from "@/data/types";
import { routing } from "@/i18n/routing";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { CommandRoot } from "./command-root";
import type { CommandData } from "./types";

/**
 * Builds the palette's small localized index on the server (page names in both languages, so
 * either can be typed; project and post titles with a few tags) and hands it to the client layer.
 */
export async function CommandPalette() {
  const locale = await getLocale();
  const other = routing.locales.find((code) => code !== locale) ?? routing.defaultLocale;
  const [tNav, tAlias, posts] = await Promise.all([
    getTranslations("Nav"),
    getTranslations({ locale: other, namespace: "Nav" }),
    getAllPosts(locale),
  ]);

  const data: CommandData = {
    pages: navItems.map(({ key, href }) => ({ key, href, label: tNav(key), alias: tAlias(key) })),
    projects: projects.map((project) => ({
      slug: project.slug,
      index: project.index,
      title: pick(project.title, locale),
      tagline: pick(project.tagline, locale),
      kind: pick(project.kind, locale),
      stack: project.stack.slice(0, 6),
    })),
    posts: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      tags: post.tags.slice(0, 3),
      date: formatDate(post.date, locale),
    })),
  };

  return <CommandRoot data={data} />;
}
