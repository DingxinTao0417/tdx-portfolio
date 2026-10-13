import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { buttonClasses } from "@/components/ui/button";
import { projects as fileProjects, type Project } from "@/data/projects";
import { requireAdmin } from "@/lib/supabase/admin";
import { importProject } from "./actions";

export const metadata: Metadata = { title: "项目" };

type Row = { slug: string; data: Partial<Project> | null; sort: number; published: boolean };
const link = "inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent";

export default async function ProjectsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("projects").select("slug, data, sort, published").order("sort");
  const stored = (data ?? []) as Row[];
  const inDatabase = new Set(stored.map((row) => row.slug));
  const fileOnly = fileProjects.filter((project) => !inDatabase.has(project.slug));

  return (
    <>
      <AdminPageTitle eyebrow="Projects" title="项目" body="在这里修改的项目保存后直接上线。代码里原有的项目可以导入后再编辑。">
        <Link href="/admin/projects/new" className={buttonClasses({})}>
          <Plus className="h-4 w-4" aria-hidden />
          新建项目
        </Link>
      </AdminPageTitle>

      {error && <p role="alert" className="surface-panel mb-6 p-5 text-sm text-accent">读取项目失败：{error.message}</p>}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">可编辑的项目</h2>
        {stored.length === 0 ? (
          <p className="surface-panel p-6 text-sm text-muted">还没有。可以新建一个，或从下面导入已有项目。</p>
        ) : (
          <ul className="surface-panel divide-y divide-line bg-bg-elevated">
            {stored.map((row) => (
              <li key={row.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${row.published ? "bg-accent-soft text-accent" : "bg-fg/10 text-muted"}`}>
                  {row.published ? "已发布" : "未发布"}
                </span>
                <Link href={`/admin/projects/${row.slug}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">
                  {row.data?.title?.zh ?? row.slug}
                </Link>
                <span className="font-mono text-xs text-muted">/{row.slug}</span>
                <Link href={`/admin/projects/${row.slug}`} className={link}>编辑</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {fileOnly.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 font-display text-lg font-semibold">代码里的项目</h2>
          <p className="mb-3 text-xs leading-6 text-muted">这些项目来自 src/data/projects.ts。导入后会在数据库里生成一份可编辑的副本，网站改为显示这份副本；代码里的内容保留不动。</p>
          <ul className="surface-panel divide-y divide-line">
            {fileOnly.map((project) => (
              <li key={project.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className="font-mono text-xs text-muted">{project.index}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{project.title.zh}</span>
                <span className="font-mono text-xs text-muted">/{project.slug}</span>
                <form action={importProject}>
                  <input type="hidden" name="slug" value={project.slug} />
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
