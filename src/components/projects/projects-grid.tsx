"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, type Variants } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode, type Ref } from "react";
import { useHydrated } from "@/components/fx/hooks";
import { useIntroDone } from "@/components/fx/intro-store";
import { Odometer } from "@/components/fx/odometer";
import { SpotlightGroup } from "@/components/fx/spotlight";
import { TextRoll } from "@/components/fx/text-roll";
import type { Project, ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils";
import { pad } from "./gallery-utils";
import { ProjectIndexList } from "./project-index-list";
import { ProjectPreviewCard, type CardVariant } from "./project-preview-card";

type Filter = "all" | ProjectCategory;
type View = "grid" | "list";
const allFilters: Filter[] = ["all", "ai", "fullstack", "data", "fde"];
const views: { id: View; Icon: typeof LayoutGrid }[] = [
  { id: "grid", Icon: LayoutGrid },
  { id: "list", Icon: Rows3 },
];
const ease = [0.16, 1, 0.3, 1] as const;

// Kept across client-side navigations (back from a case study) without affecting SSR output.
const memory: { filter: Filter; view: View } = { filter: "all", view: "grid" };

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 56, clipPath: "inset(14% 0% 0% 0% round 1.5rem)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
    transition: { duration: 0.95, ease, delay: (i % 2) * 0.09 },
    transitionEnd: { clipPath: "none" },
  }),
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.28, ease: [0.5, 0, 0.75, 0] } },
};

/** Lead card on "all"; a trailing odd card spans the row instead of leaving a gap. */
function variantFor(index: number, count: number, lead: boolean): CardVariant {
  if (lead && index === 0) return "lead";
  const rest = lead ? count - 1 : count;
  return rest % 2 === 1 && index === count - 1 ? "wide" : "default";
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const t = useTranslations("Projects");
  const tc = useTranslations("Common");
  const tf = useTranslations("FX.projects");
  const tCursor = useTranslations("FX.common.cursor");
  const locale = useLocale();
  const hydrated = useHydrated();
  const [filter, setFilter] = useState<Filter>(() => memory.filter);
  const [view, setView] = useState<View>(() => memory.view);
  const [touched, setTouched] = useState(false);
  // Mounted by a client-side navigation (already hydrated): the first cards start at rest, so a
  // cover morphing back from a case study lands on a visible card instead of a hidden one.
  const arrival = hydrated && !touched;

  useEffect(() => {
    memory.filter = filter;
    memory.view = view;
  }, [filter, view]);

  function choose(next: Filter) {
    setTouched(true);
    setFilter(next);
  }

  function switchView(next: View) {
    setTouched(true);
    setView(next);
  }

  const filters = allFilters.filter((f) => f === "all" || projects.some((p) => p.category === f));
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const withLead = filter === "all" && visible.length > 1;
  const categories = Object.fromEntries(filters.map((f) => [f, t(`filters.${f}`)]));

  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex flex-col gap-3 border-y border-line py-3 lg:flex-row lg:items-center lg:justify-between">
        <LayoutGroup id="project-filters">
          <div role="group" aria-label={tf("filterLabel")} className="flex flex-wrap items-center gap-1">
            {filters.map((f) => {
              const active = f === filter;
              const count = f === "all" ? projects.length : projects.filter((p) => p.category === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(f)}
                  className={cn(
                    "fx-roll-host relative isolate inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm transition-colors",
                    active ? "text-bg" : "text-muted hover:text-fg",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-fg"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <TextRoll>{t(`filters.${f}`)}</TextRoll>
                  <span aria-hidden="true" className="-mt-2 font-mono text-[9px] tabular-nums opacity-60">
                    {pad(count)}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="flex items-center justify-between gap-4 lg:gap-6">
          <p className="font-mono text-xs uppercase tracking-[.14em] text-muted">
            <span aria-hidden="true" className="inline-flex items-baseline gap-2">
              <Odometer key={visible.length} value={pad(visible.length)} trigger="mount" duration={0.9} className="text-fg" />
              {tf("unit", { count: visible.length })}
            </span>
            <span className="sr-only" aria-live="polite">
              {t("count", { count: visible.length })}
            </span>
          </p>
          <LayoutGroup id="project-view">
            <div role="group" aria-label={tf("layout")} className="flex items-center rounded-full border border-line">
              {views.map(({ id, Icon }) => {
                const active = view === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => switchView(id)}
                    className={cn(
                      "relative isolate inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs transition-colors",
                      active ? "text-accent" : "text-muted hover:text-fg",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="view-pill"
                        className="absolute inset-0 -z-10 rounded-full border border-accent/40 bg-accent-soft"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    <span className="max-sm:sr-only">{tf(id)}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {view === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
          >
            <SpotlightGroup as="ul" className="relative mt-8 grid gap-5 sm:gap-6 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {visible.map((project, i) => {
                  const variant = variantFor(i, visible.length, withLead);
                  return (
                    <ProjectCell key={project.slug} index={i} variant={variant} instant={arrival}>
                      <ProjectPreviewCard
                        project={project}
                        locale={locale}
                        category={t(`filters.${project.category}`)}
                        cta={tc("viewProject")}
                        featuredLabel={t("featuredCase")}
                        screensLabel={tf("screens", {
                          count: (project.cover ? 1 : 0) + (project.gallery?.length ?? 0),
                        })}
                        cursorLabel={tCursor("view")}
                        variant={variant}
                      />
                    </ProjectCell>
                  );
                })}
              </AnimatePresence>
            </SpotlightGroup>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease }}
          >
            <ProjectIndexList
              projects={visible}
              locale={locale}
              categories={categories}
              columns={{
                index: tc("index"),
                project: tf("columns.project"),
                category: tf("columns.category"),
                year: tc("year"),
              }}
              cursorLabel={tCursor("view")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {visible.length === 0 && <p className="mt-16 text-center text-muted">{t("empty")}</p>}
    </div>
  );
}

/**
 * Grid slot: reveals once in view (after the intro), FLIPs to new positions on filter changes and
 * cross-fades its card when the layout variant changes. `instant` cells mount at rest.
 */
function ProjectCell({
  ref,
  index,
  variant,
  instant,
  children,
}: {
  ref?: Ref<HTMLLIElement>;
  index: number;
  variant: CardVariant;
  instant: boolean;
  children: ReactNode;
}) {
  const introDone = useIntroDone();
  const [seen, setSeen] = useState(false);
  const [atRest] = useState(instant);
  return (
    <motion.li
      ref={ref}
      layout="position"
      custom={index}
      variants={cellVariants}
      initial={atRest ? false : "hidden"}
      animate={atRest || (introDone && seen) ? "visible" : "hidden"}
      exit="exit"
      viewport={{ once: true, amount: 0.15 }}
      onViewportEnter={() => setSeen(true)}
      transition={{ layout: { duration: 0.7, ease } }}
      data-reveal
      className={cn("h-full min-w-0", variant !== "default" && "md:col-span-2")}
    >
      <motion.div
        key={variant}
        className="h-full"
        initial={instant ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease }}
        data-reveal
      >
        {children}
      </motion.div>
    </motion.li>
  );
}
