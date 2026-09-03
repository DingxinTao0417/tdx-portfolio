import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/projects/project-card";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { GenerativeCover } from "@/components/ui/generative-cover";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { TechIcon } from "@/components/ui/tech-icon";
import { getAdjacentProject, getProject, projects } from "@/data/projects";
import { site } from "@/data/site";
import { pick } from "@/data/types";
import { Link } from "@/i18n/navigation";
import { absoluteUrl, languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { iconKeyForStack } from "@/lib/icons";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    projects.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = pick(project.title, locale);
  const description = pick(project.tagline, locale);
  const og = `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
    description,
  )}&locale=${locale}&hue=${project.hue}`;
  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(locale, `/projects/${slug}`),
      languages: languageAlternates(`/projects/${slug}`),
    },
    openGraph: { title, description, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations("Projects");
  const tc = await getTranslations("Common");
  const next = getAdjacentProject(slug);

  const sections = [
    { key: "overview", body: pick(project.description, locale) },
    { key: "problem", body: pick(project.problem, locale) },
    { key: "approach", body: pick(project.approach, locale) },
    { key: "impact", body: pick(project.impact, locale) },
    ...(project.learning
      ? [{ key: "learning" as const, body: pick(project.learning, locale) }]
      : []),
  ] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pick(project.title, locale),
    description: pick(project.description, locale),
    author: { "@type": "Person", name: site.name, url: site.url },
    dateCreated: project.year,
    keywords: project.stack.join(", "),
    url: absoluteUrl(locale, `/projects/${project.slug}`),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="relative isolate overflow-hidden pt-32 sm:pt-40">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="container-x">
          <Reveal>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {tc("backToProjects")}
            </Link>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Reveal delay={0.05}>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="accent">{t(`filters.${project.category}`)}</Tag>
                  <Tag>{project.year}</Tag>
                  <span className="font-mono text-xs text-muted">/ {project.index}</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                  {pick(project.title, locale)}
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-2xl font-serif text-xl italic leading-relaxed text-muted sm:text-2xl">
                  {pick(project.tagline, locale)}
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.2} className="lg:col-span-4">
              <dl className="grid grid-cols-2 gap-6 rounded-3xl border border-line bg-bg-elevated p-6">
                {project.metrics.map((m) => (
                  <div key={m.value} className="flex flex-col gap-1">
                    <dd className="font-display text-3xl font-bold tracking-tight text-accent">
                      <Counter value={m.value} />
                    </dd>
                    <dt className="text-xs text-muted">{pick(m.label, locale)}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.25} className="mt-12">
            {project.cover ? (
              <div className="hud-corners relative overflow-hidden rounded-2xl border border-line bg-bg-elevated p-1.5 sm:p-2">
                <Image
                  src={project.cover.src}
                  alt={pick(project.cover.alt, locale)}
                  width={project.cover.width}
                  height={project.cover.height}
                  priority
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="h-auto w-full rounded-md"
                />
              </div>
            ) : (
              <div className="hud-corners relative aspect-[16/8] overflow-hidden rounded-3xl border border-line">
                <GenerativeCover hue={project.hue} motif={project.motif} index={project.index} />
              </div>
            )}
          </Reveal>
        </div>
      </header>

      <div className="container-x mt-20 grid gap-14 lg:grid-cols-12">
        {/* Body */}
        <div className="flex flex-col gap-14 lg:col-span-8">
          {sections.map((s, i) => (
            <Reveal key={s.key}>
              <section className="grid gap-4 sm:grid-cols-12">
                <div className="sm:col-span-3">
                  <p className="eyebrow flex items-center gap-2">
                    <span className="text-accent">0{i + 1}</span>
                    {t(`detail.${s.key}`)}
                  </p>
                </div>
                <p className="text-lg leading-relaxed text-fg/90 sm:col-span-9">{s.body}</p>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <section className="grid gap-4 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <p className="eyebrow flex items-center gap-2">
                  <span className="text-accent">
                    {String(sections.length + 1).padStart(2, "0")}
                  </span>
                  {t("detail.highlights")}
                </p>
              </div>
              <ul className="grid gap-3 sm:col-span-9">
                {project.highlights.map((h) => (
                  <li
                    key={h.en}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-bg-elevated p-4 text-[15px] leading-relaxed"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                      <Check className="h-3 w-3" />
                    </span>
                    {pick(h, locale)}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <Reveal delay={0.1}>
            <div className="sticky top-28 flex flex-col gap-8 rounded-3xl border border-line bg-bg-elevated p-7">
              <div>
                <p className="eyebrow mb-2">{tc("role")}</p>
                <p className="text-[15px]">{pick(project.role, locale)}</p>
              </div>
              <div>
                <p className="eyebrow mb-2">{tc("year")}</p>
                <p className="font-mono text-[15px]">{project.year}</p>
              </div>
              <div>
                <p className="eyebrow mb-3">{tc("stack")}</p>
                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <li
                      key={s}
                      className="inline-flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 font-mono text-xs"
                    >
                      <TechIcon icon={iconKeyForStack(s)} name={s} size={14} className="text-fg/70" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              {(project.links.github || project.links.demo) && (
                <div>
                  <p className="eyebrow mb-3">{tc("links")}</p>
                  <div className="flex flex-col gap-2">
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
                      >
                        <span className="inline-flex items-center gap-2">
                          <TechIcon icon="github" name="GitHub" size={16} />
                          {tc("source")}
                        </span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                    {project.links.demo && (
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
                      >
                        {tc("liveDemo")}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </aside>
      </div>

      {next && (
        <section className="container-x mt-28">
          <div className="flex items-end justify-between gap-6">
            <p className="eyebrow">{t("detail.nextProject")}</p>
            <ButtonLink href="/projects" variant="ghost" size="sm" arrow>
              {t("detail.more")}
            </ButtonLink>
          </div>
          <div className="mt-6 md:w-2/3 lg:w-1/2">
            <ProjectCard
              project={next}
              locale={locale}
              categoryLabel={t(`filters.${next.category}`)}
              ctaLabel={tc("viewProject")}
              size="lg"
            />
          </div>
        </section>
      )}
    </article>
  );
}
