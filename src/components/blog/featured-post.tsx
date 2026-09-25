"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SplitText } from "@/components/fx/split-text";
import { SpotlightCard } from "@/components/fx/spotlight";
import { TextRoll } from "@/components/fx/text-roll";
import { FxTrigger } from "@/components/fx/trigger";
import { Link } from "@/i18n/navigation";
import type { PostMeta } from "@/lib/blog";
import { cn, formatDate } from "@/lib/utils";
import { FloatingCover } from "./floating-cover";

/** The newest post as an editorial spread: floating cover on a dot-grid stage, headline rising in. */
export function FeaturedPost({ post, locale, minRead, total }: { post: PostMeta; locale: string; minRead: string; total: number }) {
  const t = useTranslations("Blog");
  const fx = useTranslations("FX.blog");
  const cursor = useTranslations("FX.common.cursor");

  return (
    <Link
      href={`/blog/${post.slug}`}
      aria-label={`${t("latest")} · ${post.title}`}
      data-cursor-text={cursor("read")}
      className="fx-roll-host group/feat block rounded-3xl"
    >
      <SpotlightCard
        className={cn(
          "grid overflow-hidden rounded-3xl border border-line bg-bg-elevated transition-[border-color,box-shadow] duration-500 group-hover/feat:border-accent/40 group-hover/feat:shadow-soft",
          post.cover && "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
        )}
      >
        {post.cover && (
          <div className="relative isolate overflow-hidden border-b border-line px-5 pb-8 pt-12 sm:px-10 sm:pb-12 sm:pt-14 lg:border-b-0 lg:border-r">
            <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10 opacity-50 mask-fade-y" />
            <div
              aria-hidden="true"
              className="absolute inset-x-5 top-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:inset-x-10 sm:top-5"
            >
              <span>
                <span className="text-accent">●</span> fig.01
              </span>
              <span className="tabular-nums">1536 × 1024</span>
            </div>
            <FloatingCover slug={post.slug} src={post.cover} alt={post.coverAlt ?? ""} sizes="(max-width: 1023px) 90vw, 640px" />
          </div>
        )}
        <FxTrigger className="flex flex-col p-6 sm:p-8 lg:p-10">
          <p className="eyebrow flex items-center gap-3 text-accent">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-accent" />
            </span>
            <ScrambleText text={t("latest")} />
            <span aria-hidden="true" className="ml-auto font-mono tabular-nums text-muted">
              01 / {String(total).padStart(2, "0")}
            </span>
          </p>
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-[1.25] tracking-[-0.02em] sm:text-3xl lg:text-[2.15rem]">
            <SplitText text={post.title} delay={0.1} stagger={0.035} />
          </h3>
          <p className="mb-8 mt-4 line-clamp-3 text-sm leading-7 text-muted sm:text-[15px]">{post.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-5 font-mono text-[11px] text-muted">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
              {minRead}
            </span>
            <span className="ml-auto inline-flex h-11 items-center gap-3 rounded-full bg-fg pl-5 pr-1.5 font-sans text-sm font-medium text-bg transition-colors duration-300 group-hover/feat:bg-accent group-hover/feat:text-(--fx-on-accent)">
              <TextRoll>{fx("readArticle")}</TextRoll>
              <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-bg/15">
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/feat:rotate-45"
                />
              </span>
            </span>
          </div>
        </FxTrigger>
      </SpotlightCard>
    </Link>
  );
}
