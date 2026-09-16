import { ArrowRight, BookOpen, CheckSquare, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { CourseIllustration } from "@/components/learn/course-illustration";
import { LearningRecord } from "@/components/learn/learning-record";
import { ButtonLink } from "@/components/ui/button";
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
  return <article className="min-w-0">
    <header className="border-b border-line pb-7">
      <p className="eyebrow text-accent">{copy.overview} · {copy.free}</p>
      <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{copy.title}</h1>
      <p className="mt-3 text-xl font-medium leading-8">{copy.subtitle}</p>
      <p className="mt-4 max-w-3xl text-sm leading-8 text-muted">{copy.intro}</p>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs leading-6 text-muted">
        <span>{fdeModules.length} {locale === "en" ? "modules" : "模块"}</span>
        <span>{fdeCourse.lesson_count} {copy.lessons}</span>
        <span>{fdeCourse.question_counts.objective} {copy.objective}</span>
        <span>{fdeCourse.question_counts.open_response} {copy.cases}</span>
        <span>{copy.contentLanguage}</span>
      </div>
      <ButtonLink href="/learn/fde/01-01" className="mt-6">{copy.start}<ArrowRight className="h-4 w-4" /></ButtonLink>
      {copy.languageNotice && <p className="mt-4 rounded-xl bg-accent-soft p-4 text-xs leading-7">{copy.languageNotice}</p>}
    </header>
    <CourseIllustration locale={locale} eager />
    <section className="mt-8 grid gap-6 sm:grid-cols-2">
      {[{ title: copy.audience, body: copy.audienceBody }, { title: copy.project, body: copy.projectBody }].map((item) => <div key={item.title} className="rounded-xl border border-line bg-bg-elevated p-5"><h2 className="text-sm font-semibold">{item.title}</h2><p className="mt-3 text-sm leading-8 text-muted">{item.body}</p></div>)}
    </section>
    <div className="mt-6 border-l-2 border-accent bg-accent-soft px-5 py-4"><h2 className="text-xs font-semibold text-accent">{copy.boundary}</h2><p className="mt-2 text-xs leading-7 text-muted">{copy.boundaryBody}</p></div>
    <section className="mt-10 border-t border-line pt-7">
      <h2 className="font-display text-xl font-semibold tracking-tight">{copy.syllabus}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{copy.syllabusBody}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {[{ icon: BookOpen, title: copy.read, body: copy.readBody }, { icon: CheckSquare, title: copy.practice, body: copy.practiceBody }, { icon: Layers3, title: copy.review, body: copy.reviewBody }].map(({ icon: Icon, title, body }) => <div key={title} className="border-t border-line py-5"><Icon className="h-4 w-4 text-accent" /><h3 className="mt-3 text-sm font-medium">{title}</h3><p className="mt-2 text-xs leading-7 text-muted">{body}</p></div>)}
      </div>
    </section>
    <div className="mt-7"><LearningRecord locale={locale} /></div>
  </article>;
}
