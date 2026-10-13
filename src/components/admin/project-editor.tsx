"use client";

import { Upload } from "lucide-react";
import { startTransition, useActionState, useState, type ChangeEvent, type FormEvent } from "react";
import type { ProjectState } from "@/app/admin/(panel)/projects/actions";
import { buttonClasses } from "@/components/ui/button";
import type { Project } from "@/data/projects";
import { uploadImage } from "./upload";

type Pair = { zh: string; en: string };
type PairKey = "title" | "tagline" | "kind" | "role" | "description" | "problem" | "approach" | "impact" | "learning" | "notice" | "galleryNote";

const field = "h-11 w-full rounded-[10px] border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-accent";
const area = "w-full rounded-[10px] border border-line-strong bg-transparent p-3 text-sm leading-6 outline-none focus:border-accent";
const label = "mb-1.5 block text-xs text-muted";
const ghost = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50";

const short: { key: PairKey; label: string }[] = [
  { key: "title", label: "名称" },
  { key: "tagline", label: "一句话介绍" },
  { key: "kind", label: "项目类型" },
  { key: "role", label: "我的角色" },
];
const long: { key: PairKey; label: string; optional?: boolean }[] = [
  { key: "description", label: "概述" },
  { key: "problem", label: "要解决的问题" },
  { key: "approach", label: "做法" },
  { key: "impact", label: "结果" },
  { key: "learning", label: "收获（可留空）", optional: true },
  { key: "notice", label: "维护提示（可留空）", optional: true },
  { key: "galleryNote", label: "截图说明（可留空）", optional: true },
];
const lists = [
  { key: "highlights", label: "亮点（每项含 zh 和 en）" },
  { key: "metrics", label: "指标（每项含 value 和 label）" },
  { key: "cover", label: "封面图（src、alt、width、height；可为 null）" },
  { key: "gallery", label: "截图列表（每项含 src、alt、width、height、caption）" },
  { key: "article", label: "关联文章（slug 和 label；可为 null）" },
] as const;
type ListKey = (typeof lists)[number]["key"];

const pretty = (value: unknown) => JSON.stringify(value ?? null, null, 2);
const empty: Pair = { zh: "", en: "" };

/**
 * Project form. Text fields are edited directly in both languages; list-like fields (highlights,
 * metrics, images) are edited as JSON and validated on the server before anything is saved.
 */
export function ProjectEditor({
  initial,
  sort,
  published,
  isNew,
  action,
}: {
  initial: Project;
  sort: number;
  published: boolean;
  isNew: boolean;
  action: (state: ProjectState, data: FormData) => Promise<ProjectState>;
}) {
  const [state, submit, pending] = useActionState(action, null);
  const [project, setProject] = useState(initial);
  const [stack, setStack] = useState(initial.stack.join(", "));
  const [json, setJson] = useState<Record<ListKey, string>>({
    highlights: pretty(initial.highlights),
    metrics: pretty(initial.metrics),
    cover: pretty(initial.cover),
    gallery: pretty(initial.gallery ?? []),
    article: pretty(initial.article),
  });
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const pair = (key: PairKey): Pair => (project[key] as Pair | undefined) ?? empty;
  const setPair = (key: PairKey, lang: keyof Pair, value: string) =>
    setProject((current) => ({ ...current, [key]: { ...((current[key] as Pair | undefined) ?? empty), [lang]: value } }));
  const set = <K extends keyof Project>(key: K, value: Project[K]) => setProject((current) => ({ ...current, [key]: value }));
  const setLink = (key: keyof Project["links"], value: string | boolean) =>
    setProject((current) => ({ ...current, links: { ...current.links, [key]: value === "" ? undefined : value } }));

  function build(): Project | null {
    const parsed: Partial<Record<ListKey, unknown>> = {};
    for (const { key, label: name } of lists) {
      try {
        parsed[key] = JSON.parse(json[key]);
      } catch {
        setProblem(`「${name}」不是合法的 JSON，请检查括号、引号和逗号。`);
        return null;
      }
    }
    const next: Record<string, unknown> = {
      ...project,
      stack: stack.split(/[,，]/).map((item) => item.trim()).filter(Boolean),
      highlights: parsed.highlights,
      metrics: parsed.metrics,
      cover: parsed.cover ?? undefined,
      gallery: Array.isArray(parsed.gallery) && parsed.gallery.length > 0 ? parsed.gallery : undefined,
      article: parsed.article ?? undefined,
    };
    // Optional bilingual fields are dropped when both languages are blank.
    for (const { key, optional } of long) {
      const value = next[key] as Pair | undefined;
      if (optional && (!value || (!value.zh.trim() && !value.en.trim()))) delete next[key];
    }
    setProblem("");
    return next as Project;
  }

  // Submitting by hand keeps what was typed: a `<form action>` resets its fields after every run.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = build();
    if (!next) return;
    const data = new FormData(event.currentTarget);
    data.set("data", JSON.stringify(next));
    startTransition(() => submit(data));
  }

  async function addImage(event: ChangeEvent<HTMLInputElement>, target: "cover" | "gallery") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setProblem("");
    try {
      const image = await uploadImage(file, "projects", `${project.slug || "project"}-${target}`);
      const entry = { src: image.url, alt: { en: "Describe this screenshot", zh: "描述这张截图" }, width: image.width, height: image.height };
      setJson((current) => {
        if (target === "cover") return { ...current, cover: pretty(entry) };
        let list: unknown[] = [];
        try {
          const existing = JSON.parse(current.gallery);
          if (Array.isArray(existing)) list = existing;
        } catch {
          list = [];
        }
        return { ...current, gallery: pretty([...list, { ...entry, caption: { en: "Caption", zh: "图注" } }]) };
      });
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "上传失败。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="isNew" value={isNew ? "1" : "0"} />

      <div className="flex min-w-0 flex-col gap-6">
        <fieldset className="surface-panel grid gap-4 bg-bg-elevated p-5">
          <legend className="sr-only">基本文字</legend>
          <div className="hidden grid-cols-2 gap-3 text-xs text-muted sm:grid"><span>中文</span><span>English</span></div>
          {short.map(({ key, label: name }) => (
            <div key={key}>
              <span className={label}>{name}</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <input aria-label={`${name}（中文）`} className={field} value={pair(key).zh} onChange={(e) => setPair(key, "zh", e.target.value)} />
                <input aria-label={`${name} (English)`} className={field} value={pair(key).en} onChange={(e) => setPair(key, "en", e.target.value)} />
              </div>
            </div>
          ))}
          <div>
            <span className={label}>进度标签</span>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_9rem]">
              <input aria-label="进度标签（中文）" className={field} value={project.stage.label.zh} onChange={(e) => set("stage", { ...project.stage, label: { ...project.stage.label, zh: e.target.value } })} />
              <input aria-label="Stage label (English)" className={field} value={project.stage.label.en} onChange={(e) => set("stage", { ...project.stage, label: { ...project.stage.label, en: e.target.value } })} />
              <select aria-label="进度状态" className={field} value={project.stage.tone} onChange={(e) => set("stage", { ...project.stage, tone: e.target.value as Project["stage"]["tone"] })}>
                <option value="ready">已可用</option>
                <option value="preview">预览中</option>
                <option value="paused">已暂停</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="surface-panel grid gap-5 bg-bg-elevated p-5">
          <legend className="sr-only">案例正文</legend>
          {long.map(({ key, label: name }) => (
            <div key={key}>
              <span className={label}>{name}</span>
              <div className="grid gap-3 lg:grid-cols-2">
                <textarea aria-label={`${name}（中文）`} rows={4} className={area} value={pair(key).zh} onChange={(e) => setPair(key, "zh", e.target.value)} />
                <textarea aria-label={`${name} (English)`} rows={4} className={area} value={pair(key).en} onChange={(e) => setPair(key, "en", e.target.value)} />
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset className="surface-panel grid gap-5 bg-bg-elevated p-5">
          <legend className="mb-1 text-sm font-semibold">列表与图片（JSON）</legend>
          <div className="flex flex-wrap gap-2">
            <label className={ghost}>
              <Upload className="h-3.5 w-3.5" aria-hidden />
              {busy ? "上传中…" : "上传并设为封面"}
              <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(event) => addImage(event, "cover")} />
            </label>
            <label className={ghost}>
              <Upload className="h-3.5 w-3.5" aria-hidden />
              {busy ? "上传中…" : "上传并加入截图列表"}
              <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(event) => addImage(event, "gallery")} />
            </label>
          </div>
          {lists.map(({ key, label: name }) => (
            <div key={key}>
              <label className={label} htmlFor={`project-${key}`}>{name}</label>
              <textarea
                id={`project-${key}`}
                rows={key === "gallery" ? 14 : key === "article" || key === "cover" ? 6 : 9}
                spellCheck={false}
                className={`${area} font-mono text-[12px] leading-5`}
                value={json[key]}
                onChange={(e) => setJson((current) => ({ ...current, [key]: e.target.value }))}
              />
            </div>
          ))}
        </fieldset>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="surface-panel flex flex-col gap-4 bg-bg-elevated p-5">
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" name="published" defaultChecked={published} className="h-4 w-4 accent-[var(--accent)]" />
            发布到网站
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={Boolean(project.featured)} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            在首页精选里展示
          </label>
          <button type="submit" disabled={pending || busy} className={buttonClasses({ className: "w-full" })}>
            {pending ? "保存中…" : "保存"}
          </button>
          {problem && <p role="alert" className="text-sm leading-6 text-accent">{problem}</p>}
          {state && (
            <div role={state.ok ? "status" : "alert"} className={`text-sm leading-6 ${state.ok ? "text-muted" : "text-accent"}`}>
              <p>{state.message}</p>
              {state.issues && (
                <ul className="mt-2 list-disc pl-4 font-mono text-[11px] leading-5">
                  {state.issues.map((issue) => <li key={issue}>{issue}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="surface-panel flex flex-col gap-4 bg-bg-elevated p-5">
          <div>
            <label className={label} htmlFor="project-slug">网址标识</label>
            <input id="project-slug" className={`${field} font-mono`} value={project.slug} readOnly={!isNew} onChange={(e) => set("slug", e.target.value)} placeholder="my-project" />
            <p className="mt-1 font-mono text-[10px] text-muted">/projects/{project.slug || "…"}{!isNew && "（创建后不能改）"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="project-index">编号</label>
              <input id="project-index" className={`${field} font-mono`} value={project.index} onChange={(e) => set("index", e.target.value)} placeholder="07" />
            </div>
            <div>
              <label className={label} htmlFor="project-year">年份</label>
              <input id="project-year" className={`${field} font-mono`} value={project.year} onChange={(e) => set("year", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="project-category">分类</label>
              <select id="project-category" className={field} value={project.category} onChange={(e) => set("category", e.target.value as Project["category"])}>
                <option value="ai">AI</option>
                <option value="fullstack">全栈</option>
                <option value="data">数据</option>
                <option value="fde">前沿部署</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="project-sort">排序</label>
              <input id="project-sort" name="sort" type="number" defaultValue={sort} className={`${field} font-mono`} />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="project-stack">技术栈（用逗号分隔）</label>
            <input id="project-stack" className={field} value={stack} onChange={(e) => setStack(e.target.value)} />
          </div>
        </div>

        <div className="surface-panel flex flex-col gap-4 bg-bg-elevated p-5">
          {(["github", "demo", "download"] as const).map((key) => (
            <div key={key}>
              <label className={label} htmlFor={`project-link-${key}`}>{{ github: "GitHub 仓库", demo: "在线演示", download: "下载地址" }[key]}</label>
              <input id={`project-link-${key}`} type="url" className={`${field} font-mono text-xs`} value={project.links[key] ?? ""} onChange={(e) => setLink(key, e.target.value.trim())} placeholder="https://" />
            </div>
          ))}
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={Boolean(project.links.githubPrivate)} onChange={(e) => setLink("githubPrivate", e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            仓库是私有的
          </label>
        </div>

        <div className="surface-panel grid grid-cols-2 gap-3 bg-bg-elevated p-5">
          <div>
            <label className={label} htmlFor="project-hue">色相（0–360）</label>
            <input id="project-hue" type="number" min={0} max={360} className={`${field} font-mono`} value={project.hue} onChange={(e) => set("hue", Number(e.target.value))} />
          </div>
          <div>
            <label className={label} htmlFor="project-motif">封面图案</label>
            <select id="project-motif" className={field} value={project.motif} onChange={(e) => set("motif", e.target.value as Project["motif"])}>
              {(["orbit", "grid", "wave", "stack", "graph", "prism"] as const).map((motif) => <option key={motif} value={motif}>{motif}</option>)}
            </select>
          </div>
        </div>
      </aside>
    </form>
  );
}
