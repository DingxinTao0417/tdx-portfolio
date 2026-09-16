import { ArrowRight, BookOpen, CheckSquare, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
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
  return <div className="container-x pb-20 pt-32 sm:pt-40">
    <header className="max-w-2xl"><p className="eyebrow flex items-center gap-3"><span className="h-px w-7 bg-accent" />{copy.homeEyebrow}</p><h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{copy.learning}</h1><p className="mt-5 text-base leading-8 text-muted">{copy.homeBody}</p></header>
    <article className="mt-10 rounded-3xl border border-line bg-bg-elevated p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow text-accent">{copy.free}</p>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight">{copy.title}</h2>
          <p className="mt-3 text-xl font-medium leading-8">{copy.subtitle}</p>
          <p className="mt-4 text-sm leading-8 text-muted">{copy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted"><span>{fdeCourse.lesson_count} {copy.lessons}</span><span>{fdeCourse.question_counts.objective} {copy.objective}</span><span>{fdeCourse.question_counts.open_response} {copy.cases}</span></div>
          <p className="mt-3 text-xs text-muted">{copy.contentLanguage} · {copy.edition}</p>
        </div>
        <ButtonLink href="/learn/fde" className="shrink-0 self-start md:self-center">{copy.open}<ArrowRight className="h-4 w-4" /></ButtonLink>
      </div>
    </article>
    <section className="mt-10 grid gap-5 sm:grid-cols-3" aria-label={copy.syllabus}>
      {[{ icon: BookOpen, title: copy.read, body: copy.readBody }, { icon: CheckSquare, title: copy.practice, body: copy.practiceBody }, { icon: Layers3, title: copy.review, body: copy.reviewBody }].map(({ icon: Icon, title, body }) => <div key={title} className="border-t border-line py-6"><Icon className="h-5 w-5 text-accent" /><h2 className="mt-4 text-base font-medium">{title}</h2><p className="mt-2 text-sm leading-7 text-muted">{body}</p></div>)}
    </section>
    <p className="mt-5 max-w-3xl text-xs leading-7 text-muted">{copy.boundaryBody}</p>
  </div>;
}
