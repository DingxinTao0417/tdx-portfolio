import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { publications } from "@/data/publications";
import { pick } from "@/data/types";

export async function Publications() {
  const locale = await getLocale();
  const t = await getTranslations("About.publications");

  return (
    <section id="publications" className="container-x scroll-mt-28 py-16 lg:py-24" aria-label={t("title")}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} body={t("intro")} size="md" />
      <ol className="mt-8 border-t border-line sm:mt-10">
        {publications.map((paper) => (
          <li key={paper.id} className="grid gap-4 border-b border-line py-7 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-6 sm:py-9 lg:gap-10">
            <time dateTime={paper.year} className="font-mono text-sm tabular-nums text-accent sm:pt-1">{paper.year}</time>
            <article className="min-w-0 max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-relaxed text-muted">
                <span>{pick(paper.kind, locale)}</span>
                <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden />
                <span>{pick(paper.authorship, locale)}</span>
              </div>
              <h3 className="font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                <a href={paper.publisherUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                  {pick(paper.title, locale)}
                </a>
              </h3>
              {locale === "zh" && <p lang="en" className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{paper.title.en}</p>}
              <p className="mt-4 text-xs leading-relaxed text-muted">
                <span className="sr-only">{t("authors")}: </span>
                {paper.authors.map((author, index) => (
                  <span key={author}>
                    {index > 0 && " · "}
                    <span className={author === "Dingxin Tao" ? "font-medium text-fg" : undefined}>{author}</span>
                  </span>
                ))}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                <span lang="en">{paper.citation}</span> · {t("proceedings")}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-[1.8] text-fg/85">{pick(paper.description, locale)}</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                <a href={paper.publisherUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-strong">
                  {t("publisher")}<ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
                <a href={paper.researchGateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
                  ResearchGate<ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
