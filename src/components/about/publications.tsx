import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Odometer } from "@/components/fx/odometer";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { publications } from "@/data/publications";
import { pick } from "@/data/types";

const link = "group/link inline-flex min-h-11 items-center gap-1.5 text-sm transition-colors";

/** Diagonal arrow swap on hover/focus of the nearest `group/link`. */
function RollArrow() {
  const move = "absolute h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";
  return (
    <span aria-hidden className="relative inline-grid h-3.5 w-3.5 place-items-center overflow-hidden">
      <ArrowUpRight className={`${move} group-hover/link:translate-x-3.5 group-hover/link:-translate-y-3.5 group-focus-visible/link:translate-x-3.5 group-focus-visible/link:-translate-y-3.5`} />
      <ArrowUpRight className={`${move} -translate-x-3.5 translate-y-3.5 group-hover/link:translate-x-0 group-hover/link:translate-y-0 group-focus-visible/link:translate-x-0 group-focus-visible/link:translate-y-0`} />
    </span>
  );
}

export async function Publications() {
  const locale = await getLocale();
  const t = await getTranslations("About.publications");

  return (
    <section id="publications" className="container-x scroll-mt-28 py-16 lg:py-24" aria-label={t("title")}>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} body={t("intro")} size="md" />
      <ol className="mt-8 border-t border-line sm:mt-10">
        {publications.map((paper, index) => (
          <Reveal
            key={paper.id}
            as="li"
            delay={index * 0.08}
            className="group/pub relative isolate grid gap-4 border-b border-line py-7 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-6 sm:py-9 lg:gap-10"
          >
            {/* Hover: a soft sweep fills the row and an accent rule draws along its base. */}
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -inset-x-3 -z-10 origin-left scale-x-0 rounded-xl bg-accent-soft transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/pub:scale-x-100 sm:-inset-x-5" />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/pub:scale-x-100" />
            <span aria-hidden className="text-outline pointer-events-none absolute right-0 top-8 hidden font-display text-7xl font-semibold leading-none tracking-[-0.04em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/pub:-translate-x-3 group-hover/pub:text-outline-accent xl:block">
              {String(index + 1).padStart(2, "0")}
            </span>
            <time dateTime={paper.year} className="font-mono text-sm text-accent transition-transform duration-500 group-hover/pub:translate-x-1 sm:pt-1">
              <Odometer value={paper.year} duration={1.4} />
            </time>
            <article className="min-w-0 max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-relaxed text-muted">
                <span>{pick(paper.kind, locale)}</span>
                <span className="h-1 w-1 rounded-full bg-line-strong transition-colors group-hover/pub:bg-accent" aria-hidden />
                <span>{pick(paper.authorship, locale)}</span>
              </div>
              <h3 className="font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                <a
                  href={paper.publisherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size,color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-accent focus-visible:bg-[length:100%_1px] group-hover/pub:bg-[length:100%_1px]"
                >
                  {pick(paper.title, locale)}
                </a>
              </h3>
              {locale === "zh" && <p lang="en" className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{paper.title.en}</p>}
              <p className="mt-4 text-xs leading-relaxed text-muted">
                <span className="sr-only">{t("authors")}: </span>
                {paper.authors.map((author, i) => (
                  <span key={author}>
                    {i > 0 && " · "}
                    <span className={author === "Dingxin Tao" ? "font-medium text-fg" : undefined}>{author}</span>
                  </span>
                ))}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                <span lang="en">{paper.citation}</span> · {t("proceedings")}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-[1.8] text-fg/85">{pick(paper.description, locale)}</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                <a href={paper.publisherUrl} target="_blank" rel="noopener noreferrer" className={`${link} font-medium text-accent hover:text-accent-strong`}>
                  {t("publisher")}
                  <RollArrow />
                </a>
                <a href={paper.researchGateUrl} target="_blank" rel="noopener noreferrer" className={`${link} text-muted hover:text-fg`}>
                  ResearchGate
                  <RollArrow />
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
