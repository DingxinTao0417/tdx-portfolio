import { ArrowDownWideNarrow } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { formatAITokens, rankedAIUsage, totalAITokens } from "@/data/ai-usage";

/** Self-reported totals, kept separate from GitHub's live contribution data. */
export async function AIUsagePanel() {
  const locale = await getLocale();
  const t = await getTranslations("Home.aiUsage");
  const percent = new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const formatTokens = (tokens: number) => formatAITokens(tokens, locale);

  return (
    <section id="ai-usage" aria-labelledby="ai-usage-title" className="container-x scroll-mt-28 pb-16 md:pb-24">
      <div className="overflow-hidden rounded-2xl border border-line bg-bg-elevated/60">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.65fr] lg:gap-10 lg:p-10">
          <div className="flex flex-col border-b border-line pb-7 lg:border-r lg:border-b-0 lg:pr-10 lg:pb-0">
            <p className="mb-3 flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              AI / USAGE
            </p>
            <h2 id="ai-usage-title" className="font-display text-2xl font-semibold tracking-tight">{t("title")}</h2>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">{formatTokens(totalAITokens)}</span>
              <span className="font-mono text-xs text-muted">TOKENS</span>
            </div>
            <p className="mt-2 text-sm text-muted">{t("total")}</p>
          </div>

          <div className="min-w-0">
            <div className="mb-6 flex items-center justify-between gap-4 text-xs text-muted">
              <span className="flex items-center gap-2"><ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden />{t("ranking")}</span>
              <span>{t("share")}</span>
            </div>
            <ol className="space-y-7" aria-label={t("ranking")}>
              {rankedAIUsage.map((entry, index) => (
                <li key={entry.id}>
                  <div className="mb-3 flex items-baseline justify-between gap-4">
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="font-mono text-[10px] text-muted/70" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-display text-base font-semibold sm:text-lg">{entry.name}</span>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-3 font-mono tabular-nums sm:gap-5">
                      <span className="text-sm font-medium sm:text-base">{formatTokens(entry.tokens)}</span>
                      <span className="w-[5ch] text-right text-[11px] text-muted">{percent.format(entry.share)}</span>
                    </div>
                  </div>
                  <div
                    role="meter"
                    aria-label={`${entry.name} Tokens`}
                    aria-valuemin={0}
                    aria-valuemax={totalAITokens}
                    aria-valuenow={entry.tokens}
                    aria-valuetext={t("value", { amount: formatTokens(entry.tokens), share: percent.format(entry.share) })}
                    className="h-2.5 overflow-hidden rounded-full bg-fg/[0.06]"
                  >
                    <div
                      className={`h-full rounded-full ${index === 0 ? "bg-accent" : index === 1 ? "bg-fg/55" : "bg-fg/35"}`}
                      style={{ width: `${entry.share * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="border-t border-line px-6 py-4 text-xs leading-relaxed text-muted sm:px-8 lg:px-10">{t("source")}</p>
      </div>
    </section>
  );
}
