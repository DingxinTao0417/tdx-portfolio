import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ViewTransition } from "react";
import { NextPost } from "@/components/blog/next-post";
import { PostCard } from "@/components/blog/post-card";
import { ShareButton } from "@/components/blog/share-button";
import { TableOfContents, TocDisclosure } from "@/components/blog/table-of-contents";
import { ZoomImage } from "@/components/blog/zoom-image";
import { Aurora } from "@/components/fx/aurora";
import { ScrambleText } from "@/components/fx/scramble-text";
import { isCjk } from "@/components/fx/split";
import { SplitText } from "@/components/fx/split-text";
import { TextRoll } from "@/components/fx/text-roll";
import { FxTrigger } from "@/components/fx/trigger";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { site } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { absoluteUrl, languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { getAllPosts, getAllSlugs, getPost } from "@/lib/blog";
import { extractToc, renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import "./post-fx.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) return {};
  const og = post.cover ?? `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(
    post.description,
  )}&locale=${locale}&hue=${post.hue}&kind=post`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: localizedPath(locale, `/blog/${slug}`),
      languages: languageAlternates(`/blog/${slug}`),
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [site.name],
      tags: post.tags,
      images: [{ url: og, width: post.cover ? 1536 : 1200, height: post.cover ? 1024 : 630, alt: post.coverAlt ?? post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [og] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations("Blog");
  const tc = await getTranslations("Common");
  const fx = await getTranslations("FX.blog");
  const [content, toc, all] = await Promise.all([
    renderMdx(post.content),
    Promise.resolve(extractToc(post.content)),
    getAllPosts(locale),
  ]);
  // Posts are newest first: "next" continues into the archive and wraps around to the newest.
  const index = all.findIndex((p) => p.slug === post.slug);
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;
  const related = all.filter((p) => p.slug !== post.slug && p.slug !== next?.slug).slice(0, 2);
  const cjkTitle = Array.from(post.title).some(isCjk);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: post.cover ? new URL(post.cover, site.url).toString() : undefined,
    dateModified: post.updated ?? post.date,
    inLanguage: locale === "zh" ? "zh-CN" : "en-US",
    author: { "@type": "Person", name: site.name, url: site.url },
    keywords: post.tags.join(", "),
    url: absoluteUrl(locale, `/blog/${post.slug}`),
  };

  return (
    <article className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="relative isolate overflow-hidden pt-28 sm:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: "var(--hero-glow)" }} />
        <Aurora className="-z-10" intensity={0.55} />
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="container-x">
          <Reveal>
            <Link
              href="/blog"
              className="fx-roll-host group/back inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/back:-translate-x-1" />
              <TextRoll>{tc("backToBlog")}</TextRoll>
            </Link>
          </Reveal>
          <FxTrigger className="mt-8 max-w-4xl">
            <Reveal delay={0.05}>
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <Tag key={tag} tone="accent">
                    {tag}
                  </Tag>
                ))}
                {post.fallback && <Tag>{post.locale.toUpperCase()}</Tag>}
              </div>
            </Reveal>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-[1.3] tracking-tight sm:text-4xl lg:text-5xl">
              <SplitText text={post.title} delay={0.12} stagger={cjkTitle ? 0.028 : 0.045} />
            </h1>
            <Reveal delay={0.3}>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {post.description}
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="relative mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 py-4 text-xs text-muted">
                <span aria-hidden className="fx-line absolute inset-x-0 top-0 h-px bg-line-strong [--fx-line-delay:0.35s]" />
                <span aria-hidden className="fx-line absolute inset-x-0 bottom-0 h-px bg-line [--fx-line-delay:0.5s]" />
                <span>
                  {t("writtenBy")} <span className="text-fg">{site.name}</span>
                </span>
                <span>
                  {tc("published")}{" "}
                  <time dateTime={post.date} className="text-fg">
                    {formatDate(post.date, locale)}
                  </time>
                </span>
                <span className="flex items-center gap-2">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
                  {tc("minRead", { minutes: post.readingMinutes })}
                </span>
                <div className="ml-auto">
                  <ShareButton label={t("share")} copiedLabel={tc("copied")} />
                </div>
              </div>
            </Reveal>
          </FxTrigger>
        </div>
      </header>

      <div className="container-x mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
        <div className="min-w-0 max-w-[46rem]">
          {toc.length > 0 && <TocDisclosure items={toc} label={tc("tableOfContents")} className="mb-10 lg:hidden" />}
          {post.cover && (
            // No entrance of its own: it arrives by morphing from the card that was clicked.
            <ViewTransition name={`post-cover-${post.slug}`} share="morph" default="none">
              <ZoomImage src={post.cover} alt={post.coverAlt ?? ""} className="mb-10 overflow-hidden rounded-xl border border-line">
                <Image
                  src={post.cover}
                  alt={post.coverAlt ?? ""}
                  width={1536}
                  height={1024}
                  loading="eager"
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 90vw, 736px"
                  className="h-auto w-full bg-[#f6f3ed]"
                />
              </ZoomImage>
            </ViewTransition>
          )}
          <div data-reading-root className="prose-tdx pfx-prose">{content}</div>
          <FxTrigger className="mt-14 flex items-center gap-4">
            <span aria-hidden className="fx-line h-px flex-1 bg-line-strong" />
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              <span aria-hidden className="text-accent">∎</span>
              <ScrambleText text={fx("endOfArticle")} />
            </p>
            <span aria-hidden className="fx-line h-px flex-1 origin-right bg-line-strong" />
            <ShareButton label={t("share")} copiedLabel={tc("copied")} />
          </FxTrigger>
        </div>
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-line bg-bg-elevated/70 p-5 backdrop-blur-sm">
              <TableOfContents items={toc} label={tc("tableOfContents")} />
            </div>
          </aside>
        )}
      </div>

      {next && (
        <section aria-label={fx("upNext")} className="container-x mt-16 sm:mt-24">
          <Reveal variant="scale">
            <NextPost post={next} locale={locale} minRead={tc("minRead", { minutes: next.readingMinutes })} />
          </Reveal>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-x mt-16 sm:mt-24">
          <FxTrigger as="p" className="eyebrow mb-6 flex items-center gap-3">
            <span aria-hidden className="fx-line inline-block h-px w-6 bg-accent" />
            <ScrambleText text={t("relatedPosts")} />
          </FxTrigger>
          <Stagger className="grid gap-5 md:grid-cols-2">
            {related.map((p) => (
              <StaggerItem key={p.slug} className="h-full">
                <PostCard
                  post={p}
                  locale={locale}
                  minRead={tc("minRead", { minutes: p.readingMinutes })}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </article>
  );
}
