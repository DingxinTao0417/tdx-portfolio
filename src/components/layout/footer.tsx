import { ArrowUp, Mail } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/button";
import { TechIcon } from "@/components/ui/tech-icon";
import { WeChatDialog } from "@/components/contact/wechat-dialog";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-line bg-bg-elevated/50 sm:mt-20">
      <div className="container-x">
        {/* CTA band */}
        <div className="flex flex-col gap-7 py-12 md:flex-row md:items-center md:justify-between sm:py-16">
          <h2 className="max-w-2xl font-display text-2xl font-medium leading-[1.35] tracking-tight sm:text-3xl lg:text-4xl">
            {t("tagline")}{" "}
            <span className="font-serif font-normal italic text-accent">{t("taglineAccent")}</span>
          </h2>
          <ButtonLink href="/contact" size="lg" arrow>
            {t("cta")}
          </ButtonLink>
        </div>

        <div className="grid gap-x-10 gap-y-8 border-t border-line py-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-fg font-display text-sm font-bold text-bg">
                {site.initials}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg font-semibold tracking-tight">
                  {locale === "zh" ? site.nameZh : site.name}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  AI Native Developer
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[13px] leading-[1.85] text-muted">{t("colophonBody")}</p>
          </div>

          {/* Navigate */}
          <div className="lg:col-span-3">
            <p className="eyebrow mb-5">{t("navigate")}</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="min-w-0 lg:col-span-4">
            <p className="eyebrow mb-5">{t("connect")}</p>
            <ul className="flex flex-col gap-3">
              <li>
                <WeChatDialog compact label={t("wechat")} />
              </li>
              {site.socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="group inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted transition-colors hover:text-accent"
                  >
                    {s.id === "email" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <TechIcon icon={s.id} name={s.label} size={16} />
                    )}
                    <span>{s.label}</span>
                    <span className="break-all font-mono text-[10px] text-muted transition-colors group-hover:text-accent">
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
                  className="inline-flex items-center gap-3 text-sm text-muted transition-colors hover:text-accent"
                >
                  <TechIcon icon="github" name="GitHub" size={16} />
                  {t("source")}
                </a>
              </li>
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
