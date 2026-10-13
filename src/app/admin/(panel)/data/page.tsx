import type { Metadata } from "next";
import { AiSettingsForm } from "@/components/admin/ai-settings-form";
import { AdminPageTitle } from "@/components/admin/page-title";
import { UsageEditor } from "@/components/admin/usage-editor";
import { aiUsageEntries } from "@/data/ai-usage";
import { AI_SETTINGS_KEY, resolveAiSettings } from "@/lib/ai-settings";
import { requireAdmin } from "@/lib/supabase/admin";
import { AI_USAGE_KEY, aiUsageSchema } from "@/lib/site-data";
import { saveAiSettings, saveAIUsage } from "./actions";

export const metadata: Metadata = { title: "站点数据" };

export default async function SiteDataPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, ai] = await Promise.all([
    supabase.from("site_data").select("value, updated_at").eq("key", AI_USAGE_KEY).maybeSingle(),
    supabase.from("site_data").select("value").eq("key", AI_SETTINGS_KEY).maybeSingle(),
  ]);
  const stored = aiUsageSchema.safeParse(data?.value);
  const entries = stored.success ? stored.data : [...aiUsageEntries];
  const time = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <AdminPageTitle eyebrow="Site data" title="站点数据" body="改完保存后直接生效，不需要重新部署。" />
      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">AI 用量</h2>
          <p className="font-mono text-xs text-muted">
            {stored.success && data?.updated_at
              ? `上次保存：${time.format(new Date(data.updated_at as string))}`
              : "还没有在后台保存过，当前显示的是代码里的默认值"}
          </p>
        </div>
        <UsageEditor initial={entries} action={saveAIUsage} />
        <p className="mt-3 text-xs leading-6 text-muted">这些数字显示在首页的 AI 用量面板。排名和占比会自动计算。</p>
      </section>

      <section className="mt-12">
        <h2 className="mb-1 font-display text-lg font-semibold">AI 写作</h2>
        <p className="mb-4 text-xs leading-6 text-muted">文章编辑器里的翻译和润色使用这里的模型。密钥在环境变量 DEEPSEEK_API_KEY 里，不在这里填。</p>
        <AiSettingsForm initial={resolveAiSettings(ai.data?.value)} action={saveAiSettings} />
      </section>
    </>
  );
}
