"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Project, ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

type Filter = "all" | ProjectCategory;
const allFilters: Filter[] = ["all", "ai", "fullstack", "data", "fde"];

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const t = useTranslations("Projects");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const reducedMotion = useReducedMotion();

  const filters = allFilters.filter(
    (f) => f === "all" || projects.some((p) => p.category === f),
  );
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <LayoutGroup id="project-filters">
          <div
            role="group"
            aria-label={t("filters.all")}
            className="flex flex-wrap items-center gap-1"
          >
            {filters.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  aria-pressed={active}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "relative h-10 rounded-lg px-4 text-sm transition-colors",
                    active ? "text-bg" : "text-muted hover:text-fg",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={reducedMotion ? undefined : "filter-pill"}
                      className="absolute inset-0 rounded-lg bg-fg"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{t(`filters.${f}`)}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <p aria-live="polite" className="font-mono text-xs text-muted">
          {t("count", { count: visible.length })}
        </p>
      </div>

      <motion.ul layout={!reducedMotion} className="mt-8 grid gap-5 sm:gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <motion.li
              key={project.slug}
              layout={!reducedMotion}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn("h-full", i === 0 && "md:col-span-2")}
            >
              <ProjectCard
                project={project}
                locale={locale}
                categoryLabel={t(`filters.${project.category}`)}
                ctaLabel={tc("viewProject")}
                size={i === 0 ? "lg" : "md"}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && <p className="mt-16 text-center text-muted">{t("empty")}</p>}
    </div>
  );
}
