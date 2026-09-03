import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { routing, type Locale } from "@/i18n/routing";
import { readingTime } from "./utils";

export type PostMeta = {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  hue: number;
  readingMinutes: number;
  /** True when the post is served from the fallback locale (English). */
  fallback: boolean;
};

export type Post = PostMeta & { content: string };

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

async function listSlugs(locale: Locale): Promise<string[]> {
  try {
    const files = await fs.readdir(path.join(CONTENT_DIR, locale));
    return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

async function readPost(locale: Locale, slug: string, fallback = false): Promise<Post | null> {
  const file = path.join(CONTENT_DIR, locale, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(file, "utf8");
    const { data, content } = matter(raw);
    return {
      slug,
      locale,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? "2026-01-01"),
      updated: data.updated ? String(data.updated) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      hue: typeof data.hue === "number" ? data.hue : 24,
      readingMinutes: readingTime(content, locale),
      fallback,
      content,
    };
  } catch {
    return null;
  }
}

/** All posts for a locale, falling back to English for untranslated slugs. */
export async function getAllPosts(locale: string): Promise<PostMeta[]> {
  const loc = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  const [own, base] = await Promise.all([listSlugs(loc), listSlugs(routing.defaultLocale)]);
  const slugs = Array.from(new Set([...own, ...base]));
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const post = own.includes(slug)
        ? await readPost(loc, slug)
        : await readPost(routing.defaultLocale, slug, true);
      if (!post) return null;
      const { content: _content, ...meta } = post;
      void _content;
      return meta;
    }),
  );
  return posts
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(locale: string, slug: string): Promise<Post | null> {
  const loc = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  return (
    (await readPost(loc, slug)) ??
    (loc !== routing.defaultLocale ? readPost(routing.defaultLocale, slug, true) : null)
  );
}

export async function getAllSlugs(): Promise<string[]> {
  const lists = await Promise.all(routing.locales.map((l) => listSlugs(l)));
  return Array.from(new Set(lists.flat()));
}
