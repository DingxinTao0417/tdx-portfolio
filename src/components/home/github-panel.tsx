import { GitFork, Star } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { site } from "@/data/site";
import { getGitHubSnapshot } from "@/lib/github";
import { formatDate } from "@/lib/utils";

export async function GitHubPanel() {
  const t = await getTranslations("Home.github");
  const locale = await getLocale();
  const data = await getGitHubSnapshot();

  return (
    <section className="container-x py-24 sm:py-32">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          accent={t("titleAccent")}
          body={t("body")}
        />
      </div>

      <Reveal className="mt-12">
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Profile */}
          <a
            href={data?.profile.htmlUrl ?? `https://github.com/${site.handle}`}
            target="_blank"
            rel="noreferrer noopener"
            className="group relative flex flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-line bg-fg p-7 text-bg lg:col-span-4"
          >
            <div className="grid-bg-dense pointer-events-none absolute inset-0 opacity-40 [--grid:rgba(255,255,255,0.08)]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/40 blur-3xl transition-transform duration-700 group-hover:scale-125" />
            <div className="relative flex items-center gap-4">
              <Image
                src={data?.profile.avatarUrl ?? `https://github.com/${site.handle}.png`}
                alt={site.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl border border-white/10"
              />
              <div className="flex flex-col">
                <span className="font-display text-xl font-semibold">{data?.profile.name ?? site.name}</span>
                <span className="font-mono text-xs text-bg/60">@{data?.profile.login ?? site.handle}</span>
              </div>
              <TechIcon icon="github" name="GitHub" size={22} className="ml-auto text-bg/80" />
            </div>
            <div className="relative grid grid-cols-3 gap-4">
              {[
                { v: data?.profile.publicRepos, l: t("repos") },
                { v: data?.profile.followers, l: t("followers") },
                { v: data?.profile.following, l: t("following") },
              ].map((s) => (
                <div key={s.l} className="flex flex-col">
                  <span className="font-display text-3xl font-bold tabular-nums">{s.v ?? "—"}</span>
                  <span className="text-xs text-bg/60">{s.l}</span>
                </div>
              ))}
            </div>
            <div className="relative flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-bg/60">
              <span>
                {t("since")} {data ? new Date(data.profile.createdAt).getFullYear() : "—"}
              </span>
              <span className="text-accent transition-transform duration-300 group-hover:translate-x-1">
                {t("viewProfile")} →
              </span>
            </div>
          </a>

          {/* Repos */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {data ? (
              data.repos.map((repo) => (
                <a
                  key={repo.fullName}
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex flex-col gap-3 rounded-3xl border border-line bg-bg-elevated p-6 transition-[border-color,box-shadow] duration-500 hover:border-accent/50 hover:shadow-glow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-sm font-medium text-fg">{repo.name}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      {formatDate(repo.pushedAt, locale)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                    {repo.description ?? "—"}
                  </p>
                  <div className="mt-auto flex items-center gap-4 pt-2 font-mono text-xs text-muted">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" /> {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5" /> {repo.forks}
                    </span>
                  </div>
                </a>
              ))
            ) : (
              <div className="flex items-center justify-center rounded-3xl border border-dashed border-line p-10 text-sm text-muted sm:col-span-2">
                {t("unavailable")}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function GitHubPanelSkeleton() {
  return (
    <section className="container-x py-24 sm:py-32" aria-hidden>
      <div className="h-8 w-40 animate-pulse rounded-full bg-line" />
      <div className="mt-6 h-14 w-2/3 animate-pulse rounded-2xl bg-line" />
      <div className="mt-12 grid gap-5 lg:grid-cols-12">
        <div className="h-72 animate-pulse rounded-3xl bg-line lg:col-span-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-line" />
          ))}
        </div>
      </div>
    </section>
  );
}
