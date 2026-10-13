"use client";

import { ImagePlus, Upload } from "lucide-react";
import Image from "next/image";
import { startTransition, useActionState, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent, type FormEvent } from "react";
import type { PostState } from "@/app/admin/(panel)/posts/actions";
import { buttonClasses } from "@/components/ui/button";
import { AiAssist } from "./ai-assist";
import { formatBytes, isImageFile, uploadImage, type UploadedImage } from "./upload";

export type PostDraft = {
  id?: string;
  slug: string;
  locale: "zh" | "en";
  title: string;
  description: string;
  date: string;
  tags: string[];
  hue: number;
  cover: string;
  cover_alt: string;
  status: "draft" | "published";
  body: string;
  /** Editorial notes from front matter (`status` / `verification`); not shown on the site. */
  contentStatus: string;
  verification: string;
};

const CONTENT_STATUSES = ["evergreen", "version-scoped", "in-development"];
const VERIFICATIONS = [
  "personal-experience-not-benchmarked",
  "original-synthesis-not-empirically-validated",
  "source-reviewed-local-evidence-desktop-validation-pending",
  "source-reviewed-local-evidence-public-deployment-pending",
];

const field = "h-11 w-full rounded-[10px] border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-accent";
const label = "mb-1.5 block text-xs text-muted";
const ghost = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50";

/** Post form: metadata, cover upload, an MDX body with inline image upload, draft / published. */
export function PostEditor({ initial, action }: { initial: PostDraft; action: (state: PostState, data: FormData) => Promise<PostState> }) {
  const [state, submit, pending] = useActionState(action, null);
  const [slug, setSlug] = useState(initial.slug);
  const [cover, setCover] = useState(initial.cover);
  const [body, setBody] = useState(initial.body);
  const [busy, setBusy] = useState<"cover" | "inline" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [inlineNote, setInlineNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [locale, setLocale] = useState(initial.locale);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Submitting by hand keeps what was typed: a `<form action>` resets its fields after every run.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => submit(data));
  }

  const compressedNote = (image: UploadedImage) =>
    image.compressed ? `已自动压缩：${formatBytes(image.compressed.from)} → ${formatBytes(image.compressed.to)}。` : "";

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy("cover");
    setUploadError("");
    setCoverNote("");
    try {
      const image = await uploadImage(file, "blog", `${slug || "post"}-cover`);
      setCover(image.url);
      setCoverNote(compressedNote(image));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "上传失败。");
    } finally {
      setBusy(null);
    }
  }

  /** Uploads images one by one and inserts a `<BlogImage>` tag for each at the caret. */
  async function insertImages(files: File[]) {
    const images = files.filter(isImageFile);
    if (images.length === 0) {
      setInlineNote({ ok: false, text: "只支持 WebP、PNG、JPG、AVIF 和 GIF 图片。" });
      return;
    }
    if (busy) return;
    setBusy("inline");
    let at = bodyRef.current?.selectionStart ?? body.length;
    const notes: string[] = [];
    let failed = "";
    for (let index = 0; index < images.length; index++) {
      setInlineNote({ ok: true, text: `正在上传第 ${index + 1} / ${images.length} 张…` });
      try {
        const image = await uploadImage(images[index], "blog", `${slug || "post"}-inline`);
        const tag = `\n<BlogImage\n  src="${image.url}"\n  alt="图片描述"\n  caption="图注"\n  width="${image.width}"\n  height="${image.height}"\n/>\n`;
        const position = at;
        setBody((text) => text.slice(0, position) + tag + text.slice(position));
        at += tag.length;
        if (image.compressed) notes.push(compressedNote(image));
      } catch (error) {
        failed = error instanceof Error ? error.message : "上传失败。";
        break;
      }
    }
    setBusy(null);
    setInlineNote(
      failed
        ? { ok: false, text: failed }
        : { ok: true, text: [`已插入 ${images.length} 张图片，记得把图片描述和图注改成实际内容。`, ...notes].join(" ") },
    );
  }

  function onDrop(event: DragEvent<HTMLTextAreaElement>) {
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    event.preventDefault();
    void insertImages(files);
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.files).filter(isImageFile);
    if (files.length === 0) return;
    event.preventDefault();
    void insertImages(files);
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <label className={label} htmlFor="post-title">标题</label>
          <input id="post-title" name="title" required defaultValue={initial.title} className={`${field} h-12 font-display text-lg`} />
        </div>
        <div>
          <label className={label} htmlFor="post-description">摘要（显示在列表和搜索结果里）</label>
          <textarea id="post-description" name="description" rows={2} defaultValue={initial.description} className={`${field} h-auto py-2.5 leading-6`} />
        </div>
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs text-muted" htmlFor="post-body">正文（MDX，支持 Markdown 和代码块）</label>
            <label className={ghost}>
              <ImagePlus className="h-3.5 w-3.5" aria-hidden />
              {busy === "inline" ? "上传中…" : "在光标处插入图片"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={busy !== null}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  if (files.length > 0) void insertImages(files);
                }}
              />
            </label>
          </div>
          <AiAssist
            postId={initial.id}
            locale={locale}
            body={body}
            getSelection={() => ({ start: bodyRef.current?.selectionStart ?? 0, end: bodyRef.current?.selectionEnd ?? 0 })}
            getMeta={() => {
              const data = new FormData(formRef.current ?? undefined);
              return {
                title: String(data.get("title") ?? ""),
                description: String(data.get("description") ?? ""),
                coverAlt: String(data.get("cover_alt") ?? ""),
                tags: String(data.get("tags") ?? "").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
              };
            }}
            onReplace={(start, end, text) => setBody((current) => current.slice(0, start) + text + current.slice(end))}
          />
          <textarea
            id="post-body"
            ref={bodyRef}
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onDragOver={(event) => {
              if (!event.dataTransfer.types.includes("Files")) return;
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onPaste={onPaste}
            spellCheck={false}
            className={`min-h-[34rem] w-full resize-y rounded-[10px] border bg-transparent p-4 font-mono text-[13px] leading-6 outline-none focus:border-accent ${
              dragging ? "border-accent bg-accent-soft" : "border-line-strong"
            }`}
          />
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[11px] text-muted">可以把图片拖进正文，或直接粘贴截图；超过 5 MB 的图片会自动压缩。</p>
            <p className="font-mono text-[10px] text-muted">{body.length.toLocaleString("zh-CN")} 字符</p>
          </div>
          {inlineNote && (
            <p role={inlineNote.ok ? "status" : "alert"} className={`mt-1.5 text-sm leading-6 ${inlineNote.ok ? "text-muted" : "text-accent"}`}>
              {inlineNote.text}
            </p>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="surface-panel flex flex-col gap-4 bg-bg-elevated p-5">
          <div>
            <label className={label} htmlFor="post-status">状态</label>
            <select id="post-status" name="status" defaultValue={initial.status} className={field}>
              <option value="draft">草稿（不公开）</option>
              <option value="published">已发布</option>
            </select>
          </div>
          <button type="submit" disabled={pending || busy !== null} className={buttonClasses({ className: "w-full" })}>
            {pending ? "保存中…" : "保存"}
          </button>
          {state && (
            <p role={state.ok ? "status" : "alert"} className={`text-sm leading-6 ${state.ok ? "text-muted" : "text-accent"}`}>
              {state.message}
            </p>
          )}
        </div>

        <div className="surface-panel flex flex-col gap-4 bg-bg-elevated p-5">
          <div>
            <label className={label} htmlFor="post-slug">网址标识</label>
            <input id="post-slug" name="slug" required value={slug} onChange={(event) => setSlug(event.target.value)} className={`${field} font-mono`} placeholder="my-new-post" />
            <p className="mt-1 font-mono text-[10px] text-muted">/blog/{slug || "…"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} htmlFor="post-locale">语言</label>
              <select id="post-locale" name="locale" value={locale} onChange={(event) => setLocale(event.target.value as PostDraft["locale"])} className={field}>
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="post-date">日期</label>
              <input id="post-date" name="date" type="date" required defaultValue={initial.date} className={field} />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="post-tags">标签（用逗号分隔）</label>
            <input id="post-tags" name="tags" defaultValue={initial.tags.join("，")} className={field} placeholder="AI 编程，实践" />
          </div>
          <div>
            <label className={label} htmlFor="post-hue">色相（0–360，用于无封面时的配色）</label>
            <input id="post-hue" name="hue" type="number" min={0} max={360} defaultValue={initial.hue} className={`${field} font-mono`} />
          </div>
        </div>

        <div className="surface-panel flex flex-col gap-4 bg-bg-elevated p-5">
          <p className="text-xs leading-5 text-muted">内容备注：只作为记录保存，不显示在网站上。可以留空。</p>
          <div>
            <label className={label} htmlFor="post-content-status">内容状态（status）</label>
            <input id="post-content-status" name="content_status" list="post-content-statuses" defaultValue={initial.contentStatus} className={`${field} font-mono text-xs`} placeholder="evergreen" />
            <datalist id="post-content-statuses">
              {CONTENT_STATUSES.map((value) => <option key={value} value={value} />)}
            </datalist>
          </div>
          <div>
            <label className={label} htmlFor="post-verification">验证情况（verification）</label>
            <input id="post-verification" name="verification" list="post-verifications" defaultValue={initial.verification} className={`${field} font-mono text-xs`} placeholder="personal-experience-not-benchmarked" />
            <datalist id="post-verifications">
              {VERIFICATIONS.map((value) => <option key={value} value={value} />)}
            </datalist>
          </div>
        </div>

        <div className="surface-panel flex flex-col gap-4 bg-bg-elevated p-5">
          <p className="text-xs text-muted">封面图（建议 1536 × 1024）</p>
          {cover ? (
            <Image src={cover} alt="" width={640} height={427} className="aspect-[3/2] w-full rounded-lg border border-line object-cover" />
          ) : (
            <div className="grid aspect-[3/2] place-items-center rounded-lg border border-dashed border-line-strong text-xs text-muted">还没有封面</div>
          )}
          <label className={`${ghost} justify-center`}>
            <Upload className="h-3.5 w-3.5" aria-hidden />
            {busy === "cover" ? "上传中…" : "上传封面"}
            <input type="file" accept="image/*" className="sr-only" disabled={busy !== null} onChange={uploadCover} />
          </label>
          <div>
            <label className={label} htmlFor="post-cover">封面地址</label>
            <input id="post-cover" name="cover" value={cover} onChange={(event) => setCover(event.target.value)} className={`${field} font-mono text-xs`} placeholder="/images/blog/xxx.webp" />
          </div>
          <div>
            <label className={label} htmlFor="post-cover-alt">封面描述（给读屏和搜索引擎）</label>
            <input id="post-cover-alt" name="cover_alt" defaultValue={initial.cover_alt} className={field} />
          </div>
          {coverNote && <p role="status" className="text-xs leading-5 text-muted">{coverNote}</p>}
          {uploadError && <p role="alert" className="text-sm text-accent">{uploadError}</p>}
        </div>
      </aside>
    </form>
  );
}
