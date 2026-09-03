import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  Instrument_Sans,
  Instrument_Serif,
  Noto_Sans_SC,
} from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { CustomCursor } from "@/components/providers/custom-cursor";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site } from "@/data/site";
import { languageAlternates, localizedPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import "../globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const zh = Noto_Sans_SC({
  variable: "--font-zh",
  display: "swap",
  preload: false,
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");
  const ogImage = `/api/og?title=${encodeURIComponent(site.name)}&subtitle=${encodeURIComponent(
    locale === "zh" ? "AI 全栈开发工程师 · FDE" : "AI Full-Stack Engineer · FDE",
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
      "AI engineer",
      "Forward Deployed Engineer",
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
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${serif.variable} ${mono.variable} ${zh.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <NextIntlClientProvider>
            <div id="top" />
            <ScrollProgress />
            <SmoothScroll />
            <CustomCursor />
            <div className="grain-overlay" aria-hidden />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
