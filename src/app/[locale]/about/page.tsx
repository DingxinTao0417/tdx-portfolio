import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Portrait } from "@/components/about/portrait";
import { EducationCards, ExperienceTimeline } from "@/components/about/timeline";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/data/site";
import { education, experience } from "@/data/timeline";
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
    title: t("about"),
    description: t("aboutDescription"),
    alternates: {
      canonical: localizedPath(locale, "/about"),
      languages: languageAlternates("/about"),
    },
  };
}

type Value = { title: string; body: string };

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
    jobTitle: locale === "zh" ? "AI 全栈开发工程师 / 前沿部署工程师" : "AI Full-Stack Engineer / Forward Deployed Engineer",
    sameAs: site.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school.en })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="relative isolate overflow-hidden pt-36 pb-10 sm:pt-44">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: "var(--hero-glow)" }}
        />
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow={t("eyebrow")}
              title={t("title")}
              accent={t("titleAccent")}
              body={t("intro")}
              size="xl"
            />
          </div>
          <Reveal delay={0.2} className="lg:col-span-5">
            <Portrait />
          </Reveal>
        </div>
      </header>

      {/* Story */}
      <section className="container-x py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-6 bg-accent" />
                {t("story.eyebrow")}
              </p>
            </Reveal>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-7">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p
                  className={
                    i === 0
                      ? "text-xl leading-relaxed text-fg first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-accent sm:text-2xl"
                      : "text-lg leading-relaxed text-fg/80"
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="relative border-y border-line py-24">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="container-x">
          <SectionHeading
            eyebrow={t("education.eyebrow")}
            title={t("education.title")}
            accent={t("education.titleAccent")}
          />
          <div className="mt-14">
            <EducationCards
              entries={education}
              locale={locale}
              classOfLabel={locale === "zh" ? "{year} 届" : "Class of {year}"}
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="container-x py-24">
        <SectionHeading
          eyebrow={t("experience.eyebrow")}
          title={t("experience.title")}
          accent={t("experience.titleAccent")}
        />
        <div className="mt-14">
          <ExperienceTimeline entries={experience} locale={locale} />
        </div>
      </section>

      {/* Now + Values */}
      <section className="container-x pb-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="hud-corners flex h-full flex-col gap-6 rounded-3xl border border-line bg-fg p-8 text-bg">
              <p className="eyebrow flex items-center gap-3 text-bg/60">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {t("now.eyebrow")}
              </p>
              <h3 className="font-display text-3xl font-semibold tracking-tight">{t("now.title")}</h3>
              <ul className="flex flex-col gap-3">
                {now.map((item, i) => (
                  <li key={item} className="flex gap-4 text-[15px] leading-relaxed text-bg/85">
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <ButtonLink href="/contact" arrow className="bg-accent text-white hover:bg-accent-strong">
                  {t("cta")}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow mb-5 flex items-center gap-3">
                <span className="inline-block h-px w-6 bg-accent" />
                {t("values.eyebrow")}
              </p>
            </Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {values.map((v, i) => (
                <StaggerItem key={v.title} className="h-full">
                  <article className="group flex h-full flex-col gap-3 rounded-3xl border border-line bg-bg-elevated p-6 transition-colors hover:border-accent/50">
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    <h4 className="font-display text-xl font-semibold tracking-tight">{v.title}</h4>
                    <p className="text-sm leading-relaxed text-muted">{v.body}</p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>
    </>
  );
}
