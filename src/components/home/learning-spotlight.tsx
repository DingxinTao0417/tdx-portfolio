import { BookOpen } from "lucide-react";
import type { CSSProperties } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { BorderBeam } from "@/components/fx/border-beam";
import { Odometer } from "@/components/fx/odometer";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SplitText } from "@/components/fx/split-text";
import { FxTrigger } from "@/components/fx/trigger";
import { ArrowSwap } from "@/components/home/data/arrow-swap";
import styles from "@/components/home/data/learning.module.css";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { fdeCourse, fdeLessons, fdeModules, getFdeCopy } from "@/data/fde";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const EXAMPLES = ["01-01", "04-03", "05-03"];
const courseMap = fdeModules.map((module) => fdeLessons.filter((lesson) => lesson.moduleId === module.id));
const mapRows = Math.max(...courseMap.map((lessons) => lessons.length));

export async function LearningSpotlight() {
  const locale = await getLocale();
  const fx = await getTranslations("FX.home");
  const cursor = await getTranslations("FX.common.cursor");
  const copy = getFdeCopy(locale);
  const examples = EXAMPLES.map((slug) => fdeLessons.find((lesson) => lesson.slug === slug)!);

  return (
    <section className="container-x section-space border-t border-line">
      <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
        <SectionHeading eyebrow={copy.homeEyebrow} title={copy.homeTitle} accent={copy.homeAccent} />
        <ButtonLink href="/learn" variant="secondary" arrow>{copy.learning}</ButtonLink>
      </div>
      <FxTrigger
        as="article"
        amount={0.25}
        className={cn("relative mt-10 grid rounded-2xl border border-line bg-bg-elevated lg:grid-cols-2", styles.card)}
      >
        <BorderBeam duration={9} size={90} />
        <div className="p-6 sm:p-8">
          <p className="eyebrow flex items-center gap-2 text-accent">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            <ScrambleText text={copy.free} />
          </p>
          <SplitText as="h3" text={copy.title} delay={0.1} className="mt-4 text-2xl font-semibold tracking-tight" />
          <p className="mt-3 max-w-xl text-sm leading-8 text-muted">{copy.homeBody}</p>
          <p className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
            <span className="flex flex-col gap-1">
              <Odometer value={String(fdeCourse.lesson_count)} delay={0.2} className="font-display text-4xl font-semibold tracking-tight text-fg" />
              <span className="font-mono text-xs text-muted">{copy.lessons}</span>
            </span>
            <span className="flex flex-col gap-1">
              <Odometer value={String(fdeCourse.question_counts.objective)} delay={0.3} className="font-display text-4xl font-semibold tracking-tight text-fg" />
              <span className="font-mono text-xs text-muted">{copy.objective}</span>
            </span>
            <span className="mb-0.5 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">{copy.contentLanguage}</span>
          </p>
          <ButtonLink href="/learn/fde" arrow className="mt-7">{copy.open}</ButtonLink>
        </div>
        <div className="border-t border-line p-6 sm:p-8 lg:border-t-0 lg:border-l">
          <div aria-hidden className="flex flex-wrap items-end justify-between gap-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {fx("learningMap")}
              <span className="mt-1 block text-fg">
                {courseMap.length} × {mapRows}
              </span>
            </p>
            <div className="flex gap-1.5">
              {courseMap.map((lessons, column) => (
                <div key={column} className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-[9px] text-muted/70">{String(column + 1).padStart(2, "0")}</span>
                  {lessons.map((lesson, row) => {
                    const pick = EXAMPLES.indexOf(lesson.slug);
                    return (
                      <span
                        key={lesson.id}
                        className={styles.mapCell}
                        data-pick={pick >= 0 ? "" : undefined}
                        data-x={pick >= 0 ? pick : undefined}
                        style={{ "--d": column + row } as CSSProperties}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="eyebrow mt-8 text-muted">
            <ScrambleText text={copy.practice} />
          </p>
          <ul className="mt-4 divide-y divide-line">
            {examples.map((lesson, index) => (
              <li key={lesson.id}>
                <Link
                  href={"/learn/fde/" + lesson.slug}
                  data-x={index}
                  data-cursor-text={cursor("open")}
                  style={{ "--i": index } as CSSProperties}
                  className={cn(
                    "group relative flex min-h-12 items-center gap-4 py-3 text-xs leading-6 text-muted transition-colors duration-300 hover:text-accent",
                    styles.lesson,
                  )}
                >
                  <span aria-hidden className="font-mono text-[10px] tabular-nums text-muted/70 transition-colors duration-300 group-hover:text-accent">
                    {lesson.slug.replace("-", "·")}
                  </span>
                  <span lang="zh-CN" className="min-w-0 flex-1 transition-[translate] duration-500 ease-(--fx-ease) group-hover:translate-x-1">
                    {lesson.title}
                  </span>
                  <ArrowSwap className="h-3.5 w-3.5" />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-[scale] duration-700 ease-(--fx-ease) group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </FxTrigger>
    </section>
  );
}
