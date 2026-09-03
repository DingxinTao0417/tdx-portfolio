"use client";

import { motion, useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { palettes } from "@/components/three/palette";
import type { SphereItem } from "@/components/three/tech-sphere";
import { TechIcon } from "@/components/ui/tech-icon";
import { levelValue, type SkillCategory, type SkillLevel } from "@/data/skills";
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

  const items: SphereItem[] = Array.from(
    new Map(
      categories
        .flatMap((c) =>
          c.skills.map((s) => ({ name: s.name, category: c.id, weight: levelValue[s.level] })),
        )
        .map((s) => [s.name, s] as const),
    ).values(),
  );

  const palette = palettes[resolvedTheme === "dark" ? "dark" : "light"];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
      {/* Category selector */}
      <div className="flex flex-col gap-2 lg:col-span-4">
        <p className="eyebrow mb-3">{t("categories")}</p>
        <button
          type="button"
          onClick={() => setActive(null)}
          className={cn(
            "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
            active === null
              ? "border-accent bg-accent-soft text-fg"
              : "border-line text-muted hover:border-line-strong hover:text-fg",
          )}
        >
          <span className="font-medium">{t("all")}</span>
          <span className="font-mono text-xs">{items.length}</span>
        </button>
        {categories.map((c) => {
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onMouseEnter={() => setActive(c.id)}
              onFocus={() => setActive(c.id)}
              onClick={() => setActive(isActive ? null : c.id)}
              className={cn(
                "group flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                isActive
                  ? "border-accent bg-accent-soft text-fg"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                  style={{ background: categoryColors[c.id] }}
                />
                <span className="font-medium">{pick(c.title, locale)}</span>
              </span>
              <span className="font-mono text-xs">{c.skills.length}</span>
            </button>
          );
        })}
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {t("sphereHint")}
        </p>
      </div>

      {/* Sphere */}
      <div
        ref={wrapper}
        className="relative aspect-square w-full lg:col-span-8 lg:aspect-[5/4]"
        onMouseLeave={() => setActive(null)}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[60%] w-[60%] rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_70%)] blur-3xl opacity-60" />
        </div>
        <TechSphere
          items={items}
          palette={palette}
          activeCategory={active}
          categoryColors={categoryColors}
          reduced={reduced}
          active={inView}
        />
      </div>
    </div>
  );
}

export function SkillMatrix({ categories }: { categories: SkillCategory[] }) {
  const t = useTranslations("Skills");
  const locale = useLocale();
  const levels: SkillLevel[] = ["expert", "advanced", "proficient", "familiar"];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {categories.map((c, ci) => (
        <motion.section
          key={c.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: (ci % 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="hud-corners rounded-3xl border border-line bg-bg-elevated p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {pick(c.title, locale)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pick(c.blurb, locale)}</p>
            </div>
            <span
              className="mt-1 h-3 w-3 shrink-0 rounded-full"
              style={{ background: categoryColors[c.id] }}
            />
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {c.skills.map((s, i) => (
              <li key={s.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <TechIcon icon={s.icon} name={s.name} size={18} className="text-fg/75" />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      {t(`levels.${s.level}`)}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-line">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: categoryColors[c.id] }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${levelValue[s.level] * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
                <span className="w-6 text-right font-mono text-[10px] text-muted">
                  {levels.indexOf(s.level) === 0 ? "★" : ""}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>
      ))}
    </div>
  );
}
