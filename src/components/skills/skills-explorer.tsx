"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { palettes } from "@/components/three/palette";
import type { SphereItem } from "@/components/three/tech-sphere";
import { TechIcon } from "@/components/ui/tech-icon";
import { getSkillName, levelValue, type SkillCategory } from "@/data/skills";
import { pick } from "@/data/types";
import { cn } from "@/lib/utils";

const TechSphere = dynamic(() => import("@/components/three/tech-sphere"), {
  ssr: false,
  loading: () => null,
});

const categoryColors: Record<string, string> = {
  ai: "#ff5a1f",
  frontend: "#ffb020",
  backend: "#0ea5b7",
  data: "#8b5cf6",
  cloud: "#22c55e",
  fde: "#ec4899",
};

export function SkillsExplorer({ categories }: { categories: SkillCategory[] }) {
  const t = useTranslations("Skills");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapper, { amount: 0.1 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    const id = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(id);
      media.removeEventListener("change", update);
    };
  }, []);

  const items = useMemo<SphereItem[]>(
    () =>
      Array.from(
        new Map(
          categories
            .flatMap((c) =>
              c.skills.map((s) => ({ name: getSkillName(s, locale), category: c.id, weight: levelValue[s.level] })),
            )
            .map((s) => [s.name, s] as const),
        ).values(),
      ),
    [categories, locale],
  );

  const palette = palettes[resolvedTheme === "dark" ? "dark" : "light"];
  const preview = hovered ?? active;

  return (
    <div className="surface-panel grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-8">
      {/* Category selector */}
      <div className="min-w-0 lg:col-span-4" onMouseLeave={() => setHovered(null)}>
        <p className="eyebrow mb-5">{t("categories")}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 lg:grid-cols-1">
        <button
          type="button"
          onClick={() => setActive(null)}
          onMouseEnter={() => setHovered(null)}
          onFocus={() => setHovered(null)}
          aria-pressed={active === null}
          className={cn(
            "flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
            preview === null
              ? "bg-accent-soft text-accent"
              : "text-muted hover:bg-bg hover:text-fg",
          )}
        >
          <span className="font-medium">{t("all")}</span>
          <span className="font-mono text-[11px] tabular-nums">{String(items.length).padStart(2, "0")}</span>
        </button>
        {categories.map((c) => {
          const isActive = preview === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onMouseEnter={() => setHovered(c.id)}
              onFocus={() => setHovered(c.id)}
              onBlur={() => setHovered(null)}
              onClick={() => {
                setHovered(null);
                setActive(active === c.id ? null : c.id);
              }}
              aria-pressed={active === c.id}
              className={cn(
                "group flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-bg hover:text-fg",
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="hidden h-1.5 w-1.5 shrink-0 rounded-full opacity-70 sm:block"
                  style={{ background: categoryColors[c.id] }}
                />
                <span className="font-medium">{pick(c.title, locale)}</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums">{String(c.skills.length).padStart(2, "0")}</span>
            </button>
          );
        })}
        </div>
        <p className="mt-5 flex items-center gap-2 border-t border-line pt-5 text-xs leading-relaxed text-muted">
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {t("sphereHint")}
        </p>
      </div>

      {/* Sphere */}
      <div
        ref={wrapper}
        className="relative aspect-square w-full min-w-0 max-h-[32rem] overflow-hidden lg:col-span-8 lg:aspect-[5/4]"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[60%] w-[60%] rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_70%)] blur-3xl opacity-20" />
        </div>
        <TechSphere
          items={items}
          palette={palette}
          activeCategory={preview}
          categoryColors={categoryColors}
          reduced={reduced}
          active={inView}
        />
      </div>
    </div>
  );
}

export function SkillMatrix({ categories }: { categories: SkillCategory[] }) {
  const locale = useLocale();
  const reduced = useReducedMotion();

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
      {categories.map((c, ci) => (
        <motion.section
          key={c.id}
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: (ci % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-line bg-bg-elevated p-5 sm:p-7"
        >
          <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-accent">{String(ci + 1).padStart(2, "0")}</p>
              <h3 className="font-display text-xl font-semibold tracking-tight">
                {pick(c.title, locale)}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-[1.75] text-muted">{pick(c.blurb, locale)}</p>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-muted">{String(c.skills.length).padStart(2, "0")}</span>
          </div>

          <ul className="mt-2 flex flex-col divide-y divide-line/60">
            {c.skills.map((s) => {
              const name = getSkillName(s, locale);
              return (
                <li key={s.name} className="flex min-h-10 items-center gap-3 py-2">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <TechIcon icon={s.icon} name={name} size={16} className="shrink-0 text-muted" />
                    <span className="text-[13px] font-medium leading-relaxed sm:text-sm">{name}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.section>
      ))}
    </div>
  );
}
