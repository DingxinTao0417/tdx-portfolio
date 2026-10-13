"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import type { SaveState } from "@/app/admin/(panel)/data/actions";
import { buttonClasses } from "@/components/ui/button";

type Row = { key: number; id: string; name: string; yi: string };
type Entry = { id: string; name: string; tokens: number };

const YI = 100_000_000;
const field = "h-11 w-full rounded-[10px] border border-line-strong bg-transparent px-3 text-sm outline-none focus:border-accent";

/** Edits the AI usage totals. Amounts are entered in 亿 (1e8 tokens), the unit the home page shows. */
export function UsageEditor({ initial, action }: { initial: Entry[]; action: (state: SaveState, data: FormData) => Promise<SaveState> }) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((entry, key) => ({ key, id: entry.id, name: entry.name, yi: String(entry.tokens / YI) })),
  );
  const [nextKey, setNextKey] = useState(initial.length);
  const [state, submit, pending] = useActionState(action, null);

  const entries = rows.map((row) => ({ id: row.id.trim(), name: row.name.trim(), tokens: Math.round(Number(row.yi) * YI) }));
  const total = entries.reduce((sum, entry) => sum + (Number.isFinite(entry.tokens) ? entry.tokens : 0), 0);
  const update = (key: number, patch: Partial<Row>) => setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return (
    <form action={submit} className="surface-panel bg-bg-elevated p-5 sm:p-6">
      <input type="hidden" name="entries" value={JSON.stringify(entries)} />
      <div className="hidden grid-cols-[1fr_1fr_9rem_2.75rem] gap-3 pb-2 text-xs text-muted sm:grid">
        <span>名称（显示在首页）</span>
        <span>标识（小写英文）</span>
        <span>累计用量（亿 token）</span>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.key} className="grid gap-3 sm:grid-cols-[1fr_1fr_9rem_2.75rem]">
            <input aria-label="名称" className={field} value={row.name} onChange={(e) => update(row.key, { name: e.target.value })} placeholder="Claude" />
            <input aria-label="标识" className={`${field} font-mono`} value={row.id} onChange={(e) => update(row.key, { id: e.target.value })} placeholder="claude" />
            <input
              aria-label="累计用量（亿 token）"
              className={`${field} font-mono tabular-nums`}
              inputMode="decimal"
              value={row.yi}
              onChange={(e) => update(row.key, { yi: e.target.value })}
              placeholder="57"
            />
            <button
              type="button"
              aria-label={`删除 ${row.name || "这一行"}`}
              disabled={rows.length <= 1}
              onClick={() => setRows((list) => list.filter((item) => item.key !== row.key))}
              className="grid h-11 w-11 place-items-center rounded-[10px] border border-line text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => {
            setRows((list) => [...list, { key: nextKey, id: "", name: "", yi: "0" }]);
            setNextKey((key) => key + 1);
          }}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent"
        >
          <Plus className="h-4 w-4" aria-hidden />
          添加一行
        </button>
        <p className="font-mono text-xs text-muted">
          合计 <span className="text-fg tabular-nums">{(total / YI).toLocaleString("zh-CN", { maximumFractionDigits: 1 })}</span> 亿 token
        </p>
        <button type="submit" disabled={pending} className={buttonClasses({})}>
          {pending ? "保存中…" : "保存"}
        </button>
      </div>
      {state && (
        <p role={state.ok ? "status" : "alert"} className={`mt-4 text-sm ${state.ok ? "text-muted" : "text-accent"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
