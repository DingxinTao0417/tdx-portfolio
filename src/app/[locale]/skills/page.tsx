import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SkillMatrix, SkillsExplorer } from "@/components/skills/skills-explorer";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TechIcon } from "@/components/ui/tech-icon";
import { skillCategories, toolbelt } from "@/data/skills";
import { pick } from "@/data/types";
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
    title: t("skills"),
    description: t("skillsDescription"),
    alternates: {
      canonical: localizedPath(locale, "/skills"),
      languages: languageAlternates("/skills"),
    },
  };
}

type Principle = { title: string; body: string };

export default async function SkillsPage() {
  const locale = await getLocale();
  const t = await getTranslations("Skills");
  const principles = t.raw("principles.items") as Principle[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        body={t("intro")}
      />

      {/* 3D sphere + category explorer */}
      <section className="container-x pt-8 pb-16 lg:pb-24">
        <Reveal>
          <SkillsExplorer categories={skillCategories} />
        </Reveal>
      </section>

      {/* Technology directory, without self-assessed proficiency ratings. */}
      <section className="container-x pb-16 lg:pb-24">
        <SectionHeading eyebrow={t("proficiency")} title={t("categories")} size="md" />
        <div className="mt-8 sm:mt-10">
          <SkillMatrix categories={skillCategories} />
        </div>
      </section>

      {/* Principles */}
      <section className="section-space border-y border-line bg-bg-elevated/35">
        <div className="container-x">
          <SectionHeading
            eyebrow={t("principles.eyebrow")}
            title={t("principles.title")}
            accent={t("principles.titleAccent")}
          />
          <Stagger className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {principles.map((p, i) => (
              <StaggerItem key={p.title} className="h-full">
                <article className="flex h-full flex-col gap-4 border-t border-line pt-5">
                  <span className="font-mono text-[11px] text-accent">0{i + 1}</span>
                  <h3 className="font-display text-xl font-semibold tracking-tight">{p.title}</h3>
                  <p className="text-sm leading-[1.8] text-muted">{p.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Toolbelt */}
      <section className="container-x section-space">
        <SectionHeading
          eyebrow={t("toolbelt.eyebrow")}
          title={t("toolbelt.title")}
          accent={t("toolbelt.titleAccent")}
          size="md"
        />
        <Stagger className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:mt-10 lg:grid-cols-5" stagger={0.05}>
          {toolbelt.map((tool) => (
            <StaggerItem key={tool.name}>
              <div className="group flex items-center gap-3 border-b border-line py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-bg-elevated text-muted transition-colors group-hover:text-accent">
                  <TechIcon icon={tool.icon} name={tool.name} size={18} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{tool.name}</span>
                  <span className="mt-1 truncate text-[11px] text-muted">
                    {pick(tool.note, locale)}
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
