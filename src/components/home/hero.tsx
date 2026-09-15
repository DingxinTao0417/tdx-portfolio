"use client";

import { ArrowDown, Download } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { resumeUrlFor } from "@/data/site";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const isChinese = locale === "zh";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden pt-28 sm:pt-32 lg:pt-28"
      aria-labelledby="hero-title"
    >
      {/* Atmosphere */}
      <div className="grid-bg pointer-events-none absolute inset-0 -z-20 opacity-40" />
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{ backgroundImage: "var(--hero-glow)" }}
      />

      <div
        className="container-x relative grid items-center gap-10 pb-16 lg:min-h-[calc(min(100svh,960px)-7rem)] lg:grid-cols-2 lg:gap-14 lg:pt-8 lg:pb-24"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.p
            data-reveal
            className="eyebrow mb-7 flex items-center gap-3 leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
          >
            <span className="inline-block h-px w-8 bg-accent" />
            {t("eyebrow")}
          </motion.p>

          <h1
            id="hero-title"
            className={cn(
              "font-display font-semibold",
              isChinese
                ? "text-[clamp(1.8rem,4vw,3.65rem)] leading-[1.28] tracking-[-0.035em] sm:text-[clamp(2.5rem,4vw,3.65rem)]"
                : "text-[clamp(2.8rem,5.4vw,4.8rem)] leading-[1.08] tracking-[-0.04em]",
            )}
          >
            <span className="block overflow-hidden">
              <motion.span
                data-reveal
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.2 }}
              >
                {t("headline1")}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span
                data-reveal
                className="block font-serif font-normal italic tracking-[-0.01em] text-accent"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.32 }}
              >
                {t("headline2")}
              </motion.span>
            </span>
          </h1>

          <motion.p
            data-reveal
            className="mt-7 max-w-[34rem] text-[15px] leading-[1.95] text-muted sm:text-base lg:max-w-[30rem] lg:pr-6 xl:max-w-[34rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.5 }}
          >
            {t("intro")}
          </motion.p>

          <motion.div
            data-reveal
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.62 }}
          >
            <Magnetic>
              <ButtonLink href="/projects" size="lg" arrow>
                {t("ctaPrimary")}
              </ButtonLink>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href={resumeUrlFor(locale)}
                download
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                <Download className="h-4 w-4" aria-hidden />
                {t("ctaResume")}
              </a>
            </Magnetic>
          </motion.div>
        </div>
        <HeroCanvas className="mx-auto w-full max-w-[38rem] lg:max-w-none" />
      </div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-7 hidden lg:block"
        aria-hidden
      >
        <div className="container-x flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <ArrowDown className="h-3.5 w-3.5 text-accent" />
          {t("scrollHint")}
          <span className="ml-3 h-px flex-1 bg-line" />
        </div>
      </motion.div>
    </section>
  );
}
