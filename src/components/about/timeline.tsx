import { GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import type { EducationEntry, ExperienceEntry } from "@/data/timeline";
import { pick } from "@/data/types";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { TiltCard } from "@/components/ui/tilt-card";
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
    <div className="relative grid gap-6 md:grid-cols-2">
      {/* Trajectory connector (desktop) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-24 -translate-x-1/2 bg-gradient-to-r from-accent/0 via-accent to-accent/0 md:block"
      />
      {entries.map((e, i) => (
        <Reveal key={e.id} delay={i * 0.1} className="h-full">
          <TiltCard className="h-full rounded-3xl" max={5}>
            <article className="hud-corners relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-line bg-bg-elevated p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
                style={{ background: `oklch(65% 0.2 ${e.hue})` }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div
                  className={cn(
                    "relative h-14 w-14 overflow-hidden rounded-2xl border border-line bg-white shadow-sm",
                  )}
                >
                  <Image
                    src={e.logo}
                    alt=""
                    fill
                    sizes="56px"
                    className={cn(
                      "object-contain p-2",
                      e.logoFit === "cover" && "object-cover p-0",
                    )}
                  />
                </div>
                <Tag tone="accent">{classOfLabel.replace("{year}", e.classOf)}</Tag>
              </div>
              <div className="relative">
                <p className="eyebrow mb-2">{pick(e.period, locale)}</p>
                <h3 className="font-display text-2xl font-semibold tracking-tight">
                  {pick(e.school, locale)}
                </h3>
                <p className="mt-2 text-lg text-fg/85">
                  {pick(e.degree, locale)} ·{" "}
                  <span className="font-serif italic text-accent">{pick(e.field, locale)}</span>
                </p>
              </div>
              <ul className="relative mt-auto flex flex-col gap-2 border-t border-line pt-5 text-sm text-muted">
                {e.focus.map((f) => (
                  <li key={f.en} className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-accent" />
                    {pick(f, locale)}
                  </li>
                ))}
                <li className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                  <MapPin className="h-3.5 w-3.5" />
                  {pick(e.location, locale)}
                </li>
              </ul>
            </article>
          </TiltCard>
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
    <ol className="relative flex flex-col gap-12 border-l border-line pl-8 sm:pl-12">
      {entries.map((e, i) => (
        <Reveal key={e.id} as="li" delay={i * 0.08} className="relative">
          <span className="absolute -left-[calc(2rem+5px)] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg sm:-left-[calc(3rem+5px)]" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                {pick(e.period, locale)}
              </p>
              <p className="mt-2 text-sm text-muted">{pick(e.org, locale)}</p>
            </div>
            <div className="lg:col-span-9">
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {pick(e.title, locale)}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-fg/85">{pick(e.summary, locale)}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {e.bullets.map((b) => (
                  <li key={b.en} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-2 h-1 w-3 shrink-0 rounded-full bg-accent/70" />
                    {pick(b, locale)}
                  </li>
                ))}
              </ul>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {e.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
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
