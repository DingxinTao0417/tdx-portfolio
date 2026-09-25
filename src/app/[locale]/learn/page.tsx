import { BookOpen, CheckSquare, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { BorderBeam } from "@/components/fx/border-beam";
import { Odometer } from "@/components/fx/odometer";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SplitText } from "@/components/fx/split-text";
import { SpotlightCard } from "@/components/fx/spotlight";
import { FxTrigger } from "@/components/fx/trigger";
import { CourseTrack } from "@/components/learn/module-grid";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { fdeCourse, getFdeCopy } from "@/data/fde";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";

export function generateStaticParams() { return routing.locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = getFdeCopy(locale);
  return { title: copy.learning, description: copy.intro, alternates: { canonical: localizedPath(locale, "/learn"), languages: languageAlternates("/learn") } };
}

export default async function LearnPage() {
  const locale = await getLocale();
  const copy = getFdeCopy(locale);
  const stats = [
    { value: fdeCourse.lesson_count, label: copy.lessons },
    { value: fdeCourse.question_counts.objective, label: copy.objective },
    { value: fdeCourse.question_counts.open_response, label: copy.cases },
  ];
  const steps = [
    { icon: BookOpen, title: copy.read, body: copy.readBody },
    { icon: CheckSquare, title: copy.practice, body: copy.practiceBody },
    { icon: Layers3, title: copy.review, body: copy.reviewBody },
  ];

  return <>
    <PageHeader eyebrow={copy.homeEyebrow} title={copy.learning} body={copy.homeBody} watermark={copy.learning} />
    <div className="container-x pb-20 pt-6">
      <SpotlightCard as="article" className="rounded-3xl border border-line bg-bg-elevated p-5 sm:p-8 lg:p-10">
        <BorderBeam duration={9} size={80} />
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <FxTrigger className="max-w-2xl">
            <p className="eyebrow flex items-center gap-3 text-accent">
              <span aria-hidden="true" className="fx-line inline-block h-px w-6 bg-accent" />
              <ScrambleText text={copy.free} />
            </p>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              <SplitText text={copy.title} delay={0.1} />
            </h2>
            <p className="mt-3 text-xl font-medium leading-8">{copy.subtitle}</p>
            <p className="mt-4 text-sm leading-8 text-muted">{copy.intro}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-4 text-xs text-muted">
              {stats.map((stat, index) => (
                <span key={stat.label} className="flex items-baseline gap-1.5">
                  <Odometer value={String(stat.value)} delay={0.15 + index * 0.12} className="font-display text-2xl font-semibold text-fg" />
                  {stat.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">{copy.contentLanguage} · {copy.edition}</p>
          </FxTrigger>
          <ButtonLink href="/learn/fde" size="lg" arrow className="shrink-0 self-start md:self-end">{copy.open}</ButtonLink>
        </div>
        <div className="mt-8 border-t border-line pt-6">
          <CourseTrack />
        </div>
      </SpotlightCard>
      <FxTrigger as="section" aria-label={copy.syllabus} className="relative mt-12 grid gap-8 sm:grid-cols-3 sm:gap-5">
        <span aria-hidden="true" className="fx-line absolute inset-x-0 top-[1.375rem] hidden h-px bg-line-strong sm:block" />
        {steps.map(({ icon: Icon, title, body }, index) => (
          <div key={title} className="relative">
            <span
              style={{ transitionDelay: `${0.25 + index * 0.18}s` }}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-bg text-accent transition-none duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[fx-state=idle]/fx:scale-50 group-data-[fx-state=idle]/fx:opacity-0 group-data-[fx-state=play]/fx:border-accent/40 group-data-[fx-state=play]/fx:transition-[scale,opacity,border-color]"
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <p aria-hidden="true" className="mt-4 font-mono text-[10px] tracking-[0.16em] text-muted">0{index + 1}</p>
            <h2 className="mt-1 text-base font-medium">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{body}</p>
          </div>
        ))}
      </FxTrigger>
      <p className="mt-8 max-w-3xl text-xs leading-7 text-muted">{copy.boundaryBody}</p>
    </div>
  </>;
}
