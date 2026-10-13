"use server";

import { compileMDX } from "next-mdx-remote/rsc";
import { redirect } from "next/navigation";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { isAllowedCover, readPostFile } from "@/lib/blog";
import { revalidatePosts } from "@/lib/content-revalidate";
import { requireAdmin } from "@/lib/supabase/admin";

export type PostState = { ok: boolean; message: string } | null;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "网址标识只能用小写字母、数字和连字符").max(80);
const locale = z.enum(["zh", "en"]);
const schema = z.object({
  id: z.uuid().optional(),
  slug,
  locale,
  title: z.string().trim().min(1, "标题不能为空").max(200),
  description: z.string().trim().max(400),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 2026-01-31"),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  hue: z.number().int().min(0).max(360),
  cover: z.string().trim().refine((value) => value === "" || isAllowedCover(value), "封面必须是 /images/blog/ 下的图片，或在这里上传的图片"),
  cover_alt: z.string().trim().max(300),
  status: z.enum(["draft", "published"]),
  body: z.string().max(200_000),
  // Editorial notes kept in `meta` (front matter `status` / `verification`); not shown on the site.
  contentStatus: z.string().trim().max(80),
  verification: z.string().trim().max(160),
});

/** Sets or clears the two editorial notes while leaving every other `meta` key untouched. */
function withNotes(meta: unknown, notes: { contentStatus: string; verification: string }) {
  const next: Record<string, unknown> = meta && typeof meta === "object" && !Array.isArray(meta) ? { ...meta } : {};
  if (notes.contentStatus) next.status = notes.contentStatus;
  else delete next.status;
  if (notes.verification) next.verification = notes.verification;
  else delete next.verification;
  return next;
}

/** MDX that fails to compile would break the public page, so it is rejected before saving. */
async function mdxProblem(source: string) {
  try {
    await compileMDX({ source, options: { mdxOptions: { remarkPlugins: [remarkGfm] } } });
    return null;
  } catch (error) {
    return error instanceof Error ? error.message.split("\n")[0] : "无法解析";
  }
}

export async function savePost(_: PostState, formData: FormData): Promise<PostState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    slug: String(formData.get("slug") ?? "").trim(),
    locale: formData.get("locale"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    date: formData.get("date"),
    tags: String(formData.get("tags") ?? "").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
    hue: Number(formData.get("hue") ?? 22),
    cover: formData.get("cover") ?? "",
    cover_alt: formData.get("cover_alt") ?? "",
    status: formData.get("status"),
    contentStatus: formData.get("content_status") ?? "",
    verification: formData.get("verification") ?? "",
    body: String(formData.get("body") ?? "").replace(/\r\n/g, "\n"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues.map((issue) => issue.message).join("；") };

  const { id, cover, cover_alt, contentStatus, verification, ...rest } = parsed.data;
  const notes = { contentStatus, verification };
  const problem = await mdxProblem(rest.body);
  if (problem) return { ok: false, message: `正文无法解析，未保存：${problem}` };
  if (rest.status === "published" && cover === "") return { ok: false, message: "发布前请先设置封面图。" };

  const row = { ...rest, cover: cover || null, cover_alt: cover_alt || null };
  if (id) {
    const current = await supabase.from("posts").select("meta").eq("id", id).maybeSingle();
    const { error } = await supabase.from("posts").update({ ...row, meta: withNotes(current.data?.meta, notes) }).eq("id", id);
    if (error) return { ok: false, message: error.code === "23505" ? "这个语言下已经有同名网址标识的文章。" : `保存失败：${error.message}` };
    revalidatePosts();
    return { ok: true, message: rest.status === "published" ? "已保存并发布，网站会在下次访问时更新。" : "草稿已保存。" };
  }

  const { data, error } = await supabase.from("posts").insert({ ...row, meta: withNotes(null, notes) }).select("id").single();
  if (error) return { ok: false, message: error.code === "23505" ? "这个语言下已经有同名网址标识的文章。" : `保存失败：${error.message}` };
  revalidatePosts();
  redirect(`/admin/posts/${data.id}?created=1`);
}

export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  await supabase.from("posts").delete().eq("id", id.data);
  revalidatePosts();
  redirect("/admin/posts");
}

export type TranslationResult = { ok: true; id: string } | { ok: false; message: string; existingId?: string };

const translation = z.object({
  sourceId: z.uuid(),
  locale,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(400),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  cover_alt: z.string().trim().max(300),
  body: z.string().min(1).max(200_000),
});

/** Saves an AI translation as a draft in the other language, sharing the source post's slug, date and cover. */
export async function saveTranslation(input: z.input<typeof translation>): Promise<TranslationResult> {
  const { supabase } = await requireAdmin();
  const parsed = translation.safeParse(input);
  if (!parsed.success) return { ok: false, message: "译文内容不完整，未保存。" };
  const { sourceId, cover_alt, ...fields } = parsed.data;

  const { data: source } = await supabase.from("posts").select("slug, locale, date, hue, cover, meta").eq("id", sourceId).maybeSingle();
  if (!source) return { ok: false, message: "找不到原文，请先保存原文。" };
  if (source.locale === fields.locale) return { ok: false, message: "译文的语言和原文相同。" };

  const problem = await mdxProblem(fields.body);
  if (problem) return { ok: false, message: `译文正文无法解析，未保存：${problem}` };

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...fields, slug: source.slug, date: source.date, hue: source.hue, cover: source.cover, cover_alt: cover_alt || null, status: "draft", meta: source.meta ?? {} })
    .select("id")
    .single();
  if (error) {
    if (error.code !== "23505") return { ok: false, message: `保存失败：${error.message}` };
    const existing = await supabase.from("posts").select("id").eq("slug", source.slug).eq("locale", fields.locale).maybeSingle();
    return { ok: false, message: "这篇文章已经有这个语言的版本了，没有覆盖它。", existingId: existing.data?.id as string | undefined };
  }
  revalidatePosts();
  return { ok: true, id: data.id as string };
}

/** Copies a post from the repository into the database so it can be edited here. */
export async function importPost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const target = z.object({ slug, locale }).safeParse({ slug: formData.get("slug"), locale: formData.get("locale") });
  if (!target.success) return;
  const file = await readPostFile(target.data.locale, target.data.slug);
  if (!file) return;

  const { title, description, date, tags, hue, cover, coverAlt, ...meta } = file.data;
  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug: target.data.slug,
      locale: target.data.locale,
      title: String(title ?? target.data.slug),
      description: String(description ?? ""),
      date: /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : new Date().toISOString().slice(0, 10),
      tags: Array.isArray(tags) ? tags.map(String) : [],
      hue: typeof hue === "number" ? Math.round(hue) : 22,
      cover: isAllowedCover(cover) ? cover : null,
      cover_alt: typeof coverAlt === "string" ? coverAlt : null,
      status: "published",
      body: file.content.replace(/\r\n/g, "\n").replace(/^\n+/, ""),
      meta,
    })
    .select("id")
    .single();
  if (error) {
    // Already imported: open the existing copy instead.
    const existing = await supabase.from("posts").select("id").eq("slug", target.data.slug).eq("locale", target.data.locale).maybeSingle();
    if (existing.data) redirect(`/admin/posts/${existing.data.id}`);
    return;
  }
  revalidatePosts();
  redirect(`/admin/posts/${data.id}`);
}
