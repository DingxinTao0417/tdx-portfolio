import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PostCard } from "@/components/blog/post-card";
import { ShareButton } from "@/components/blog/share-button";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { site } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { absoluteUrl, languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { getAllPosts, getAllSlugs, getPost } from "@/lib/blog";
import { extractToc, renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) return {};
  const og = `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(
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
      images: [{ url: og, width: 1200, height: 630 }],
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
  const [content, toc, all] = await Promise.all([
    renderMdx(post.content),
    Promise.resolve(extractToc(post.content)),
    getAllPosts(locale),
  ]);
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
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
      <header className="relative isolate pt-28 sm:pt-36">
        <div className="container-x">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {tc("backToBlog")}
            </Link>
          </Reveal>
          <div className="mt-8 max-w-4xl">
            <Reveal delay={0.05}>
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <Tag key={tag} tone="accent">
                    {tag}
                  </Tag>
                ))}
                {post.fallback && <Tag>EN</Tag>}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-[1.3] tracking-tight sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {post.description}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4 text-xs text-muted">
                <span>
                  {t("writtenBy")} <span className="text-fg">{site.name}</span>
                </span>
                <span>
                  {tc("published")}{" "}
                  <time dateTime={post.date} className="text-fg">
                    {formatDate(post.date, locale)}
                  </time>
                </span>
                <span>{tc("minRead", { minutes: post.readingMinutes })}</span>
                <span className="ml-auto">
                  <ShareButton label={t("share")} copiedLabel={tc("copied")} />
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <div className="container-x mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
        {toc.length > 0 && (
          <details className="rounded-xl border border-line bg-bg-elevated p-5 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">{tc("tableOfContents")}</summary>
            <nav aria-label={tc("tableOfContents")} className="mt-4 border-t border-line pt-3">
              <ul className="space-y-1">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className={`block py-2 text-sm text-muted hover:text-accent ${item.depth === 3 ? "pl-4" : ""}`}>{item.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        )}
        <div className="prose-tdx min-w-0 max-w-[46rem]">{content}</div>
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-xl bg-bg-elevated/70 p-5">
            <TableOfContents items={toc} label={tc("tableOfContents")} />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-x mt-16 sm:mt-24">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-6 bg-accent" />
            {t("relatedPosts")}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {related.map((p) => (
              <PostCard
                key={p.slug}
                post={p}
                locale={locale}
                minRead={tc("minRead", { minutes: p.readingMinutes })}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
