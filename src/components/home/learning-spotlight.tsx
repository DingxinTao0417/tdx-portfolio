import { ArrowUpRight, BookOpen } from "lucide-react";
import { getLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { fdeCourse, fdeLessons, getFdeCopy } from "@/data/fde";
import { Link } from "@/i18n/navigation";

export async function LearningSpotlight() {
  const locale = await getLocale();
  const copy = getFdeCopy(locale);
  const examples = ["01-01", "04-03", "05-03"]
    .map((slug) => fdeLessons.find((lesson) => lesson.slug === slug)!);

  return (
    <section className="container-x section-space border-t border-line">
      <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
        <SectionHeading eyebrow={copy.homeEyebrow} title={copy.homeTitle} accent={copy.homeAccent} />
        <ButtonLink href="/learn" variant="secondary" arrow>{copy.learning}</ButtonLink>
      </div>
      <article className="mt-10 grid overflow-hidden rounded-2xl border border-line bg-bg-elevated lg:grid-cols-2">
        <div className="p-6 sm:p-8">
          <p className="eyebrow flex items-center gap-2 text-accent"><BookOpen className="h-3.5 w-3.5" />{copy.free}</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight">{copy.title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-8 text-muted">{copy.homeBody}</p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted">
            <span>{fdeCourse.lesson_count} {copy.lessons}</span>
            <span>{fdeCourse.question_counts.objective} {copy.objective}</span>
            <span>{copy.contentLanguage}</span>
          </p>
          <ButtonLink href="/learn/fde" arrow className="mt-6">{copy.open}</ButtonLink>
        </div>
        <div className="border-t border-line p-6 sm:p-8 lg:border-t-0 lg:border-l">
          <p className="eyebrow text-muted">{copy.practice}</p>
          <ul className="mt-4 divide-y divide-line">
            {examples.map((lesson) => (
              <li key={lesson.id}>
                <Link href={"/learn/fde/" + lesson.slug} className="group flex min-h-12 items-center justify-between gap-3 py-3 text-xs leading-6 text-muted hover:text-accent">
                  <span lang="zh-CN">{lesson.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
