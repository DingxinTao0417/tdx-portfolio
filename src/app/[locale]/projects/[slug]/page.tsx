import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { pad, type GalleryImage } from "@/components/projects/gallery-utils";
import { NextProject } from "@/components/projects/next-project";
import {
  CaseHighlights,
  CaseNotice,
  CaseSection,
  CaseSidebar,
  type CaseLink,
} from "@/components/projects/project-case";
import { ProjectHero } from "@/components/projects/project-hero";
import { ScrollHighlight } from "@/components/projects/scroll-highlight";
import { Reveal } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { getAdjacentProject, getProject, projects } from "@/data/projects";
import { site } from "@/data/site";
import { pick } from "@/data/types";
import { absoluteUrl, languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";

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
  const tf = await getTranslations("FX.projects");
  const cursor = await getTranslations("FX.common.cursor");
  const next = getAdjacentProject(slug);
  const position = projects.findIndex((p) => p.slug === slug) + 1;
  const title = pick(project.title, locale);
  const images: GalleryImage[] = [...(project.cover ? [project.cover] : []), ...(project.gallery ?? [])].map(
    (image) => ({
      src: image.src,
      width: image.width,
      height: image.height,
      alt: pick(image.alt, locale),
      caption: pick(image.caption ?? image.alt, locale),
    }),
  );

  const sections = [
    { key: "overview", body: pick(project.description, locale) },
    { key: "problem", body: pick(project.problem, locale) },
    { key: "approach", body: pick(project.approach, locale) },
    { key: "impact", body: pick(project.impact, locale) },
    ...(project.learning
      ? [{ key: "learning" as const, body: pick(project.learning, locale) }]
      : []),
  ] as const;

  const links: CaseLink[] = [];
  if (project.article) {
    links.push({
      href: `/blog/${project.article.slug}`,
      label: pick(project.article.label, locale),
      external: false,
      cursor: cursor("read"),
    });
  }
  if (project.links.github) {
    links.push({
      href: project.links.github,
      label: tc(project.links.githubPrivate ? "sourcePrivate" : "source"),
      external: true,
      cursor: cursor("visit"),
      icon: <TechIcon icon="github" name="GitHub" size={16} />,
    });
  }
  if (project.links.demo) {
    links.push({ href: project.links.demo, label: tc("liveDemo"), external: true, cursor: cursor("visit") });
  }

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
      <ProjectHero
        project={project}
        title={title}
        tagline={pick(project.tagline, locale)}
        category={t(`filters.${project.category}`)}
        stage={{ label: pick(project.stage.label, locale), tone: project.stage.tone }}
        kind={pick(project.kind, locale)}
        caseLabel={tf("caseIndex", { index: pad(position), total: pad(projects.length) })}
        backLabel={tc("backToProjects")}
        metrics={project.metrics.map((m) => ({ value: m.value, label: pick(m.label, locale) }))}
        images={images}
        note={project.galleryNote && pick(project.galleryNote, locale)}
        cursorLabel={cursor("open")}
      />

      <div className="container-x mt-16 grid gap-10 sm:mt-24 lg:grid-cols-12 lg:gap-14">
        <div className="flex min-w-0 flex-col lg:col-span-8">
          {sections.map((s, i) => (
            <CaseSection key={s.key} id={`case-${s.key}`} number={pad(i + 1)} title={t(`detail.${s.key}`)}>
              {i === 0 ? (
                <ScrollHighlight
                  text={s.body}
                  className="font-display text-xl tracking-[-0.01em] text-fg sm:text-[1.65rem] sm:leading-[1.55] leading-[1.6]"
                />
              ) : (
                <Reveal>
                  <p className="text-base leading-8 text-fg/85">{s.body}</p>
                </Reveal>
              )}
            </CaseSection>
          ))}

          <CaseSection id="case-highlights" number={pad(sections.length + 1)} title={t("detail.highlights")}>
            <CaseHighlights items={project.highlights.map((h) => pick(h, locale))} />
          </CaseSection>

          {project.notice && <CaseNotice title={t("detail.notice")} body={pick(project.notice, locale)} />}
        </div>

        <CaseSidebar
          labels={{ role: tc("role"), year: tc("year"), stack: tc("stack"), links: tc("links") }}
          role={pick(project.role, locale)}
          year={project.year}
          stack={project.stack}
          links={links}
        />
      </div>

      {next && next.slug !== project.slug && (
        <NextProject
          slug={next.slug}
          title={pick(next.title, locale)}
          tagline={pick(next.tagline, locale)}
          category={t(`filters.${next.category}`)}
          position={`${next.index} / ${pad(projects.length)}`}
          cover={
            next.cover && {
              src: next.cover.src,
              width: next.cover.width,
              height: next.cover.height,
              alt: pick(next.cover.alt, locale),
            }
          }
          labels={{
            eyebrow: t("detail.nextProject"),
            more: t("detail.more"),
            cta: tc("viewProject"),
            aria: tf("nextLabel", { title: pick(next.title, locale) }),
            cursor: cursor("view"),
          }}
        />
      )}
    </article>
  );
}
