import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { PageHeader } from "@/components/ui/page-header";
import { projects } from "@/data/projects";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("projects"),
    description: t("projectsDescription"),
    alternates: {
      canonical: localizedPath(locale, "/projects"),
      languages: languageAlternates("/projects"),
    },
  };
}

export default async function ProjectsPage() {
  const t = await getTranslations("Projects");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        body={t("intro")}
      />
      <section className="container-x pb-24">
        <ProjectsGrid projects={projects} />
      </section>
    </>
  );
}
