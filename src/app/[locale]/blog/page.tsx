import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { BlogExplorer } from "@/components/blog/blog-explorer";
import { PageHeader } from "@/components/ui/page-header";
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
  const posts = await getAllPosts(locale);

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        accent={t("titleAccent")}
        body={t("intro")}
      />

      <section className="container-x pb-16 pt-2 sm:pb-24">
        <BlogExplorer posts={posts} locale={locale} />
      </section>
    </>
  );
}
