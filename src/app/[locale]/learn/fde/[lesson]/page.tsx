import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SplitText } from "@/components/fx/split-text";
import { SpotlightCard, SpotlightGroup } from "@/components/fx/spotlight";
import { FxTrigger } from "@/components/fx/trigger";
import { CourseIllustration } from "@/components/learn/course-illustration";
import { LessonReadButton } from "@/components/learn/learning-record";
import { LessonQuiz } from "@/components/learn/lesson-quiz";
import { ModuleCase } from "@/components/learn/module-case";
import { RelatedReading } from "@/components/learn/related-reading";
import { Reveal } from "@/components/ui/reveal";
import { fdeLessons, getFdeCopy } from "@/data/fde";
import { Link } from "@/i18n/navigation";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { getFdeCase, getFdeLesson, getFdeQuiz } from "@/lib/fde";
import { renderMdx } from "@/lib/mdx";

type Props = { params: Promise<{ locale: string; lesson: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => fdeLessons.map((lesson) => ({ locale, lesson: lesson.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, lesson: slug } = await params;
  const lesson = await getFdeLesson(slug);
  if (!lesson) return {};
  return { title: lesson.title + " · FDE 实战", description: lesson.learning_objective, alternates: { canonical: localizedPath(locale, "/learn/fde/" + slug), languages: languageAlternates("/learn/fde/" + slug) } };
}

export default async function FdeLessonPage({ params }: Props) {
  const { lesson: slug } = await params;
  const locale = await getLocale();
  const lesson = await getFdeLesson(slug);
  if (!lesson) notFound();
  const copy = getFdeCopy(locale);
  const fx = await getTranslations("FX.blog.learn");
  const index = fdeLessons.findIndex((item) => item.id === lesson.id);
  const previous = fdeLessons[index - 1];
  const next = fdeLessons[index + 1];
  const content = await renderMdx(lesson.content);
  const moduleCase = lesson.order === 4 ? getFdeCase(lesson.moduleId) : null;
  const neighbourCard = "flex h-full flex-col rounded-xl border border-line p-4 transition-[border-color] duration-300 group-hover/nb:border-accent/50";
  return <article className="min-w-0">
    <Link href="/learn/fde" className="group/back inline-flex min-h-11 items-center gap-2 text-xs text-muted hover:text-accent"><ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/back:-translate-x-1" />{copy.back}</Link>
    {/* Keyed: lessons share this layout, so each one replays its entrance. */}
    <FxTrigger key={lesson.id} as="header" className="mt-5 border-b border-line pb-7">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <ScrambleText text={lesson.moduleOrder + "." + lesson.order} className="font-mono text-accent" />
        <span lang="zh-CN">{lesson.moduleTitle}</span>
        {lesson.implementation_track === "optional_extension" && <span className="rounded-md bg-accent-soft px-2 py-1 text-accent">{copy.optional}</span>}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums">
          {fx("lessonOf", { current: index + 1, total: fdeLessons.length })} · {fx("minutes", { minutes: lesson.duration_minutes })}
        </span>
      </div>
      <span aria-hidden="true" className="fx-line mt-4 block h-px w-full bg-[linear-gradient(90deg,var(--accent),transparent)]" />
      <h1 lang="zh-CN" className="mt-4 font-display text-2xl font-semibold leading-[1.4] tracking-tight sm:text-3xl lg:text-4xl">
        <SplitText text={lesson.title} delay={0.1} stagger={0.03} />
      </h1>
      <Reveal delay={0.25}><p lang="zh-CN" className="mt-4 max-w-3xl text-sm leading-8 text-muted">{lesson.learning_objective}</p></Reveal>
      <p className="mt-4 text-[11px] leading-6 text-muted">{copy.contentLanguage} · {copy.edition}</p>
      {copy.languageNotice && <p className="mt-3 rounded-xl bg-accent-soft p-3 text-xs leading-6">{copy.languageNotice}</p>}
    </FxTrigger>
    {(lesson.moduleOrder === 1 && lesson.order === 1 || lesson.moduleOrder === 3 && lesson.order === 1) && <CourseIllustration locale={locale} eager />}
    {lesson.moduleOrder === 4 && lesson.order === 3 && <CourseIllustration locale={locale} kind="retrieval" eager />}
    {lesson.moduleOrder === 5 && lesson.order === 3 && <CourseIllustration locale={locale} kind="execution" eager />}
    <div lang="zh-CN" className="prose-tdx pfx-prose mt-8 max-w-none">{content}</div>
    <LessonQuiz key={lesson.id + "-quiz"} items={getFdeQuiz(lesson.id)} locale={locale} />
    {moduleCase && <ModuleCase key={moduleCase.question.id} {...moduleCase} locale={locale} />}
    <RelatedReading module={lesson.moduleOrder} locale={locale} />
    <div className="mt-9 border-t border-line pt-7"><LessonReadButton lessonId={lesson.id} locale={locale} /><p className="mt-3 text-xs leading-6 text-muted">{copy.progressBody}</p></div>
    <SpotlightGroup as="nav" aria-label={copy.directory} className="mt-8 grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link href={"/learn/fde/" + previous.slug} className="group/nb block rounded-xl">
          <SpotlightCard className={neighbourCard}>
            <span className="flex items-center gap-2 text-xs text-muted">
              <ArrowLeft className="h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nb:-translate-x-1" />
              {copy.previous}
              <span className="ml-auto font-mono tabular-nums">{previous.moduleOrder}.{previous.order}</span>
            </span>
            <span lang="zh-CN" className="mt-2 block text-sm leading-7">{previous.title}</span>
          </SpotlightCard>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={"/learn/fde/" + next.slug} className="group/nb block rounded-xl">
          <SpotlightCard className={neighbourCard + " bg-bg-elevated"}>
            <span className="flex items-center gap-2 text-xs text-accent">
              <span className="font-mono tabular-nums text-muted">{next.moduleOrder}.{next.order}</span>
              <span className="ml-auto">{copy.next}</span>
              <ArrowRight className="h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nb:translate-x-1" />
            </span>
            <span lang="zh-CN" className="mt-2 block text-sm leading-7">{next.title}</span>
          </SpotlightCard>
        </Link>
      ) : (
        <Link href="/learn/fde" className="group/nb block rounded-xl">
          <SpotlightCard className={neighbourCard + " text-sm text-accent"}>{copy.directory}</SpotlightCard>
        </Link>
      )}
    </SpotlightGroup>
  </article>;
}
