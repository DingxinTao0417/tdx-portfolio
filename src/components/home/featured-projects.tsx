import { useLocale, useTranslations } from "next-intl";
import { ProjectShowcase } from "@/components/home/project-showcase";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { featuredProjects } from "@/data/projects";
import { pick } from "@/data/types";

export function FeaturedProjects() {
  const t = useTranslations("Home.featured");
  const tp = useTranslations("Projects");
  const locale = useLocale();

  return (
    <section id="featured-projects" className="relative section-space overflow-hidden border-y border-line bg-bg-elevated/40">
      <div className="container-x">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            accent={t("titleAccent")}
            body={t("body")}
          />
          <ButtonLink href="/projects" variant="secondary" arrow className="shrink-0">
            {t("cta")}
          </ButtonLink>
        </div>

        <ProjectShowcase
          projects={featuredProjects.map((project) => ({
            slug: project.slug,
            title: pick(project.title, locale),
            tagline: pick(project.tagline, locale),
            category: tp(`filters.${project.category}`),
            stack: project.stack.slice(0, 4),
            cover: project.cover && {
              src: project.cover.src,
              alt: pick(project.cover.alt, locale),
            },
          }))}
        />
      </div>
    </section>
  );
}
