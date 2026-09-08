import { ArrowUpRight, Clock, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { CopyEmail } from "@/components/contact/copy-email";
import { LocalClock } from "@/components/layout/local-clock";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { site } from "@/data/site";
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
    title: t("contact"),
    description: t("contactDescription"),
    alternates: {
      canonical: localizedPath(locale, "/contact"),
      languages: languageAlternates("/contact"),
    },
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const t = await getTranslations("Contact");
  const tc = await getTranslations("Common");
  const tn = await getTranslations("Nav");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        body={t("intro")}
      />

      <section className="container-x grid gap-10 pt-8 pb-16 lg:grid-cols-12 lg:gap-16 lg:pb-24">
        {/* Form */}
        <Reveal className="lg:col-span-7">
          <div className="rounded-2xl border border-line bg-bg-elevated p-5 sm:p-8 lg:p-9">
            <ContactForm />
          </div>
        </Reveal>

        {/* Sidebar */}
        <div className="flex min-w-0 flex-col gap-9 lg:col-span-5 lg:pt-3">
          <Reveal delay={0.1}>
            <div className="min-w-0 border-b border-line pb-8 [&_a]:break-all [&_a]:text-xl sm:[&_a]:text-2xl">
              <p className="eyebrow mb-4 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent" />
                {t("directEmail")}
              </p>
              <CopyEmail email={site.email} label={tc("copyEmail")} copiedLabel={tc("copied")} />
              <p className="mt-4 text-sm leading-relaxed text-muted">{t("responseTime")}</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <p className="eyebrow mb-5">{t("elsewhere")}</p>
              <ul className="flex flex-col divide-y divide-line">
                {site.socials
                  .filter((s) => s.id !== "email")
                  .map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex items-center justify-between gap-3 py-4 transition-colors hover:text-accent"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <TechIcon icon={s.id} name={s.label} size={18} className="text-fg/80 group-hover:text-accent" />
                          <span className="font-medium">{s.label}</span>
                        </span>
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="truncate font-mono text-[11px] text-muted">{s.handle}</span>
                          <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                        </span>
                      </a>
                    </li>
                  ))}
                {site.resumeUrl && (
                  <li>
                    <a
                      href={site.resumeUrl}
                      className="flex items-center justify-between py-4 transition-colors hover:text-accent"
                    >
                      <span className="font-medium">Resume</span>
                      <span className="font-mono text-xs text-muted">PDF</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex flex-col gap-4 border-t border-line pt-7 text-muted">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  {locale === "zh" ? site.location.zh : site.location.en}
                </span>
                <span className="text-xs">
                  {tn("available")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <LocalClock label={tc("localTime")} className="text-muted" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
