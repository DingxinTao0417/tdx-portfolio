import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { ProjectEditor } from "@/components/admin/project-editor";
import type { Project } from "@/data/projects";
import { getProjects } from "@/lib/projects";
import { requireAdmin } from "@/lib/supabase/admin";
import { saveProject } from "../actions";

export const metadata: Metadata = { title: "新建项目" };

const blank = { en: "", zh: "" };

export default async function NewProjectPage() {
  await requireAdmin();
  const count = (await getProjects()).length;
  const initial: Project = {
    slug: "",
    index: String(count + 1).padStart(2, "0"),
    title: blank,
    tagline: blank,
    description: blank,
    problem: blank,
    approach: blank,
    impact: blank,
    highlights: [],
    role: blank,
    kind: blank,
    stage: { label: blank, tone: "preview" },
    year: String(new Date().getFullYear()),
    category: "fullstack",
    stack: [],
    links: {},
    hue: 22,
    motif: "grid",
    metrics: [],
  };

  return (
    <>
      <AdminPageTitle eyebrow="Projects" title="新建项目" body="所有中英文文字都需要填写；封面和截图可以先留空。">
        <Link href="/admin/projects" className="text-sm text-muted hover:text-accent">返回列表</Link>
      </AdminPageTitle>
      <ProjectEditor action={saveProject} initial={initial} sort={count} published={false} isNew />
    </>
  );
}
