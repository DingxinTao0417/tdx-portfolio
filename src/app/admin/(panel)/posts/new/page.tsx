import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { PostEditor } from "@/components/admin/post-editor";
import { requireAdmin } from "@/lib/supabase/admin";
import { savePost } from "../actions";

export const metadata: Metadata = { title: "新建文章" };

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageTitle eyebrow="Posts" title="新建文章">
        <Link href="/admin/posts" className="text-sm text-muted hover:text-accent">返回列表</Link>
      </AdminPageTitle>
      <PostEditor
        action={savePost}
        initial={{
          slug: "",
          locale: "zh",
          title: "",
          description: "",
          date: new Date().toISOString().slice(0, 10),
          tags: [],
          hue: 22,
          cover: "",
          cover_alt: "",
          status: "draft",
          body: "",
          contentStatus: "",
          verification: "",
        }}
      />
    </>
  );
}
