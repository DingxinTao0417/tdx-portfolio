import { ArrowUpRight, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPageTitle } from "@/components/admin/page-title";
import { PostEditor, type PostDraft } from "@/components/admin/post-editor";
import { requireAdmin } from "@/lib/supabase/admin";
import { deletePost, savePost } from "../actions";

export const metadata: Metadata = { title: "编辑文章" };

const link = "inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, locale, title, description, date, tags, hue, cover, cover_alt, status, body, meta")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const { meta, ...fields } = data;
  const notes = (meta ?? {}) as { status?: unknown; verification?: unknown };
  const post = {
    ...fields,
    cover: fields.cover ?? "",
    cover_alt: fields.cover_alt ?? "",
    contentStatus: typeof notes.status === "string" ? notes.status : "",
    verification: typeof notes.verification === "string" ? notes.verification : "",
  } as PostDraft & { id: string };
  const created = (await searchParams).created;
  const href = `${post.locale === "en" ? "/en" : ""}/blog/${post.slug}`;

  return (
    <>
      <AdminPageTitle eyebrow="Posts" title="编辑文章" body={created ? "文章已创建。" : undefined}>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/posts" className="mr-2 text-sm text-muted hover:text-accent">返回列表</Link>
          {post.status === "published" && (
            <a href={href} target="_blank" rel="noreferrer" className={link}>
              查看页面 <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <ConfirmButton message={`永久删除《${post.title}》的数据库副本？如果仓库里有同名文件，网站会恢复显示文件版本。`} className={link}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />删除
            </ConfirmButton>
          </form>
        </div>
      </AdminPageTitle>
      <PostEditor key={post.id} action={savePost} initial={post} />
    </>
  );
}
