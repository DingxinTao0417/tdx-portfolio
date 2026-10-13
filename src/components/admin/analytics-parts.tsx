import type { Analytics } from "@/lib/analytics";

const number = new Intl.NumberFormat("zh-CN");

export function StatTile({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="surface-panel bg-bg-elevated p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">
        {typeof value === "number" ? number.format(value) : value}
      </p>
      {note && <p className="mt-1 font-mono text-[10px] text-muted">{note}</p>}
    </div>
  );
}

/** Daily page views as bars; each bar carries its exact figures for hover and screen readers. */
export function DailyChart({ daily }: { daily: Analytics["daily"] }) {
  const peak = Math.max(1, ...daily.map((d) => d.views));
  const label = new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" });
  const first = daily[0];
  const last = daily.at(-1);
  return (
    <figure className="surface-panel bg-bg-elevated p-5 sm:p-6">
      <figcaption className="mb-5 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-display font-semibold">每日访问量</span>
        <span className="font-mono text-[10px] text-muted">峰值 {number.format(peak)}</span>
      </figcaption>
      <ol className="flex h-44 items-end gap-[3px]" aria-label="每日访问量">
        {daily.map((d) => {
          const text = `${label.format(new Date(d.day))}：${d.views} 次访问，${d.visitors} 位访客`;
          return (
            <li key={d.day} className="group relative flex h-full min-w-0 flex-1 items-end" title={text}>
              <span
                className="w-full rounded-t-[3px] bg-accent/75 transition-colors group-hover:bg-accent"
                style={{ height: `${Math.max(d.views > 0 ? 3 : 1, (d.views / peak) * 100)}%`, opacity: d.views > 0 ? 1 : 0.25 }}
              />
              <span className="sr-only">{text}</span>
            </li>
          );
        })}
      </ol>
      {first && last && (
        <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
          <span>{label.format(new Date(first.day))}</span>
          <span>{label.format(new Date(last.day))}</span>
        </div>
      )}
    </figure>
  );
}

export function RankList({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const peak = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="surface-panel bg-bg-elevated p-5 sm:p-6">
      <h2 className="mb-4 font-display text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li key={row.label} className="relative overflow-hidden rounded-md">
              <span className="absolute inset-y-0 left-0 rounded-md bg-accent-soft" style={{ width: `${(row.value / peak) * 100}%` }} aria-hidden />
              <span className="relative flex items-center justify-between gap-4 px-2.5 py-1.5 text-sm">
                <span className="min-w-0 truncate font-mono text-xs">{row.label}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted">{number.format(row.value)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
