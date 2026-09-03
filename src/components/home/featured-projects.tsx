import { useLocale, useTranslations } from "next-intl";
import { ProjectCard } from "@/components/projects/project-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { featuredProjects } from "@/data/projects";

export function FeaturedProjects() {
  const t = useTranslations("Home.featured");
  const tp = useTranslations("Projects");
  const tc = useTranslations("Common");
  const locale = useLocale();

  return (
    <section className="relative py-24 sm:py-32">
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

        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <StaggerItem
              key={project.slug}
              className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}
            >
              <ProjectCard
                project={project}
                locale={locale}
                categoryLabel={tp(`filters.${project.category}`)}
                ctaLabel={tc("viewProject")}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
