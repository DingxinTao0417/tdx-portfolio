import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  // Default locale stays at `/`; only non-default locales get a prefix (`/zh`).
  localePrefix: "as-needed",
  // Do not infer locale from cookie / Accept-Language — `/` must not redirect.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, { short: string; native: string }> = {
  en: { short: "EN", native: "English" },
  zh: { short: "中", native: "中文" },
};
