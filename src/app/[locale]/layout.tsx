import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { CommandPalette } from "@/components/command/command-palette";
import { Cursor } from "@/components/fx/cursor";
import { EasterEggs } from "@/components/fx/easter-eggs";
import { FX_NOSCRIPT_CSS } from "@/components/fx/noscript";
import { Preloader } from "@/components/fx/preloader";
import { Footer } from "@/components/layout/footer";
import { FooterVisibility } from "@/components/layout/footer-visibility";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { PageViewTracker } from "@/components/providers/page-view-tracker";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site } from "@/data/site";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../fonts";
import "../globals.css";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  // Stray requests such as /favicon.ico reach this segment; the layout itself then 404s.
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");
  const ogImage = `/api/og?title=${encodeURIComponent(site.name)}&subtitle=${encodeURIComponent(
    locale === "zh" ? "AI Native 开发者" : "AI Native Developer",
  )}&locale=${locale}`;

  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: t("titleTemplate") },
    description,
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    keywords: [
      "Dingxin Tao",
      "陶鼎新",
      "AI Native Developer",
      "Full-stack",
      "Next.js",
      "React",
      "UC Irvine",
      "USC",
    ],
    alternates: {
      canonical: localizedPath(locale, "/"),
      languages: languageAlternates("/"),
    },
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: localizedPath(locale, "/"),
      siteName: site.name,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b10" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <NextIntlClientProvider>
            {/* First element after the theme bootstrap script, so it paints in the right theme. */}
            <Preloader />
            <noscript>
              <style dangerouslySetInnerHTML={{ __html: FX_NOSCRIPT_CSS }} />
            </noscript>
            <div id="top" />
            <ScrollProgress />
            <SmoothScroll />
            <div className="grain-overlay" aria-hidden />
            <Cursor />
            <PageViewTracker />
            <Navbar />
            <main className="flex-1">{children}</main>
            <FooterVisibility>
              <Footer />
            </FooterVisibility>
            <CommandPalette />
            <EasterEggs />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
