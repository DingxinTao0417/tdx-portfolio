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
    <section className="relative section-space border-y border-line bg-bg-elevated/40">
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

        <Stagger className="mt-10 grid gap-x-7 gap-y-10 md:grid-cols-2">
          {featuredProjects.map((project, i) => (
            <StaggerItem
              key={project.slug}
              className={i === 0 ? "md:col-span-2" : ""}
            >
              <ProjectCard
                project={project}
                size={i === 0 ? "lg" : "md"}
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
