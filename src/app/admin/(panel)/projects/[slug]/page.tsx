import { ArrowUpRight, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectEditor } from "@/components/admin/project-editor";
import type { Project } from "@/data/projects";
import { requireAdmin } from "@/lib/supabase/admin";
import { deleteProject, saveProject } from "../actions";

export const metadata: Metadata = { title: "编辑项目" };

const link = "inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent";

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ created?: string }> }) {
  const { supabase } = await requireAdmin();
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();
  const { data } = await supabase.from("projects").select("slug, data, sort, published").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const project = data.data as Project;
  const created = (await searchParams).created;

  return (
    <>
      <AdminPageTitle eyebrow="Projects" title={project.title?.zh || slug} body={created ? "项目已创建。" : undefined}>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/projects" className="mr-2 text-sm text-muted hover:text-accent">返回列表</Link>
          {data.published && (
            <a href={`/projects/${slug}`} target="_blank" rel="noreferrer" className={link}>
              查看页面 <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          <form action={deleteProject}>
            <input type="hidden" name="slug" value={slug} />
            <ConfirmButton message={`永久删除「${project.title?.zh || slug}」的数据库副本？如果代码里有同名项目，网站会恢复显示代码里的版本。`} className={link}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />删除
            </ConfirmButton>
          </form>
        </div>
      </AdminPageTitle>
      <ProjectEditor key={slug} action={saveProject} initial={project} sort={data.sort as number} published={data.published as boolean} isNew={false} />
    </>
  );
}
