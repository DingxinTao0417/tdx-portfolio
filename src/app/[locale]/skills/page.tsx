import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SkillMatrix, SkillsExplorer } from "@/components/skills/skills-explorer";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TechIcon } from "@/components/ui/tech-icon";
import { TiltCard } from "@/components/ui/tilt-card";
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
      <section className="container-x pt-10 pb-24">
        <Reveal>
          <SkillsExplorer categories={skillCategories} />
        </Reveal>
      </section>

      {/* Proficiency matrix */}
      <section className="container-x pb-24">
        <SectionHeading eyebrow={t("proficiency")} title={t("categories")} size="md" />
        <div className="mt-12">
          <SkillMatrix categories={skillCategories} />
        </div>
      </section>

      {/* Principles */}
      <section className="relative border-y border-line py-24">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="container-x">
          <SectionHeading
            eyebrow={t("principles.eyebrow")}
            title={t("principles.title")}
            accent={t("principles.titleAccent")}
          />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <StaggerItem key={p.title} className="h-full">
                <TiltCard className="h-full rounded-3xl" max={6}>
                  <article className="flex h-full flex-col gap-4 rounded-3xl border border-line bg-bg-elevated p-7">
                    <span className="font-display text-4xl font-bold text-accent/80">0{i + 1}</span>
                    <h3 className="font-display text-xl font-semibold tracking-tight">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{p.body}</p>
                  </article>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Toolbelt */}
      <section className="container-x py-24">
        <SectionHeading
          eyebrow={t("toolbelt.eyebrow")}
          title={t("toolbelt.title")}
          accent={t("toolbelt.titleAccent")}
          size="md"
        />
        <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" stagger={0.05}>
          {toolbelt.map((tool) => (
            <StaggerItem key={tool.name}>
              <div className="group flex items-center gap-3 rounded-2xl border border-line bg-bg-elevated p-4 transition-colors hover:border-accent/50">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-fg transition-colors group-hover:text-accent">
                  <TechIcon icon={tool.icon} name={tool.name} size={18} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{tool.name}</span>
                  <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
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
