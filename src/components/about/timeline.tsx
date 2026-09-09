import { GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import type { EducationEntry, ExperienceEntry } from "@/data/timeline";
import { pick } from "@/data/types";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

export function EducationCards({
  entries,
  locale,
  classOfLabel,
}: {
  entries: EducationEntry[];
  locale: string;
  classOfLabel: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((e, i) => (
        <Reveal key={e.id} delay={i * 0.1} className="h-full">
            <article className="relative flex h-full flex-col gap-6 rounded-2xl border border-line bg-bg-elevated p-6 sm:p-8">
              <div className="relative flex items-start justify-between gap-4">
                <div
                  className={cn(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-white",
                    e.logoFit === "wordmark" && "w-28",
                  )}
                >
                  <Image
                    src={e.logo}
                    alt=""
                    fill
                    sizes={e.logoFit === "wordmark" ? "112px" : "56px"}
                    className={cn(
                      "object-contain p-2",
                      e.logoFit !== "contain" && "object-cover p-0",
                    )}
                  />
                </div>
                {e.classOf && <Tag tone="accent">{classOfLabel.replace("{year}", e.classOf)}</Tag>}
              </div>
              <div className="relative">
                <p className="eyebrow mb-2">{pick(e.period, locale)}</p>
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                  {pick(e.school, locale)}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-fg/85">
                  {e.degree && <>{pick(e.degree, locale)} · </>}
                  <span className="font-serif italic text-accent">{pick(e.field, locale)}</span>
                </p>
              </div>
              {(e.focus.length > 0 || e.location) && (
                <ul className="relative mt-auto flex flex-col gap-2.5 border-t border-line pt-5 text-sm leading-relaxed text-muted">
                  {e.focus.map((f) => (
                    <li key={f.en} className="flex items-start gap-2">
                      <GraduationCap className="mt-1 h-3.5 w-3.5 shrink-0 text-muted" />
                      {pick(f, locale)}
                    </li>
                  ))}
                  {e.location && (
                    <li className="mt-2 flex items-center gap-2 text-xs">
                      <MapPin className="h-3.5 w-3.5" />
                      {pick(e.location, locale)}
                    </li>
                  )}
                </ul>
              )}
            </article>
        </Reveal>
      ))}
    </div>
  );
}

export function ExperienceTimeline({
  entries,
  locale,
}: {
  entries: ExperienceEntry[];
  locale: string;
}) {
  return (
    <ol className="flex flex-col">
      {entries.map((e, i) => (
        <Reveal key={e.id} as="li" delay={i * 0.08} className="border-t border-line py-8 first:pt-0 first:border-t-0 last:pb-0 sm:py-10">
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
                {pick(e.period, locale)}
              </p>
              <p className="mt-2 text-sm text-muted">{pick(e.org, locale)}</p>
            </div>
            <div className="lg:col-span-9">
              <h3 className="font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {pick(e.title, locale)}
              </h3>
              <p className="mt-3 max-w-[44rem] text-[15px] leading-[1.85] text-fg/85">{pick(e.summary, locale)}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {e.bullets.map((b) => (
                  <li key={b.en} className="flex gap-3 text-sm leading-[1.8] text-muted">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                    {pick(b, locale)}
                  </li>
                ))}
              </ul>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {e.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-md bg-accent-soft/50 px-2 py-1 font-mono text-[10px] text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
