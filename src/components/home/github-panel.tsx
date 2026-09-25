import { GitFork, LockKeyhole, Star } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { BorderBeam } from "@/components/fx/border-beam";
import { Odometer } from "@/components/fx/odometer";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SpotlightGroup } from "@/components/fx/spotlight";
import { TextRoll } from "@/components/fx/text-roll";
import { ArrowSwap } from "@/components/home/data/arrow-swap";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { TechIcon } from "@/components/ui/tech-icon";
import { GitHubContributions } from "@/components/home/github-contributions";
import { site } from "@/data/site";
import { getGitHubContributionCalendar, getGitHubSnapshot } from "@/lib/github";
import { MIN_GITHUB_CONTRIBUTION_YEAR } from "@/lib/github-contributions";
import { formatDate } from "@/lib/utils";

/** Outlined numerals on the inverted card; the stroke is the card's own foreground. */
const watermark =
  "fx-watermark pointer-events-none absolute -bottom-6 -right-2 text-[7.5rem] text-transparent sm:text-[8.5rem]";

export async function GitHubPanel() {
  const t = await getTranslations("Home.github");
  const cursor = await getTranslations("FX.common.cursor");
  const locale = await getLocale();
  const [data, contributions] = await Promise.all([getGitHubSnapshot(), getGitHubContributionCalendar()]);
  const today = new Date().toISOString().slice(0, 10);
  const currentYear = Number(today.slice(0, 4));
  const contributionYears = Array.from({ length: currentYear - MIN_GITHUB_CONTRIBUTION_YEAR + 1 }, (_, index) => currentYear - index);
  const since = data ? String(new Date(data.profile.createdAt).getFullYear()) : null;

  return (
    <section className="container-x section-space">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          accent={t("titleAccent")}
          body={t("body")}
        />
      </div>

      <Stagger className="mt-10" stagger={0.09}>
        <SpotlightGroup className="grid min-w-0 gap-5 lg:grid-cols-12">
          {/* Profile */}
          <StaggerItem variant="clip" className="lg:col-span-4">
            <a
              href={data?.profile.htmlUrl ?? `https://github.com/${site.handle}`}
              target="_blank"
              rel="noreferrer noopener"
              data-fx-spot=""
              data-cursor-text={cursor("visit")}
              className="fx-spotlight fx-roll-host group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-2xl border border-line bg-fg p-7 text-bg [--fx-spot-size:13rem]"
            >
              <span aria-hidden className="fx-spot-lit fx-grid-lit pointer-events-none absolute inset-0" />
              {since && (
                <>
                  <span aria-hidden className={`${watermark} [-webkit-text-stroke:1px_color-mix(in_oklab,var(--bg)_16%,transparent)]`}>
                    {since}
                  </span>
                  <span aria-hidden className={`${watermark} fx-spot-lit [-webkit-text-stroke:1px_var(--accent)]`}>
                    {since}
                  </span>
                </>
              )}
              <div className="relative flex items-center gap-4">
                <span className="relative flex shrink-0 rounded-2xl transition-[rotate,scale] duration-500 ease-(--fx-ease) motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-105">
                  <Image
                    src="/peach-cat-avatar.png"
                    alt={`${site.name} avatar`}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-2xl border border-white/10"
                  />
                  <BorderBeam duration={5} size={120} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="font-display text-xl font-semibold">{data?.profile.name ?? site.name}</span>
                  <span className="font-mono text-xs text-bg/60">@{data?.profile.login ?? site.handle}</span>
                </div>
                <TechIcon
                  icon="github"
                  name="GitHub"
                  size={22}
                  className="ml-auto text-bg/80 transition-[color,rotate] duration-500 ease-(--fx-ease) group-hover:text-accent motion-safe:group-hover:rotate-[360deg]"
                />
              </div>
              <div className="relative grid grid-cols-3 gap-4">
                {[
                  { v: data?.profile.publicRepos, l: t("repos") },
                  { v: data?.profile.followers, l: t("followers") },
                  { v: data?.profile.following, l: t("following") },
                ].map((s, index) => (
                  <div key={s.l} className="flex flex-col">
                    <span className="font-display text-3xl font-bold tabular-nums">
                      {s.v === undefined ? "—" : <Odometer value={String(s.v)} delay={0.2 + index * 0.1} />}
                    </span>
                    <span className="text-xs text-bg/60">{s.l}</span>
                  </div>
                ))}
              </div>
              <div className="relative flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-bg/60">
                <span>
                  {t("since")} {since ?? "—"}
                </span>
                <span className="flex items-center gap-2 text-accent [--fx-roll-to:var(--accent)]">
                  <TextRoll>{t("viewProfile")}</TextRoll>
                  <ArrowSwap className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          </StaggerItem>

          {/* Repos */}
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:col-span-8">
            {data ? (
              data.repos.map((repo, index) => {
                const details = repo.showcaseKey
                  ? [
                      t(`showcases.${repo.showcaseKey}.detailOne`),
                      t(`showcases.${repo.showcaseKey}.detailTwo`),
                      t(`showcases.${repo.showcaseKey}.detailThree`),
                    ]
                  : [];
                const external = repo.external !== false;

                return (
                  <StaggerItem key={repo.fullName} variant="scale" className="min-w-0">
                    <a
                      href={repo.htmlUrl}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer noopener" : undefined}
                      data-fx-spot=""
                      data-cursor-text={cursor(external ? "visit" : "open")}
                      className="fx-spotlight group relative flex h-full min-w-0 flex-col gap-3 rounded-2xl border border-line bg-bg-elevated/60 p-6 transition-colors duration-300 hover:border-accent/30"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-accent to-amber transition-[scale] duration-700 ease-(--fx-ease) group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-baseline gap-2.5">
                          <span aria-hidden className="font-mono text-[10px] text-muted/70 transition-colors duration-300 group-hover:text-accent">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <ScrambleText text={repo.name} trigger="hover" className="block min-w-0 truncate font-mono text-sm font-medium text-fg" />
                        </span>
                        <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                          {formatDate(repo.pushedAt, locale)}
                          <ArrowSwap className="h-3.5 w-3.5 text-accent" />
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                        {repo.showcaseKey
                          ? t(`showcases.${repo.showcaseKey}.description`)
                          : repo.description ?? "—"}
                      </p>
                      {details.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5" aria-label={t("details")}>
                          {details.map((detail, detailIndex) => (
                            <li
                              key={detail}
                              style={{ transitionDelay: `${detailIndex * 50}ms` }}
                              className="rounded-full border border-line bg-bg px-2 py-1 font-mono text-[10px] text-muted transition-[translate,border-color,color] duration-300 ease-(--fx-ease) group-hover:border-accent/30 group-hover:text-fg motion-safe:group-hover:-translate-y-0.5"
                            >
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-auto flex items-center gap-4 pt-2 font-mono text-xs text-muted">
                        {repo.visibility === "private" && (
                          <span className="flex items-center gap-1.5" title={t("private")}>
                            <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
                            {t("private")}
                          </span>
                        )}
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-accent transition-[scale,box-shadow] duration-300 group-hover:scale-125 group-hover:shadow-[0_0_0_3px_var(--accent-soft)]" />
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
                  </StaggerItem>
                );
              })
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-line p-10 text-sm text-muted sm:col-span-2">
                {t("unavailable")}
              </div>
            )}
          </div>

          <StaggerItem className="min-w-0 lg:col-span-12">
            <GitHubContributions calendar={contributions} years={contributionYears} today={today} />
          </StaggerItem>
        </SpotlightGroup>
      </Stagger>
    </section>
  );
}

export function GitHubPanelSkeleton() {
  return (
    <section className="container-x section-space" aria-hidden>
      <div className="h-8 w-40 animate-pulse rounded-full bg-line" />
      <div className="mt-6 h-14 w-2/3 animate-pulse rounded-2xl bg-line" />
      <div className="mt-12 grid gap-5 lg:grid-cols-12">
        <div className="h-72 animate-pulse rounded-2xl bg-line lg:col-span-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-line" />
          ))}
        </div>
      </div>
    </section>
  );
}
