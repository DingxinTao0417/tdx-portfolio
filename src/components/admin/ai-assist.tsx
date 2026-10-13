"use client";

import { Languages, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { saveTranslation } from "@/app/admin/(panel)/posts/actions";
import { buttonClasses } from "@/components/ui/button";

type Locale = "zh" | "en";
type Meta = { title: string; description: string; coverAlt: string; tags: string[] };
type Job =
  | { kind: "polish"; start: number; end: number; source: string; whole: boolean }
  | { kind: "translate"; to: Locale; meta: Meta | null };

const names: Record<Locale, string> = { zh: "中文", en: "English" };
const ERROR_MARK = "\u0000ERROR:";
const ghost = "inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50";
const field = "h-11 w-full rounded-[10px] border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-accent";

async function post(payload: unknown, signal: AbortSignal) {
  const response = await fetch("/admin/api/ai", {
    method: "POST",
    signal,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detail?.error ?? `请求失败（${response.status}）`);
  }
  return response;
}

/**
 * AI polishing and translation for the post body. Nothing is applied automatically: the result
 * streams into a review box where it can be edited, then accepted or discarded.
 */
export function AiAssist({
  postId,
  locale,
  body,
  getSelection,
  getMeta,
  onReplace,
}: {
  postId?: string;
  locale: Locale;
  body: string;
  /** Current selection in the body textarea. */
  getSelection: () => { start: number; end: number };
  getMeta: () => Meta;
  onReplace: (start: number, end: number, text: string) => void;
}) {
  const router = useRouter();
  const abort = useRef<AbortController | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"running" | "done" | "error">("done");
  const [message, setMessage] = useState("");
  const [existing, setExisting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const other: Locale = locale === "zh" ? "en" : "zh";

  async function run(next: Job, payload: unknown, metaPayload?: unknown) {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setJob(next);
    setOutput("");
    setMessage("");
    setExisting(null);
    setStatus("running");
    try {
      const metaRequest = metaPayload
        ? post(metaPayload, controller.signal).then((response) => response.json() as Promise<Meta>)
        : null;
      const response = await post(payload, controller.signal);
      const reader = response.body?.getReader();
      if (!reader) throw new Error("没有收到内容。");
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const failed = text.indexOf(ERROR_MARK);
        if (failed !== -1) throw new Error(text.slice(failed + ERROR_MARK.length) || "生成失败。");
        setOutput(text);
      }
      if (metaRequest) {
        const meta = await metaRequest;
        setJob((current) => (current?.kind === "translate" ? { ...current, meta } : current));
      }
      setStatus("done");
    } catch (error) {
      if (controller.signal.aborted) {
        setStatus("done");
        setMessage("已停止，下面是已经生成的部分。");
        return;
      }
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "生成失败。");
    }
  }

  function polish() {
    const { start, end } = getSelection();
    const whole = start === end;
    const source = whole ? body : body.slice(start, end);
    if (!source.trim()) {
      setJob(null);
      setMessage("正文还是空的，没有可以润色的内容。");
      return;
    }
    void run(
      { kind: "polish", start: whole ? 0 : start, end: whole ? body.length : end, source, whole },
      { task: "polish", language: locale, text: source },
    );
  }

  function translate() {
    if (!body.trim()) {
      setJob(null);
      setMessage("正文还是空的，没有可以翻译的内容。");
      return;
    }
    void run(
      { kind: "translate", to: other, meta: null },
      { task: "translate", from: locale, to: other, text: body },
      { task: "translate-meta", from: locale, to: other, meta: getMeta() },
    );
  }

  function close() {
    abort.current?.abort();
    setJob(null);
    setOutput("");
    setMessage("");
    setExisting(null);
  }

  function applyPolish() {
    if (job?.kind !== "polish") return;
    if (body.slice(job.start, job.end) !== job.source) {
      setMessage("正文在润色期间被改动过，没有替换。请重新润色。");
      return;
    }
    onReplace(job.start, job.end, job.whole ? output.trim() + "\n" : output.trim());
    close();
  }

  async function saveDraft() {
    if (job?.kind !== "translate" || !postId || !job.meta) return;
    setSaving(true);
    setMessage("");
    const result = await saveTranslation({
      sourceId: postId,
      locale: job.to,
      title: job.meta.title,
      description: job.meta.description.slice(0, 400),
      tags: job.meta.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
      cover_alt: job.meta.coverAlt.slice(0, 300),
      body: output.trim() + "\n",
    });
    setSaving(false);
    if (result.ok) {
      router.push(`/admin/posts/${result.id}?created=1`);
      return;
    }
    setMessage(result.message);
    setExisting(result.existingId ?? null);
  }

  const running = status === "running";

  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={ghost} disabled={running} onClick={polish}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          AI 润色（选中部分或全文）
        </button>
        <button
          type="button"
          className={ghost}
          disabled={running || !postId}
          title={postId ? undefined : "先保存文章，再翻译"}
          onClick={translate}
        >
          <Languages className="h-3.5 w-3.5" aria-hidden />
          AI 翻译为{names[other]}
        </button>
        {!postId && <span className="text-xs text-muted">先保存文章后才能翻译</span>}
      </div>

      {!job && message && <p role="alert" className="mt-2 text-sm text-accent">{message}</p>}

      {job && (
        <section aria-label="AI 结果" className="mt-3 rounded-[10px] border border-accent/40 bg-accent-soft p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {job.kind === "polish"
                ? `AI 润色 · ${job.whole ? "全文" : "选中的部分"}（${job.source.length.toLocaleString("zh-CN")} 字符）`
                : `AI 翻译 · ${names[locale]} → ${names[job.to]}`}
            </p>
            <p className="font-mono text-[10px] text-muted" aria-live="polite">
              {running ? "生成中…" : status === "error" ? "失败" : "已完成，可以修改后再采用"}
            </p>
          </div>

          {job.kind === "translate" && job.meta && (
            <div className="mb-3">
              <label className="mb-1.5 block text-xs text-muted" htmlFor="ai-title">译文标题</label>
              <input
                id="ai-title"
                className={field}
                value={job.meta.title}
                // Enter here must not submit the surrounding post form.
                onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
                onChange={(event) => setJob({ ...job, meta: { ...job.meta!, title: event.target.value } })}
              />
            </div>
          )}

          {(status !== "error" || output) && <textarea
            aria-label="AI 生成的内容"
            value={output}
            readOnly={running}
            onChange={(event) => setOutput(event.target.value)}
            spellCheck={false}
            rows={14}
            className="w-full resize-y rounded-[10px] border border-line-strong bg-bg p-3 font-mono text-[13px] leading-6 outline-none focus:border-accent"
          />}

          {message && (
            <p role="alert" className="mt-2 text-sm text-accent">
              {message}
              {existing && (
                <Link href={`/admin/posts/${existing}`} className="ml-2 underline">打开已有的版本</Link>
              )}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {running ? (
              <button type="button" className={ghost} onClick={() => abort.current?.abort()}>
                <Square className="h-3 w-3" aria-hidden />
                停止
              </button>
            ) : (
              <>
                {job.kind === "polish" && status === "done" && output.trim() && (
                  <button type="button" className={buttonClasses({ size: "sm" })} onClick={applyPolish}>
                    替换{job.whole ? "全文" : "选中的部分"}
                  </button>
                )}
                {job.kind === "translate" && status === "done" && output.trim() && job.meta && (
                  <button type="button" className={buttonClasses({ size: "sm" })} disabled={saving} onClick={saveDraft}>
                    {saving ? "保存中…" : `保存为${names[job.to]}草稿`}
                  </button>
                )}
                <button type="button" className={ghost} onClick={close}>放弃</button>
              </>
            )}
            <span className="text-xs text-muted">
              {job.kind === "polish" ? "采用前不会改动正文。" : "译文会另存为一篇草稿，不会改动这篇文章。"}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
