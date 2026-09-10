import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Portrait } from "@/components/about/portrait";
import { Publications } from "@/components/about/publications";
import { EducationCards } from "@/components/about/timeline";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/data/site";
import { education } from "@/data/timeline";
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
      <header className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              as="h1"
              className="[&_h1]:lg:text-[3.25rem]"
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
      <section className="container-x pb-16 lg:pb-24">
        <div className="grid gap-6 border-t border-line pt-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-6 bg-accent" />
                {t("story.eyebrow")}
              </p>
            </Reveal>
          </div>
          <div className="flex max-w-[46rem] flex-col gap-5 lg:col-span-8">
            {paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p
                  className={
                    i === 0
                      ? "text-lg leading-[1.85] text-fg sm:text-xl"
                      : "text-base leading-[1.9] text-muted sm:text-[17px]"
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
      <section className="section-space border-y border-line bg-bg-elevated/35">
        <div className="container-x">
          <SectionHeading
            eyebrow={t("education.eyebrow")}
            title={t("education.title")}
            accent={t("education.titleAccent")}
          />
          <div className="mt-10">
            <EducationCards
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
            <div className="flex h-full flex-col gap-6 rounded-2xl bg-fg p-7 text-bg sm:p-8">
              <p className="eyebrow flex items-center gap-3 text-bg/60">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t("now.eyebrow")}
              </p>
              <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{t("now.title")}</h3>
              <ul className="flex flex-col divide-y divide-bg/15">
                {now.map((item, i) => (
                  <li key={item} className="flex gap-4 py-4 text-sm leading-[1.8] text-bg/85 first:pt-0 last:pb-0">
                    <span className="pt-0.5 font-mono text-[10px] text-accent">0{i + 1}</span>
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
            <Stagger className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
              {values.map((v, i) => (
                <StaggerItem key={v.title} className="h-full">
                  <article className="flex h-full flex-col gap-3 border-t border-line pt-5">
                    <span className="font-mono text-[10px] text-accent">0{i + 1}</span>
                    <h4 className="font-display text-xl font-semibold tracking-tight">{v.title}</h4>
                    <p className="text-sm leading-[1.8] text-muted">{v.body}</p>
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
