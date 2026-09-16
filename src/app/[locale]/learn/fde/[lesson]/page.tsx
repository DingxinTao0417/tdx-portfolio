import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { CourseIllustration } from "@/components/learn/course-illustration";
import { LessonReadButton } from "@/components/learn/learning-record";
import { LessonQuiz } from "@/components/learn/lesson-quiz";
import { ModuleCase } from "@/components/learn/module-case";
import { RelatedReading } from "@/components/learn/related-reading";
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
  const index = fdeLessons.findIndex((item) => item.id === lesson.id);
  const previous = fdeLessons[index - 1];
  const next = fdeLessons[index + 1];
  const content = await renderMdx(lesson.content);
  const moduleCase = lesson.order === 4 ? getFdeCase(lesson.moduleId) : null;
  return <article className="min-w-0">
    <Link href="/learn/fde" className="inline-flex min-h-11 items-center gap-2 text-xs text-muted hover:text-accent"><ArrowLeft className="h-3.5 w-3.5" />{copy.back}</Link>
    <header className="mt-5 border-b border-line pb-7">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted"><span className="font-mono text-accent">{lesson.moduleOrder}.{lesson.order}</span><span lang="zh-CN">{lesson.moduleTitle}</span>{lesson.implementation_track === "optional_extension" && <span className="rounded-md bg-accent-soft px-2 py-1 text-accent">{copy.optional}</span>}</div>
      <h1 lang="zh-CN" className="mt-4 font-display text-2xl font-semibold leading-[1.4] tracking-tight sm:text-3xl lg:text-4xl">{lesson.title}</h1>
      <p lang="zh-CN" className="mt-4 max-w-3xl text-sm leading-8 text-muted">{lesson.learning_objective}</p>
      <p className="mt-4 text-[11px] leading-6 text-muted">{copy.contentLanguage} · {copy.edition}</p>
      {copy.languageNotice && <p className="mt-3 rounded-xl bg-accent-soft p-3 text-xs leading-6">{copy.languageNotice}</p>}
    </header>
    {(lesson.moduleOrder === 1 && lesson.order === 1 || lesson.moduleOrder === 3 && lesson.order === 1) && <CourseIllustration locale={locale} eager />}
    {lesson.moduleOrder === 4 && lesson.order === 3 && <CourseIllustration locale={locale} kind="retrieval" eager />}
    {lesson.moduleOrder === 5 && lesson.order === 3 && <CourseIllustration locale={locale} kind="execution" eager />}
    <div lang="zh-CN" className="prose-tdx mt-8 max-w-none">{content}</div>
    <LessonQuiz key={lesson.id + "-quiz"} items={getFdeQuiz(lesson.id)} locale={locale} />
    {moduleCase && <ModuleCase key={moduleCase.question.id} {...moduleCase} locale={locale} />}
    <RelatedReading module={lesson.moduleOrder} locale={locale} />
    <div className="mt-9 border-t border-line pt-7"><LessonReadButton lessonId={lesson.id} locale={locale} /><p className="mt-3 text-xs leading-6 text-muted">{copy.progressBody}</p></div>
    <nav aria-label={copy.directory} className="mt-8 grid gap-4 sm:grid-cols-2">
      {previous ? <Link href={"/learn/fde/" + previous.slug} className="rounded-xl border border-line p-4 hover:border-accent"><span className="flex items-center gap-2 text-xs text-muted"><ArrowLeft className="h-3 w-3" />{copy.previous}</span><span lang="zh-CN" className="mt-2 block text-sm leading-7">{previous.title}</span></Link> : <div />}
      {next ? <Link href={"/learn/fde/" + next.slug} className="rounded-xl border border-line bg-bg-elevated p-4 hover:border-accent"><span className="flex items-center justify-between text-xs text-accent">{copy.next}<ArrowRight className="h-3 w-3" /></span><span lang="zh-CN" className="mt-2 block text-sm leading-7">{next.title}</span></Link> : <Link href="/learn/fde" className="rounded-xl border border-line p-4 text-sm text-accent">{copy.directory}</Link>}
    </nav>
  </article>;
}
