import type { Metadata } from "next";
import Link from "next/link";
import { DailyChart, RankList, StatTile } from "@/components/admin/analytics-parts";
import { AdminPageTitle } from "@/components/admin/page-title";
import { ANALYTICS_RANGES, type Analytics } from "@/lib/analytics";
import { requireAdmin } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "访问数据" };

const devices: Record<string, string> = { desktop: "桌面", mobile: "手机", tablet: "平板" };
const locales: Record<string, string> = { zh: "中文", en: "English" };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { supabase } = await requireAdmin();
  const requested = Number((await searchParams).days);
  const days = ANALYTICS_RANGES.find((d) => d === requested) ?? 30;
  const { data, error } = await supabase.rpc("admin_analytics", { p_days: days });
  const stats = data as Analytics | null;

  return (
    <>
      <AdminPageTitle
        eyebrow="Analytics"
        title="访问数据"
        body="站内自建统计：只记录访问的页面、来源网站、国家或地区和设备类型，不保存 IP 地址。"
      >
        <div className="flex gap-2" role="group" aria-label="时间范围">
          {ANALYTICS_RANGES.map((d) => (
            <Link
              key={d}
              href={`/admin/analytics?days=${d}`}
              aria-current={d === days ? "true" : undefined}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors",
                d === days ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-fg",
              )}
            >
              近 {d} 天
            </Link>
          ))}
        </div>
      </AdminPageTitle>

      {(error || !stats) && (
        <p role="alert" className="surface-panel p-5 text-sm text-accent">
          读取访问数据失败{error ? `：${error.message}` : ""}
        </p>
      )}

      {stats && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile label={`近 ${days} 天访问量`} value={stats.views} note="页面浏览次数" />
            <StatTile label={`近 ${days} 天访客`} value={stats.visitors} note="按浏览器标签页会话去重" />
            <StatTile label="今日访问量" value={stats.today} note="按 UTC 日期计算" />
          </div>
          <DailyChart daily={stats.daily} />
          <div className="grid gap-5 lg:grid-cols-2">
            <RankList title="热门页面" rows={stats.paths.map((p) => ({ label: p.path, value: p.views }))} empty="这段时间还没有访问记录。" />
            <RankList
              title="来源网站"
              rows={stats.referrers.map((r) => ({ label: r.host === "direct" ? "直接访问" : r.host, value: r.views }))}
              empty="暂无来源数据。"
            />
            <RankList
              title="国家或地区"
              rows={stats.countries.map((c) => ({ label: c.country === "??" ? "未知" : c.country, value: c.views }))}
              empty="暂无地区数据。"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <RankList title="设备" rows={stats.devices.map((d) => ({ label: devices[d.device] ?? d.device, value: d.views }))} empty="暂无设备数据。" />
              <RankList title="语言版本" rows={stats.locales.map((l) => ({ label: locales[l.locale] ?? "未知", value: l.views }))} empty="暂无语言数据。" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
