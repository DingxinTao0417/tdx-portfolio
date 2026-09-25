import { ArrowDownWideNarrow } from "lucide-react";
import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Odometer } from "@/components/fx/odometer";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SpotlightCard } from "@/components/fx/spotlight";
import { FxTrigger } from "@/components/fx/trigger";
import styles from "@/components/home/data/usage.module.css";
import { formatAITokens, rankedAIUsage, totalAITokens } from "@/data/ai-usage";
import { cn } from "@/lib/utils";

const RING_R = 92;
/** Gap between arcs, in percent of the circumference. */
const ARC_GAP = 0.8;
const tones = ["var(--accent)", "color-mix(in oklab, var(--fg) 55%, transparent)", "color-mix(in oklab, var(--fg) 35%, transparent)"];
const bars = ["bg-accent", "bg-fg/55", "bg-fg/35"];

const arcs = rankedAIUsage.map((entry, index) => {
  const start = rankedAIUsage.slice(0, index).reduce((sum, previous) => sum + previous.share, 0) * 100;
  const length = Math.max(0, entry.share * 100 - ARC_GAP);
  return { id: entry.id, dash: `${length} ${100 - length}`, offset: -(start + ARC_GAP / 2), tone: tones[Math.min(index, 2)] };
});

const ticks = Array.from({ length: 60 }, (_, index) => {
  const angle = (index / 60) * Math.PI * 2;
  const inner = index % 5 === 0 ? 103 : 107;
  const point = (r: number) => [120 + Math.sin(angle) * r, 120 - Math.cos(angle) * r].map((n) => Number(n.toFixed(2)));
  const [x1, y1] = point(inner);
  const [x2, y2] = point(113);
  return { x1, y1, x2, y2, major: index % 5 === 0 };
});

/** Self-reported totals, kept separate from GitHub's live contribution data. */
export async function AIUsagePanel() {
  const locale = await getLocale();
  const t = await getTranslations("Home.aiUsage");
  const percent = new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const formatTokens = (tokens: number) => formatAITokens(tokens, locale);

  return (
    <section id="ai-usage" aria-labelledby="ai-usage-title" className="container-x scroll-mt-28 pb-16 md:pb-24">
      <FxTrigger amount={0.25} className={styles.panel}>
        <SpotlightCard className="overflow-hidden rounded-2xl border border-line bg-bg-elevated/60 [--fx-spot-glow:36rem]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.65fr] lg:gap-10 lg:p-10">
            <div className="flex flex-col border-b border-line pb-7 lg:border-r lg:border-b-0 lg:pr-10 lg:pb-0">
              <p className="mb-3 flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                <ScrambleText text="AI / USAGE" />
              </p>
              <h2 id="ai-usage-title" className="font-display text-2xl font-semibold tracking-tight">{t("title")}</h2>

              <div className="relative mx-auto mt-8 aspect-square w-full max-w-60">
                <span aria-hidden className="dot-grid pointer-events-none absolute -inset-6 opacity-60 [mask-image:radial-gradient(closest-side,#000_40%,transparent)]" />
                <svg aria-hidden viewBox="0 0 240 240" className="absolute inset-0 h-full w-full">
                  {ticks.map(({ major, ...line }, index) => (
                    <line key={index} {...line} strokeWidth={1} className={major ? "stroke-line-strong" : "stroke-line"} />
                  ))}
                  <circle cx={120} cy={120} r={RING_R} fill="none" strokeWidth={12} className="stroke-fg/[0.06]" />
                </svg>
                <svg aria-hidden viewBox="0 0 240 240" className={cn("absolute inset-0 h-full w-full", styles.arcs)}>
                  <g transform="rotate(-90 120 120)">
                    {arcs.map((arc, index) => (
                      <circle
                        key={arc.id}
                        data-i={index}
                        cx={120}
                        cy={120}
                        r={RING_R}
                        fill="none"
                        pathLength={100}
                        strokeWidth={12}
                        strokeDasharray={arc.dash}
                        strokeDashoffset={arc.offset}
                        className={styles.arc}
                        style={{ stroke: arc.tone }}
                      />
                    ))}
                  </g>
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div className={cn("flex flex-col items-center", styles.readout, styles.total)}>
                    <Odometer
                      value={formatTokens(totalAITokens)}
                      delay={0.3}
                      className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"
                    />
                    <span className="mt-1 font-mono text-[10px] tracking-[0.18em] text-muted">TOKENS</span>
                  </div>
                  {rankedAIUsage.map((entry, index) => (
                    <div
                      key={entry.id}
                      aria-hidden
                      data-i={index}
                      className={cn("flex flex-col items-center justify-center", styles.readout, styles.entry)}
                    >
                      <span className="font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">{percent.format(entry.share)}</span>
                      <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-muted">{t("total")}</p>
            </div>

            <div className="min-w-0">
              <div className="mb-6 flex items-center justify-between gap-4 text-xs text-muted">
                <span className="flex items-center gap-2"><ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden />{t("ranking")}</span>
                <span>{t("share")}</span>
              </div>
              <ol className="space-y-7" aria-label={t("ranking")}>
                {rankedAIUsage.map((entry, index) => (
                  <li
                    key={entry.id}
                    data-i={index}
                    className={cn("group", styles.row)}
                    style={{ "--i": index } as CSSProperties}
                  >
                    <div className="mb-3 flex items-baseline justify-between gap-4">
                      <div className="flex min-w-0 items-baseline gap-3">
                        <span className="font-mono text-[10px] text-muted/70 transition-colors duration-300 group-hover:text-accent" aria-hidden>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 self-center rounded-full transition-[scale] duration-300 group-hover:scale-150"
                          style={{ background: tones[Math.min(index, 2)] }}
                        />
                        <span className="font-display text-base font-semibold transition-[translate] duration-500 ease-(--fx-ease) group-hover:translate-x-1 sm:text-lg">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-baseline gap-3 font-mono tabular-nums sm:gap-5">
                        <Odometer value={formatTokens(entry.tokens)} delay={0.45 + index * 0.12} className="text-sm font-medium sm:text-base" />
                        <Odometer
                          value={percent.format(entry.share)}
                          delay={0.55 + index * 0.12}
                          className="inline-block w-[5ch] text-right text-[11px] text-muted"
                        />
                      </div>
                    </div>
                    <div
                      role="meter"
                      aria-label={`${entry.name} Tokens`}
                      aria-valuemin={0}
                      aria-valuemax={totalAITokens}
                      aria-valuenow={entry.tokens}
                      aria-valuetext={t("value", { amount: formatTokens(entry.tokens), share: percent.format(entry.share) })}
                      className={cn("h-2.5 overflow-hidden rounded-full bg-fg/[0.06]", styles.track)}
                    >
                      <div className={styles.fill} data-lead={index === 0 ? "" : undefined} style={{ width: `${entry.share * 100}%` }}>
                        <div className={cn(bars[Math.min(index, 2)], styles.bar)} />
                        <span className={styles.sheen} />
                        <span className={styles.gleam} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div aria-hidden className="mt-3 flex justify-between font-mono text-[9px] text-muted/70">
                {["0", "25", "50", "75", "100%"].map((mark) => (
                  <span key={mark}>{mark}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="border-t border-line px-6 py-4 text-xs leading-relaxed text-muted sm:px-8 lg:px-10">{t("source")}</p>
        </SpotlightCard>
      </FxTrigger>
    </section>
  );
}
