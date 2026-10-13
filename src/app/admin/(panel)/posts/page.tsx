import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { buttonClasses } from "@/components/ui/button";
import { listFilePosts } from "@/lib/blog";
import { requireAdmin } from "@/lib/supabase/admin";
import { importPost } from "./actions";

export const metadata: Metadata = { title: "文章" };

type Row = { id: string; slug: string; locale: "zh" | "en"; title: string; date: string; status: "draft" | "published"; updated_at: string };
const locales = { zh: "中文", en: "EN" } as const;
const link = "inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent";

export default async function PostsPage() {
  const { supabase } = await requireAdmin();
  const [{ data, error }, files] = await Promise.all([
    supabase.from("posts").select("id, slug, locale, title, date, status, updated_at").order("date", { ascending: false }),
    listFilePosts(),
  ]);
  const stored = (data ?? []) as Row[];
  const inDatabase = new Set(stored.map((post) => `${post.locale}/${post.slug}`));
  const fileOnly = files.filter((post) => !inDatabase.has(`${post.locale}/${post.slug}`)).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <AdminPageTitle eyebrow="Posts" title="文章" body="在这里写的文章保存后直接上线。仓库里原有的文章可以导入后再编辑。">
        <Link href="/admin/posts/new" className={buttonClasses({})}>
          <Plus className="h-4 w-4" aria-hidden />
          新建文章
        </Link>
      </AdminPageTitle>

      {error && <p role="alert" className="surface-panel mb-6 p-5 text-sm text-accent">读取文章失败：{error.message}</p>}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">可编辑的文章</h2>
        {stored.length === 0 ? (
          <p className="surface-panel p-6 text-sm text-muted">还没有。可以新建一篇，或从下面导入已有文章。</p>
        ) : (
          <ul className="surface-panel divide-y divide-line bg-bg-elevated">
            {stored.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${post.status === "published" ? "bg-accent-soft text-accent" : "bg-fg/10 text-muted"}`}>
                  {post.status === "published" ? "已发布" : "草稿"}
                </span>
                <Link href={`/admin/posts/${post.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">{post.title}</Link>
                <span className="font-mono text-xs text-muted">{locales[post.locale]} · {post.date}</span>
                <Link href={`/admin/posts/${post.id}`} className={link}>编辑</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {fileOnly.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 font-display text-lg font-semibold">仓库里的文章</h2>
          <p className="mb-3 text-xs leading-6 text-muted">这些文章来自代码仓库的 MDX 文件。导入后会在数据库里生成一份可编辑的副本，网站改为显示这份副本；原文件保留不动。</p>
          <ul className="surface-panel divide-y divide-line">
            {fileOnly.map((post) => (
              <li key={`${post.locale}/${post.slug}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className="min-w-0 flex-1 truncate text-sm">{post.title}</span>
                <span className="font-mono text-xs text-muted">{locales[post.locale]} · {post.date}</span>
                <form action={importPost}>
                  <input type="hidden" name="slug" value={post.slug} />
                  <input type="hidden" name="locale" value={post.locale} />
                  <button type="submit" className={link}>导入并编辑</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
