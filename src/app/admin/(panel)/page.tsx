import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DailyChart, StatTile } from "@/components/admin/analytics-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import type { Analytics } from "@/lib/analytics";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminHome() {
  const { supabase, user } = await requireAdmin();
  const [unread, total, analytics, recent] = await Promise.all([
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.rpc("admin_analytics", { p_days: 14 }),
    supabase.from("messages").select("id, name, created_at, message").eq("status", "new").order("created_at", { ascending: false }).limit(3),
  ]);
  const stats = analytics.data as Analytics | null;
  const latest = (recent.data ?? []) as { id: string; name: string; created_at: string; message: string }[];
  const time = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <AdminPageTitle eyebrow="Overview" title={`你好，${user.login}`} body="网站的留言和访问情况一览。" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="未读留言" value={unread.count ?? 0} note={`共 ${total.count ?? 0} 条留言`} />
        <StatTile label="今日访问量" value={stats?.today ?? 0} />
        <StatTile label="近 14 天访问量" value={stats?.views ?? 0} />
        <StatTile label="近 14 天访客" value={stats?.visitors ?? 0} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {stats ? <DailyChart daily={stats.daily} /> : <p className="surface-panel p-5 text-sm text-muted">访问数据暂时读取不到。</p>}
        <section className="surface-panel bg-bg-elevated p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-sm font-semibold">最新未读留言</h2>
            <Link href="/admin/messages" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
              全部留言 <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-sm text-muted">没有未读留言。</p>
          ) : (
            <ul className="divide-y divide-line">
              {latest.map((m) => (
                <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold">{m.name}</span>
                    <time dateTime={m.created_at} className="shrink-0 font-mono text-[10px] text-muted">
                      {time.format(new Date(m.created_at))}
                    </time>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
