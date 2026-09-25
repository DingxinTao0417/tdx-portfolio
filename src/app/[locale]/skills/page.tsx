import { Asterisk } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SkillMatrix, SkillsExplorer } from "@/components/skills/skills-explorer";
import { WorkflowCards } from "@/components/skills/workflow-cards";
import { VelocityMarquee } from "@/components/fx/velocity-marquee";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TechIcon } from "@/components/ui/tech-icon";
import { navItems } from "@/data/nav";
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

const pad = (n: number) => String(n).padStart(2, "0");
const hudIndex = `${pad(navItems.findIndex((item) => item.href === "/skills") + 1)} / ${pad(navItems.length)}`;

export default async function SkillsPage() {
  const locale = await getLocale();
  const t = await getTranslations("Skills");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        body={t("intro")}
        index={hudIndex}
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
      <section id="workflow" className="section-space scroll-mt-24 border-y border-line bg-bg-elevated/35">
        <div className="container-x">
          <SectionHeading
            eyebrow={t("principles.eyebrow")}
            title={t("principles.title")}
            accent={t("principles.titleAccent")}
          />
          <WorkflowCards />
        </div>
      </section>

      {/* Toolbelt */}
      <section className="section-space overflow-hidden">
        <div className="container-x">
          <SectionHeading
            eyebrow={t("toolbelt.eyebrow")}
            title={t("toolbelt.title")}
            accent={t("toolbelt.titleAccent")}
            size="md"
          />
        </div>
        {/* Decorative ticker; the list below carries the same names for assistive tech. */}
        <div aria-hidden className="mt-10 motion-reduce:hidden lg:mt-12">
          <VelocityMarquee baseVelocity={34} itemClassName="px-3 sm:px-5">
            {toolbelt.map((tool) => (
              <span
                key={tool.name}
                className="text-outline flex items-center gap-6 font-display text-5xl leading-[1.15] font-semibold tracking-[-0.04em] whitespace-nowrap transition-colors duration-300 hover:text-outline-accent sm:gap-10 sm:text-7xl lg:text-8xl"
              >
                {tool.name}
                <Asterisk className="h-6 w-6 shrink-0 text-accent sm:h-9 sm:w-9" strokeWidth={1.5} />
              </span>
            ))}
          </VelocityMarquee>
        </div>
        <div className="container-x">
          <Stagger className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:mt-12 lg:grid-cols-5" stagger={0.05}>
            {toolbelt.map((tool) => (
              <StaggerItem key={tool.name}>
                <div className="group relative flex items-center gap-3 border-b border-line py-4">
                  <span aria-hidden className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-bg-elevated text-muted transition-[color,border-color,background-color,translate,rotate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:-rotate-6 group-hover:border-accent/40 group-hover:bg-accent-soft group-hover:text-accent">
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
        </div>
      </section>
    </>
  );
}
