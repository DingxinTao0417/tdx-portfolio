"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
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

  const filters = allFilters.filter(
    (f) => f === "all" || projects.some((p) => p.category === f),
  );
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="mt-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <LayoutGroup id="project-filters">
          <div
            role="tablist"
            aria-label={t("filters.all")}
            className="flex flex-wrap items-center gap-1 rounded-full border border-line bg-surface p-1"
          >
            {filters.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "relative h-9 rounded-full px-4 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                    active ? "text-white" : "text-muted hover:text-fg",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{t(`filters.${f}`)}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {t("count", { count: visible.length })}
        </p>
      </div>

      <motion.ul layout className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <ProjectCard
                project={project}
                locale={locale}
                categoryLabel={t(`filters.${project.category}`)}
                ctaLabel={tc("viewProject")}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && <p className="mt-16 text-center text-muted">{t("empty")}</p>}
    </div>
  );
}
