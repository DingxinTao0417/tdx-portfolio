import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Portrait } from "@/components/about/portrait";
import { Publications } from "@/components/about/publications";
import { Story } from "@/components/about/story";
import { EducationTimeline } from "@/components/about/timeline";
import styles from "@/components/about/about.module.css";
import { Aurora } from "@/components/fx/aurora";
import { BorderBeam } from "@/components/fx/border-beam";
import { ScrambleText } from "@/components/fx/scramble-text";
import { ScrollFade } from "@/components/fx/scroll-fade";
import { SpotlightCard, SpotlightGroup } from "@/components/fx/spotlight";
import { TerminalPath } from "@/components/fx/terminal-path";
import { FxTrigger } from "@/components/fx/trigger";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { education } from "@/data/timeline";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("about"),
    description: t("aboutDescription"),
    alternates: {
      canonical: localizedPath(locale, "/about"),
      languages: languageAlternates("/about"),
    },
  };
}

type Value = { title: string; body: string };

const pad = (n: number) => String(n).padStart(2, "0");
const hudIndex = `${pad(navItems.findIndex((item) => item.href === "/about") + 1)} / ${pad(navItems.length)}`;

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations("About");
  const paragraphs = t.raw("story.paragraphs") as string[];
  const now = t.raw("now.items") as string[];
  const values = t.raw("values.items") as Value[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.nameZh,
    url: site.url,
    email: site.email,
    jobTitle: locale === "zh" ? "AI Native 开发者" : "AI Native Developer",
    sameAs: site.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school.en })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpotlightGroup as="header" className="relative isolate overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: "var(--hero-glow)" }} />
        <Aurora className="-z-10" intensity={0.8} />
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <div aria-hidden data-fx-spot="" className="fx-spot-lit fx-grid-lit pointer-events-none absolute inset-0 -z-10" />
        <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="pointer-events-none absolute inset-x-5 -top-10 flex items-center justify-between gap-4 sm:inset-x-8 sm:-top-12 lg:inset-x-12">
            <TerminalPath />
            <span className="fx-terminal tabular-nums">{hudIndex}</span>
          </div>
          <ScrollFade className="lg:col-span-7">
            <SectionHeading
              as="h1"
              className="[&_h1]:lg:text-[3.25rem]"
              eyebrow={t("eyebrow")}
              title={t("title")}
              accent={t("titleAccent")}
              body={t("intro")}
              size="xl"
            />
          </ScrollFade>
          <div className="lg:col-span-5">
            <Portrait />
          </div>
        </div>
      </SpotlightGroup>

      <Story eyebrow={t("story.eyebrow")} paragraphs={paragraphs} />

      {/* Education */}
      <section className="section-space relative isolate overflow-hidden border-y border-line bg-bg-elevated/35">
        <div aria-hidden className="dot-grid mask-fade-y pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="container-x">
          <SectionHeading
            eyebrow={t("education.eyebrow")}
            title={t("education.title")}
            accent={t("education.titleAccent")}
          />
          <div className="mt-12 md:mt-16">
            <EducationTimeline
              entries={education}
              locale={locale}
              classOfLabel={locale === "zh" ? "{year} 届" : "Class of {year}"}
            />
          </div>
        </div>
      </section>

      <Publications />

      {/* Employment entries remain in data/timeline.ts until their placeholder organizations and role details are confirmed. */}

      {/* Now + Values */}
      <section className="container-x section-space">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <SpotlightCard className="flex h-full flex-col gap-6 rounded-2xl bg-fg p-7 text-bg sm:p-8">
              <div aria-hidden className={cn(styles.dots, "pointer-events-none absolute inset-0 rounded-[inherit]")} />
              <BorderBeam duration={10} size={90} />
              <p className="eyebrow relative flex items-center gap-3 text-bg/60">
                <span aria-hidden className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                {t("now.eyebrow")}
              </p>
              <h3 className="relative font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{t("now.title")}</h3>
              <FxTrigger as="ul" className="relative flex flex-col divide-y divide-bg/15">
                {now.map((item, i) => {
                  const cut = item.search(/[:：]/) + 1;
                  return (
                    <li key={item} className="flex gap-4 py-4 text-sm leading-[1.8] text-bg/75 first:pt-0 last:pb-0">
                      <ScrambleText text={`0${i + 1}`} delay={i * 0.12} className="pt-0.5 font-mono text-[10px] text-accent" />
                      <span>
                        {cut > 0 && <strong className="font-medium text-bg">{item.slice(0, cut)}</strong>}
                        {item.slice(cut)}
                      </span>
                    </li>
                  );
                })}
              </FxTrigger>
              <div className="relative mt-auto pt-4">
                <Magnetic strength={0.3}>
                  <ButtonLink href="/contact" arrow>
                    {t("cta")}
                  </ButtonLink>
                </Magnetic>
              </div>
            </SpotlightCard>
          </Reveal>
          <div className="lg:col-span-7">
            <FxTrigger as="p" className="eyebrow mb-5 flex items-center gap-3">
              <span className="fx-line inline-block h-px w-6 bg-accent" />
              <ScrambleText text={t("values.eyebrow")} />
            </FxTrigger>
            <Stagger className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
              {values.map((v, i) => (
                <StaggerItem key={v.title} className="h-full">
                  <FxTrigger as="article" className="group/value relative flex h-full flex-col gap-3 pt-5">
                    <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
                    <span
                      aria-hidden
                      className="fx-line absolute top-0 left-0 h-px w-10 bg-accent transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/value:w-full"
                    />
                    <ScrambleText text={`0${i + 1}`} delay={0.1 + i * 0.08} className="font-mono text-[10px] text-accent" />
                    <h4 className="font-display text-xl font-semibold tracking-tight transition-colors duration-300 group-hover/value:text-accent">{v.title}</h4>
                    <p className="text-sm leading-[1.8] text-muted">{v.body}</p>
                  </FxTrigger>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>
    </>
  );
}
