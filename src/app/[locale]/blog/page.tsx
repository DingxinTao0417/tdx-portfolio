import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PostCard } from "@/components/blog/post-card";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { getAllPosts } from "@/lib/blog";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("blog"),
    description: t("blogDescription"),
    alternates: {
      canonical: localizedPath(locale, "/blog"),
      languages: languageAlternates("/blog"),
    },
  };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getTranslations("Blog");
  const tc = await getTranslations("Common");
  const posts = await getAllPosts(locale);
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        body={t("intro")}
      />

      <section className="container-x pb-24 pt-10">
        {posts.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line p-12 text-center text-muted">
            {t("empty")}
          </p>
        ) : (
          <>
            <Reveal>
              <p className="eyebrow mb-6 flex items-center gap-3">
                <span className="inline-block h-px w-6 bg-accent" />
                {t("latest")}
              </p>
              <PostCard
                post={featured}
                locale={locale}
                minRead={tc("minRead", { minutes: featured.readingMinutes })}
                featured
              />
            </Reveal>

            {rest.length > 0 && (
              <>
                <p className="eyebrow mb-6 mt-16 flex items-center gap-3">
                  <span className="inline-block h-px w-6 bg-accent" />
                  {t("allPosts")}
                </p>
                <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <StaggerItem key={post.slug} className="h-full">
                      <PostCard
                        post={post}
                        locale={locale}
                        minRead={tc("minRead", { minutes: post.readingMinutes })}
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
