import { BookOpen, CheckSquare, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Odometer } from "@/components/fx/odometer";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SplitText } from "@/components/fx/split-text";
import { SpotlightCard, SpotlightGroup } from "@/components/fx/spotlight";
import { FxTrigger } from "@/components/fx/trigger";
import { CourseIllustration } from "@/components/learn/course-illustration";
import { LearningRecord } from "@/components/learn/learning-record";
import { ModuleGrid } from "@/components/learn/module-grid";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { fdeCourse, fdeModules, getFdeCopy } from "@/data/fde";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";

export function generateStaticParams() { return routing.locales.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = getFdeCopy(locale);
  return { title: copy.title + " · " + copy.subtitle, description: copy.intro, alternates: { canonical: localizedPath(locale, "/learn/fde"), languages: languageAlternates("/learn/fde") }, openGraph: { images: [{ url: "/images/learn/fde-architecture-" + (locale === "en" ? "en" : "zh") + ".png", width: 1672, height: 941, alt: copy.project }] } };
}

export default async function FdeCoursePage() {
  const locale = await getLocale();
  const copy = getFdeCopy(locale);
  const fx = await getTranslations("FX.blog.learn");
  const stats = [
    { value: fdeModules.length, label: locale === "en" ? "modules" : "模块" },
    { value: fdeCourse.lesson_count, label: copy.lessons },
    { value: fdeCourse.question_counts.objective, label: copy.objective },
    { value: fdeCourse.question_counts.open_response, label: copy.cases },
  ];
  const steps = [
    { icon: BookOpen, title: copy.read, body: copy.readBody },
    { icon: CheckSquare, title: copy.practice, body: copy.practiceBody },
    { icon: Layers3, title: copy.review, body: copy.reviewBody },
  ];

  return <article className="min-w-0">
    <FxTrigger as="header" className="border-b border-line pb-7">
      <p className="eyebrow flex items-center gap-3 text-accent">
        <span aria-hidden="true" className="fx-line inline-block h-px w-6 bg-accent" />
        <ScrambleText text={copy.overview + " · " + copy.free} />
      </p>
      <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        <SplitText text={copy.title} delay={0.1} />
      </h1>
      <Reveal delay={0.2}><p className="mt-3 text-xl font-medium leading-8">{copy.subtitle}</p></Reveal>
      <Reveal delay={0.28}><p className="mt-4 max-w-3xl text-sm leading-8 text-muted">{copy.intro}</p></Reveal>
      <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2 font-mono text-xs leading-6 text-muted">
        {stats.map((stat, index) => (
          <span key={stat.label} className="flex items-baseline gap-1">
            <Odometer value={String(stat.value)} delay={0.2 + index * 0.1} className="text-sm text-fg" />
            {stat.label}
          </span>
        ))}
        <span>{copy.contentLanguage}</span>
      </div>
      <ButtonLink href="/learn/fde/01-01" arrow className="mt-6">{copy.start}</ButtonLink>
      {copy.languageNotice && <p className="mt-4 rounded-xl bg-accent-soft p-4 text-xs leading-7">{copy.languageNotice}</p>}
    </FxTrigger>
    <CourseIllustration locale={locale} eager />
    <SpotlightGroup className="mt-8 grid gap-6 sm:grid-cols-2">
      {[{ title: copy.audience, body: copy.audienceBody }, { title: copy.project, body: copy.projectBody }].map((item) => (
        <SpotlightCard key={item.title} className="rounded-xl border border-line bg-bg-elevated p-5">
          <h2 className="flex items-center gap-2.5 text-sm font-semibold">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
            {item.title}
          </h2>
          <p className="mt-3 text-sm leading-8 text-muted">{item.body}</p>
        </SpotlightCard>
      ))}
    </SpotlightGroup>
    <FxTrigger className="relative mt-6 bg-accent-soft px-5 py-4">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 origin-top bg-accent transition-none delay-100 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[fx-state=idle]/fx:scale-y-0 group-data-[fx-state=play]/fx:transition-transform" />
      <h2 className="text-xs font-semibold text-accent">{copy.boundary}</h2>
      <p className="mt-2 text-xs leading-7 text-muted">{copy.boundaryBody}</p>
    </FxTrigger>
    <section className="mt-10 border-t border-line pt-7">
      <h2 className="font-display text-xl font-semibold tracking-tight">{copy.syllabus}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{copy.syllabusBody}</p>
      <FxTrigger className="relative mt-5 grid gap-5 sm:grid-cols-3">
        <span aria-hidden="true" className="fx-line absolute inset-x-0 top-0 h-px bg-line" />
        {steps.map(({ icon: Icon, title, body }, index) => (
          <div key={title} className="relative py-5">
            <span aria-hidden="true" style={{ transitionDelay: `${0.2 + index * 0.15}s` }} className="absolute left-0 top-0 h-px w-10 origin-left bg-accent transition-none duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[fx-state=idle]/fx:scale-x-0 group-data-[fx-state=play]/fx:transition-transform" />
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-accent" />
              <span aria-hidden="true" className="font-mono text-[10px] text-muted">0{index + 1}</span>
            </div>
            <h3 className="mt-3 text-sm font-medium">{title}</h3>
            <p className="mt-2 text-xs leading-7 text-muted">{body}</p>
          </div>
        ))}
      </FxTrigger>
    </section>
    <section className="mt-10 border-t border-line pt-7">
      <h2 className="font-display text-xl font-semibold tracking-tight">{fx("modules")}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{fx("modulesBody")}</p>
      <ModuleGrid />
    </section>
    <div className="mt-10"><LearningRecord locale={locale} /></div>
  </article>;
}
