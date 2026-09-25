"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { SpotlightCard, SpotlightGroup } from "@/components/fx/spotlight";
import { FxTrigger } from "@/components/fx/trigger";
import { fdeLessons, fdeModuleOutputs, fdeModules } from "@/data/fde";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLearningRecord } from "./learning-record";

const lessonSlug = (path: string) => path.replace("lessons/", "").replace(".md", "");

/** Course modules as spotlight cards, each with a per-lesson read meter that fills when in view. */
export function ModuleGrid() {
  const t = useTranslations("FX.blog.learn");
  const record = useLearningRecord();
  return (
    <SpotlightGroup className="mt-6 grid gap-4 sm:grid-cols-2">
      {fdeModules.map((module, index) => {
        const read = module.lessons.filter((lesson) => record.read.includes(lesson.id)).length;
        const complete = read === module.lessons.length;
        return (
          <FxTrigger key={module.id} className="h-full">
            <Link href={"/learn/fde/" + lessonSlug(module.lessons[0].content_path)} className="group/mod block h-full rounded-2xl">
              <SpotlightCard className="flex h-full flex-col rounded-2xl border border-line bg-bg-elevated p-5 transition-[border-color,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/mod:-translate-y-1 group-hover/mod:border-accent/40 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span aria-hidden="true" className="fx-watermark text-outline text-5xl transition-colors duration-500 group-hover/mod:text-accent">
                    0{module.order}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {t("minutes", { minutes: module.estimated_minutes })}
                  </span>
                </div>
                <h3 lang="zh-CN" className="mt-5 text-base font-semibold leading-7">
                  <span className="sr-only">0{module.order} </span>
                  {module.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-muted">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{t("output")}</span>
                  {" · "}
                  <span lang="zh-CN">{fdeModuleOutputs[index]}</span>
                </p>
                <div className="mt-auto flex items-center gap-3 pt-6">
                  <div aria-hidden="true" className="flex flex-1 gap-1">
                    {module.lessons.map((lesson, i) => (
                      <span
                        key={lesson.id}
                        style={{ transitionDelay: `${200 + i * 90}ms` }}
                        className={cn(
                          "h-1.5 flex-1 rounded-full bg-line transition-colors duration-500",
                          record.read.includes(lesson.id) && "group-data-[fx-state=play]/fx:bg-accent",
                        )}
                      />
                    ))}
                  </div>
                  <span className={cn("font-mono text-[11px] tabular-nums", complete ? "text-accent" : "text-muted")}>
                    {t("readCount", { read, total: module.lessons.length })}
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-colors duration-300 group-hover/mod:border-accent group-hover/mod:bg-accent group-hover/mod:text-(--fx-on-accent)">
                    {complete ? (
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-500 group-hover/mod:rotate-45" />
                    )}
                  </span>
                </div>
              </SpotlightCard>
            </Link>
          </FxTrigger>
        );
      })}
    </SpotlightGroup>
  );
}

/** 8 modules × 4 lessons as a HUD strip: read lessons light up in order, then a scan sweeps across. */
export function CourseTrack() {
  const t = useTranslations("FX.blog.learn");
  const record = useLearningRecord();
  return (
    <FxTrigger className="relative overflow-hidden">
      <p className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span>{t("track")}</span>
        <span className="tabular-nums">{t("readCount", { read: record.read.length, total: fdeLessons.length })}</span>
      </p>
      <ol aria-hidden="true" className="mt-3 grid grid-cols-8 gap-1.5 sm:gap-2">
        {fdeModules.map((module, m) => (
          <li key={module.id} className="flex flex-col gap-1.5">
            <span className="flex gap-0.5">
              {module.lessons.map((lesson, l) => (
                <span
                  key={lesson.id}
                  style={{ transitionDelay: `${(m * module.lessons.length + l) * 35}ms` }}
                  className={cn(
                    "h-6 flex-1 rounded-[3px] bg-line transition-colors duration-500 sm:h-8",
                    record.read.includes(lesson.id) && "group-data-[fx-state=play]/fx:bg-accent",
                  )}
                />
              ))}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted">0{module.order}</span>
          </li>
        ))}
      </ol>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_16%,transparent),transparent)] transition-transform duration-[1.8s] ease-[cubic-bezier(0.76,0,0.24,1)] group-data-[fx-state=play]/fx:translate-x-[320%]"
      />
    </FxTrigger>
  );
}
