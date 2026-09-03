import { ArrowUp, Mail } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/button";
import { TechIcon } from "@/components/ui/tech-icon";
import { LocalClock } from "./local-clock";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="container-x">
        {/* CTA band */}
        <div className="flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            {t("tagline")}{" "}
            <span className="font-serif font-normal italic text-accent">{t("taglineAccent")}</span>
          </h2>
          <ButtonLink href="/contact" size="lg" arrow>
            {t("cta")}
          </ButtonLink>
        </div>

        <div className="grid gap-12 border-t border-line py-14 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-fg font-display text-sm font-bold text-bg">
                {site.initials}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg font-semibold tracking-tight">
                  {site.name}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {site.nameZh} · {locale === "zh" ? site.location.zh : site.location.en}
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">{t("colophonBody")}</p>
            <div className="mt-6">
              <LocalClock label={tCommon("localTime")} className="text-fg" />
            </div>
          </div>

          {/* Navigate */}
          <div className="md:col-span-2">
            <p className="eyebrow mb-5">{t("navigate")}</p>
            <ul className="flex flex-col gap-3">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-fg/80 transition-colors hover:text-accent"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3">
            <p className="eyebrow mb-5">{t("connect")}</p>
            <ul className="flex flex-col gap-3">
              {site.socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="group inline-flex items-center gap-3 text-[15px] text-fg/80 transition-colors hover:text-accent"
                  >
                    {s.id === "email" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <TechIcon icon={s.id} name={s.label} size={16} />
                    )}
                    <span>{s.label}</span>
                    <span className="font-mono text-xs text-muted transition-colors group-hover:text-accent/70">
                      {s.handle}
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={site.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-3 text-[15px] text-fg/80 transition-colors hover:text-accent"
                >
                  <TechIcon icon="github" name="GitHub" size={16} />
                  {t("source")}
                </a>
              </li>
            </ul>
          </div>

          {/* Colophon */}
          <div className="md:col-span-2">
            <p className="eyebrow mb-5">{t("colophon")}</p>
            <ul className="flex flex-col gap-2.5 font-mono text-xs text-muted">
              {["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "R3F · Three.js", "Motion"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("rights", { year })}</p>
          <div className="flex items-center gap-6">
            <a
              href="#top"
              className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.16em] transition-colors hover:text-accent"
            >
              {t("backToTop")}
              <ArrowUp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
