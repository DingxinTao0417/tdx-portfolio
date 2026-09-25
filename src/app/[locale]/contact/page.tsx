import { ArrowUpRight, Clock, Download, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { CopyEmail } from "@/components/contact/copy-email";
import { WeChatDialog } from "@/components/contact/wechat-dialog";
import { BorderBeam } from "@/components/fx/border-beam";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SpotlightCard } from "@/components/fx/spotlight";
import { LocalClock } from "@/components/layout/local-clock";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { navItems } from "@/data/nav";
import { resumeUrlFor, site } from "@/data/site";
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

const pad = (n: number) => String(n).padStart(2, "0");
const hudIndex = `${pad(navItems.findIndex((item) => item.href === "/contact") + 1)} / ${pad(navItems.length)}`;

/** Row hover: a soft sweep fills in behind the row while the arrow swaps diagonally. */
const row = "group/row relative isolate -mx-3 flex items-center justify-between gap-3 rounded-lg px-3 py-4 transition-colors hover:text-accent";
const sweep = "pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 rounded-lg bg-accent-soft transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:scale-x-100";

function RowArrow() {
  const move = "absolute h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";
  return (
    <span aria-hidden className="relative inline-grid h-4 w-4 shrink-0 place-items-center overflow-hidden text-muted group-hover/row:text-accent">
      <ArrowUpRight className={`${move} group-hover/row:translate-x-4 group-hover/row:-translate-y-4 group-focus-visible/row:translate-x-4 group-focus-visible/row:-translate-y-4`} />
      <ArrowUpRight className={`${move} -translate-x-4 translate-y-4 group-hover/row:translate-x-0 group-hover/row:translate-y-0 group-focus-visible/row:translate-x-0 group-focus-visible/row:translate-y-0`} />
    </span>
  );
}

export default async function ContactPage() {
  const locale = await getLocale();
  const t = await getTranslations("Contact");
  const tc = await getTranslations("Common");
  const tn = await getTranslations("Nav");
  const cursor = await getTranslations("FX.common.cursor");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        body={t("intro")}
        index={hudIndex}
      />

      <section className="container-x grid gap-10 pt-8 pb-16 lg:grid-cols-12 lg:gap-16 lg:pb-24">
        {/* Form: a console card whose border beam wakes up while a field has focus. */}
        <Reveal className="lg:col-span-7">
          <SpotlightCard className="group/form rounded-2xl border border-line bg-bg-elevated p-5 sm:p-8 lg:p-9">
            <BorderBeam duration={7} size={90} className="opacity-0 transition-opacity duration-700 group-focus-within/form:opacity-100" />
            <ContactForm />
          </SpotlightCard>
        </Reveal>

        {/* Sidebar */}
        <div className="flex min-w-0 flex-col gap-9 lg:col-span-5 lg:pt-3">
          <WeChatDialog />
          <Reveal delay={0.1}>
            <div className="min-w-0 border-b border-line pb-8 [&_a]:break-all [&_a]:text-xl sm:[&_a]:text-2xl">
              <p className="eyebrow mb-4 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent" />
                {t("directEmail")}
              </p>
              <CopyEmail email={site.email} label={tc("copyEmail")} copiedLabel={tc("copied")} cursorLabel={cursor("copy")} />
              <p className="mt-4 text-sm leading-relaxed text-muted">{t("responseTime")}</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <p className="eyebrow mb-3">{t("elsewhere")}</p>
              <ul className="flex flex-col divide-y divide-line">
                {site.socials
                  .filter((s) => s.id !== "email")
                  .map((s) => (
                    <li key={s.id}>
                      <a href={s.href} target="_blank" rel="noreferrer noopener" className={row}>
                        <span aria-hidden className={sweep} />
                        <span className="flex min-w-0 items-center gap-3">
                          <TechIcon icon={s.id} name={s.label} size={18} className="text-fg/80 transition-transform duration-300 group-hover/row:scale-110 group-hover/row:text-accent" />
                          <span className="font-medium">{s.label}</span>
                        </span>
                        <span className="flex min-w-0 items-center gap-3">
                          <ScrambleText text={s.handle} trigger="hover" className="truncate font-mono text-[11px] text-muted" />
                          <RowArrow />
                        </span>
                      </a>
                    </li>
                  ))}
                <li>
                  <a href={resumeUrlFor(locale)} download className={row}>
                    <span aria-hidden className={sweep} />
                    <span className="flex min-w-0 items-center gap-3">
                      <Download className="h-4 w-4 text-fg/80 transition-transform duration-300 group-hover/row:translate-y-0.5 group-hover/row:text-accent" aria-hidden />
                      <span className="font-medium">{t("resume")}</span>
                    </span>
                    <ScrambleText text={t("resumeFormat")} trigger="hover" className="font-mono text-xs text-muted" />
                  </a>
                </li>
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
                <span className="inline-flex items-center gap-2 text-xs">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)]" />
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
