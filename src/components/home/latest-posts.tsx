import { getLocale, getTranslations } from "next-intl/server";
import { PostCard } from "@/components/blog/post-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { getAllPosts } from "@/lib/blog";

export async function LatestPosts() {
  const t = await getTranslations("Home.writing");
  const tc = await getTranslations("Common");
  const locale = await getLocale();
  const posts = (await getAllPosts(locale)).slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="container-x py-24 sm:py-32">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleAccent")} />
        <ButtonLink href="/blog" variant="secondary" arrow className="shrink-0">
          {t("cta")}
        </ButtonLink>
      </div>
      <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <StaggerItem key={post.slug} className="h-full">
            <PostCard
              post={post}
              locale={locale}
              minRead={tc("minRead", { minutes: post.readingMinutes })}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
