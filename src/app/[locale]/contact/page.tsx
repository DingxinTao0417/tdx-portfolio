import { Clock, Mail, MapPin } from "lucide-react";
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

      <section className="container-x grid gap-12 pb-24 pt-10 lg:grid-cols-12">
        {/* Form */}
        <Reveal className="lg:col-span-7">
          <div className="rounded-[2rem] border border-line bg-surface p-6 backdrop-blur sm:p-10">
            <ContactForm />
          </div>
        </Reveal>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Reveal delay={0.1}>
            <div className="hud-corners rounded-3xl border border-line bg-bg-elevated p-7">
              <p className="eyebrow mb-4 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent" />
                {t("directEmail")}
              </p>
              <CopyEmail email={site.email} label={tc("copyEmail")} copiedLabel={tc("copied")} />
              <p className="mt-4 text-sm text-muted">{t("responseTime")}</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-line bg-bg-elevated p-7">
              <p className="eyebrow mb-5">{t("elsewhere")}</p>
              <ul className="flex flex-col gap-3">
                {site.socials
                  .filter((s) => s.id !== "email")
                  .map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex items-center justify-between rounded-2xl border border-line px-4 py-3 transition-colors hover:border-accent"
                      >
                        <span className="flex items-center gap-3">
                          <TechIcon icon={s.id} name={s.label} size={18} className="text-fg/80 group-hover:text-accent" />
                          <span className="font-medium">{s.label}</span>
                        </span>
                        <span className="font-mono text-xs text-muted">{s.handle}</span>
                      </a>
                    </li>
                  ))}
                {site.resumeUrl && (
                  <li>
                    <a
                      href={site.resumeUrl}
                      className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 transition-colors hover:border-accent"
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
            <div className="flex flex-col gap-4 rounded-3xl border border-line bg-fg p-7 text-bg">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm text-bg/80">
                  <MapPin className="h-4 w-4 text-accent" />
                  {locale === "zh" ? site.location.zh : site.location.en}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-bg/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-bg/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {tn("available")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-bg/80">
                <Clock className="h-4 w-4 text-accent" />
                <LocalClock label={tc("localTime")} className="text-bg/80" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
