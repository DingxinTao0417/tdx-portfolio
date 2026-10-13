"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { projects as fileProjects } from "@/data/projects";
import { revalidateProjects } from "@/lib/content-revalidate";
import { describeIssues, projectSchema } from "@/lib/project-schema";
import { requireAdmin } from "@/lib/supabase/admin";

export type ProjectState = { ok: boolean; message: string; issues?: string[] } | null;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60);

export async function saveProject(_: ProjectState, formData: FormData): Promise<ProjectState> {
  const { supabase } = await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("data") ?? ""));
  } catch {
    return { ok: false, message: "数据格式不正确，未保存。" };
  }
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "有字段不符合要求，未保存：", issues: describeIssues(parsed.error) };

  const isNew = formData.get("isNew") === "1";
  const row = {
    slug: parsed.data.slug,
    data: parsed.data,
    sort: Math.round(Number(formData.get("sort")) || 0),
    published: formData.get("published") === "on",
  };
  if (isNew) {
    const { error } = await supabase.from("projects").insert(row);
    if (error) return { ok: false, message: error.code === "23505" ? "已经有同名网址标识的项目。" : `保存失败：${error.message}` };
    revalidateProjects();
    redirect(`/admin/projects/${row.slug}?created=1`);
  }
  const { error } = await supabase.from("projects").update(row).eq("slug", row.slug);
  if (error) return { ok: false, message: `保存失败：${error.message}` };
  revalidateProjects();
  return { ok: true, message: row.published ? "已保存，网站会在下次访问时更新。" : "已保存为未发布状态。" };
}

/** Copies a project from `src/data/projects.ts` into the database so it can be edited here. */
export async function importProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const target = slug.safeParse(formData.get("slug"));
  if (!target.success) return;
  const index = fileProjects.findIndex((project) => project.slug === target.data);
  if (index === -1) return;
  await supabase.from("projects").upsert({ slug: target.data, data: fileProjects[index], sort: index, published: true }, { onConflict: "slug", ignoreDuplicates: true });
  revalidateProjects();
  redirect(`/admin/projects/${target.data}`);
}

export async function deleteProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const target = slug.safeParse(formData.get("slug"));
  if (!target.success) return;
  await supabase.from("projects").delete().eq("slug", target.data);
  revalidateProjects();
  redirect("/admin/projects");
}
