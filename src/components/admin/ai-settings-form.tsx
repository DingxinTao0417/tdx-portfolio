"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { SaveState } from "@/app/admin/(panel)/data/actions";
import { buttonClasses } from "@/components/ui/button";
import type { AiSettings } from "@/lib/ai-settings";

const field = "h-11 w-full rounded-[10px] border border-line-strong bg-transparent px-3 font-mono text-sm outline-none focus:border-accent";
const label = "mb-1.5 block text-xs text-muted";
const hint = "mt-1 text-[11px] leading-5 text-muted";

/** Model and limits used by the post editor's translate / polish tools. */
export function AiSettingsForm({ initial, action }: { initial: AiSettings; action: (state: SaveState, data: FormData) => Promise<SaveState> }) {
  const [state, submit, pending] = useActionState(action, null);

  // Submitting by hand keeps what was typed: a `<form action>` resets its fields after every run.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => submit(data));
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel bg-bg-elevated p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="ai-model">模型名</label>
          <input id="ai-model" name="model" required defaultValue={initial.model} className={field} placeholder="deepseek-flash" />
          <p className={hint}>按 DeepSeek 接口里的模型名填写。V4.1 Flash 是 deepseek-flash，V4 Pro 是 deepseek-v4-pro。</p>
        </div>
        <div>
          <label className={label} htmlFor="ai-chunk">每段最多字符数</label>
          <input id="ai-chunk" name="chunkChars" type="number" min={2000} max={200000} step={1000} required defaultValue={initial.chunkChars} className={field} />
          <p className={hint}>超过这个长度的文章会按二级标题分段发送。默认 200000，等于不分段。</p>
        </div>
        <div>
          <label className={label} htmlFor="ai-tokens">单次最多输出 token</label>
          <input id="ai-tokens" name="maxTokens" type="number" min={1024} max={393216} step={1024} required defaultValue={initial.maxTokens} className={field} />
          <p className={hint}>DeepSeek 接口允许的上限是 393216。</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-5">
        <button type="submit" disabled={pending} className={buttonClasses({})}>
          {pending ? "保存中…" : "保存"}
        </button>
        {state && (
          <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-muted" : "text-accent"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
