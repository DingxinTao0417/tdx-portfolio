import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectGallery } from "@/components/projects/project-gallery";
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
  const gallery = [...(project.cover ? [project.cover] : []), ...(project.gallery ?? [])];
  const firstImage = gallery[0];

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
    <article className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="relative isolate pt-28 sm:pt-36">
        <div className="container-x">
          <Reveal>
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {tc("backToProjects")}
            </Link>
          </Reveal>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <Reveal delay={0.05}>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="accent">{t(`filters.${project.category}`)}</Tag>
                  <Tag>{project.year}</Tag>
                  <span className="font-mono text-xs text-muted">/ {project.index}</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.5rem]">
                  {pick(project.title, locale)}
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                  {pick(project.tagline, locale)}
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.2} className="lg:col-span-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6">
                {project.metrics.map((m) => (
                  <div key={m.value} className="flex flex-col gap-1">
                    <dd className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                      <Counter value={m.value} />
                    </dd>
                    <dt className="text-xs text-muted">{pick(m.label, locale)}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.25} className="mt-8 sm:mt-12">
            {gallery.length > 1 ? (
              <ProjectGallery
                key={project.slug}
                images={gallery.map((image) => ({
                  ...image,
                  alt: pick(image.alt, locale),
                  caption: pick(image.caption ?? image.alt, locale),
                }))}
              />
            ) : firstImage ? (
              <div className="relative rounded-2xl border border-line bg-bg-elevated p-1.5 sm:p-2.5">
                <Image
                  src={firstImage.src}
                  alt={pick(firstImage.alt, locale)}
                  width={firstImage.width}
                  height={firstImage.height}
                  preload
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="h-auto w-full rounded-lg border border-line object-contain"
                />
              </div>
            ) : (
              <div className="relative aspect-[16/8] overflow-hidden rounded-2xl border border-line">
                <GenerativeCover hue={project.hue} motif={project.motif} index={project.index} />
              </div>
            )}
            {project.galleryNote && (
              <p className="mt-4 max-w-3xl text-xs leading-6 text-muted">
                {pick(project.galleryNote, locale)}
              </p>
            )}
          </Reveal>
        </div>
      </header>

      <div className="container-x mt-12 grid gap-10 sm:mt-16 lg:grid-cols-12 lg:gap-14">
        {/* Body */}
        <div className="flex min-w-0 flex-col lg:col-span-8">
          {sections.map((s, i) => (
            <Reveal key={s.key}>
              <section className="grid gap-4 border-t border-line py-8 sm:grid-cols-12 sm:gap-6">
                <div className="sm:col-span-3">
                  <h2 className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-accent">0{i + 1}</span>
                    {t(`detail.${s.key}`)}
                  </h2>
                </div>
                <p className="text-base leading-8 text-fg/85 sm:col-span-9">{s.body}</p>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <section className="grid gap-4 border-t border-line py-8 sm:grid-cols-12 sm:gap-6">
              <div className="sm:col-span-3">
                <h2 className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-accent">
                    {String(sections.length + 1).padStart(2, "0")}
                  </span>
                  {t("detail.highlights")}
                </h2>
              </div>
              <ul className="grid gap-4 sm:col-span-9">
                {project.highlights.map((h) => (
                  <li
                    key={h.en}
                    className="flex items-start gap-3 text-[15px] leading-7"
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
        <aside className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-7 rounded-2xl border border-line bg-bg-elevated p-6 sm:p-7">
              <div>
                <p className="eyebrow mb-2">{tc("role")}</p>
                <p className="text-[15px] leading-7">{pick(project.role, locale)}</p>
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
                      className="inline-flex items-center gap-2 rounded-md bg-bg px-2.5 py-1.5 font-mono text-xs"
                    >
                      <TechIcon icon={iconKeyForStack(s)} name={s} size={14} className="text-fg/70" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              {(project.links.github || project.links.demo || project.article) && (
                <div>
                  <p className="eyebrow mb-3">{tc("links")}</p>
                  <div className="flex flex-col gap-2">
                    {project.article && (
                      <Link
                        href={`/blog/${project.article.slug}`}
                        className="inline-flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
                      >
                        {pick(project.article.label, locale)}
                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                      </Link>
                    )}
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
                      >
                        <span className="inline-flex items-center gap-2">
                          <TechIcon icon="github" name="GitHub" size={16} />
                          {tc(project.links.githubPrivate ? "sourcePrivate" : "source")}
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
        <section className="container-x mt-16 sm:mt-24">
          <div className="flex items-end justify-between gap-6">
            <p className="eyebrow">{t("detail.nextProject")}</p>
            <ButtonLink href="/projects" variant="ghost" size="sm" arrow>
              {t("detail.more")}
            </ButtonLink>
          </div>
          <div className="mt-6">
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
