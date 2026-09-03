import { site } from "@/data/site";
import { routing } from "./routing";

function prefixMode(): string {
  const lp: unknown = routing.localePrefix;
  return typeof lp === "object" && lp !== null && "mode" in lp
    ? String((lp as { mode: string }).mode)
    : String(lp ?? "always");
}

/**
 * External pathname for a route in a given locale, honoring `localePrefix`.
 * `as-needed` → default locale has no prefix ("/about"), others do ("/zh/about").
 */
export function localizedPath(locale: string, path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  const mode = prefixMode();
  const omitPrefix = mode === "never" || (mode === "as-needed" && locale === routing.defaultLocale);
  return omitPrefix ? clean || "/" : `/${locale}${clean}`;
}

export function absoluteUrl(locale: string, path: string): string {
  return `${site.url}${localizedPath(locale, path)}`;
}

/** `alternates.languages` map for Next metadata, including x-default. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((l) => [l, localizedPath(l, path)])),
    "x-default": localizedPath(routing.defaultLocale, path),
  };
}
