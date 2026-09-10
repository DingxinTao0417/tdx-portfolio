"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { PostCard } from "@/components/blog/post-card";
import type { PostMeta } from "@/lib/blog";
import { POSTS_PER_PAGE, queryBlogPosts, type BlogSort } from "@/lib/blog-query";
import { cn } from "@/lib/utils";

export function BlogExplorer({ posts, locale }: { posts: PostMeta[]; locale: string }) {
  const t = useTranslations("Blog");
  const tc = useTranslations("Common");
  const controlId = useId();
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<BlogSort>("newest");
  const [page, setPage] = useState(1);
  const result = queryBlogPosts(posts, { search, sort, page, locale });
  const hasFilters = search.length > 0 || sort !== "newest";
  const visiblePages = Array.from({ length: result.totalPages }, (_, index) => index + 1)
    .filter((value) => value === 1 || value === result.totalPages || Math.abs(value - result.currentPage) <= 1);

  function reset() {
    setSearch("");
    setSort("newest");
    setPage(1);
    searchInput.current?.focus();
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    resultsHeading.current?.focus({ preventScroll: true });
    resultsHeading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  return (
    <>
      <div className="grid gap-5 border-b border-line py-6 sm:grid-cols-[minmax(0,1fr)_13rem] sm:gap-6">
        <div>
          <label htmlFor={`${controlId}-search`} className="mb-2 block text-sm font-medium">
            {t("searchLabel")}
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={searchInput}
              id={`${controlId}-search`}
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t("searchPlaceholder")}
              aria-controls={`${controlId}-results`}
              className="h-12 w-full min-w-0 rounded-xl border border-line bg-bg-elevated pl-11 pr-4 text-sm text-fg transition-colors placeholder:text-muted/80 focus:border-accent"
            />
          </div>
        </div>
        <div>
          <label htmlFor={`${controlId}-sort`} className="mb-2 block text-sm font-medium">
            {t("sortLabel")}
          </label>
          <div className="relative">
            <select
              id={`${controlId}-sort`}
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as BlogSort);
                setPage(1);
              }}
              aria-controls={`${controlId}-results`}
              className="h-12 w-full appearance-none rounded-xl border border-line bg-bg-elevated pl-4 pr-10 text-sm text-fg transition-colors focus:border-accent"
            >
              <option value="newest">{t("sortNewest")}</option>
              <option value="oldest">{t("sortOldest")}</option>
              <option value="title">{t("sortTitle")}</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </div>
      </div>

      <div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h2 ref={resultsHeading} tabIndex={-1} className="eyebrow flex scroll-mt-28 items-center gap-3">
          <span aria-hidden="true" className="inline-block h-px w-6 bg-accent" />
          {t("allPosts")}
        </h2>
        <div className="flex min-h-8 flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <p role="status" aria-live="polite" aria-atomic="true" className="text-muted">
            {result.total > 0
              ? t("resultsRange", { start: result.start, end: result.end, count: result.total })
              : t("resultsCount", { count: 0 })}
          </p>
          {hasFilters && (
            <button type="button" onClick={reset} className="min-h-8 text-accent underline underline-offset-4 hover:text-fg">
              {t("reset")}
            </button>
          )}
        </div>
      </div>

      <div id={`${controlId}-results`}>
        {result.total > 0 ? (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {result.posts.map((post) => (
              <li key={post.slug} className="h-full min-w-0">
                <PostCard
                  post={post}
                  locale={locale}
                  minRead={tc("minRead", { minutes: post.readingMinutes })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
            <SearchX aria-hidden="true" className="mx-auto mb-5 h-7 w-7 text-accent" />
            <h3 className="font-display text-xl font-semibold">{t(posts.length ? "noResults" : "empty")}</h3>
            {posts.length > 0 && (
              <>
                <p className="mt-3 text-sm leading-7 text-muted">{t("noResultsHint")}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 min-h-11 rounded-full border border-line bg-bg-elevated px-5 text-sm transition-colors hover:border-accent hover:text-accent"
                >
                  {t("reset")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {result.total > 0 && (
        <nav aria-label={t("paginationLabel")} className="mt-10 flex flex-col items-center gap-4 border-t border-line pt-7 sm:mt-12">
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            <button
              type="button"
              disabled={result.currentPage === 1}
              onClick={() => goToPage(result.currentPage - 1)}
              aria-label={t("previousPage")}
              className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line px-3 text-sm transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-fg sm:px-4"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">{t("previousPage")}</span>
            </button>
            {visiblePages.map((value, index) => (
              <span key={value} className="flex items-center gap-1 sm:gap-2">
                {index > 0 && value - visiblePages[index - 1] > 1 && (
                  <span aria-hidden="true" className="px-1 text-muted">…</span>
                )}
                <button
                  type="button"
                  onClick={() => goToPage(value)}
                  aria-label={t("goToPage", { page: value })}
                  aria-current={result.currentPage === value ? "page" : undefined}
                  className={cn(
                    "h-11 min-w-11 rounded-full border px-3 font-mono text-sm transition-colors",
                    result.currentPage === value
                      ? "border-fg bg-fg text-bg"
                      : "border-line hover:border-accent hover:text-accent",
                  )}
                >
                  {value}
                </button>
              </span>
            ))}
            <button
              type="button"
              disabled={result.currentPage === result.totalPages}
              onClick={() => goToPage(result.currentPage + 1)}
              aria-label={t("nextPage")}
              className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line px-3 text-sm transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-fg sm:px-4"
            >
              <span className="hidden sm:inline">{t("nextPage")}</span>
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
            <span>{t("pageOf", { page: result.currentPage, pages: result.totalPages })}</span>
            <span aria-hidden="true">·</span>
            <span>{t("perPage", { count: POSTS_PER_PAGE })}</span>
          </p>
        </nav>
      )}
    </>
  );
}
