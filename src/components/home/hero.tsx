"use client";

import { ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("Home");
  const isChinese = useLocale() === "zh";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[100svh] overflow-hidden pt-28 sm:pt-32 short:pt-28"
      aria-labelledby="hero-title"
    >
      {/* Atmosphere */}
      <div className="grid-bg pointer-events-none absolute inset-0 -z-20" />
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{ backgroundImage: "var(--hero-glow)" }}
      />

      {/* 3D scene — sits right on desktop, behind the copy on mobile */}
      <div className="pointer-events-none absolute inset-0 -z-10 lg:pointer-events-auto">
        <HeroCanvas
          progress={scrollYProgress}
          className="absolute inset-x-0 top-[38%] h-[70vh] opacity-70 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[58%] lg:opacity-100 lg:[mask-image:linear-gradient(to_right,transparent,black_16%)]"
        />
      </div>

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="container-x relative flex min-h-[calc(100svh-7rem)] flex-col justify-center pb-24 sm:min-h-[calc(100svh-8rem)] short:min-h-[calc(100svh-7rem)] short:pb-12"
      >
        <div className={cn("max-w-3xl", isChinese && "max-w-[50rem]")}>
          <motion.p
            className="eyebrow mb-6 flex items-center gap-3 short:mb-4"
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
              "font-display font-bold",
              isChinese
                ? "text-[clamp(2.6rem,4.5vw,4.5rem)] leading-[1.05] tracking-[-0.025em] short:text-[clamp(2.4rem,min(4.5vw,9svh),4.5rem)]"
                : "text-[clamp(2.6rem,7.2vw,6.2rem)] leading-[0.98] tracking-[-0.03em] short:text-[clamp(2.4rem,min(7.2vw,10.5svh),6.2rem)]",
            )}
          >
            <span className="block overflow-hidden">
              <motion.span
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
            className="mt-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg short:mt-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.5 }}
          >
            {t("intro")}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4 short:mt-6"
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
              <ButtonLink href="/contact" size="lg" variant="secondary">
                {t("ctaSecondary")}
              </ButtonLink>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:flex short:bottom-4"
        aria-hidden
      >
        <span className="animate-float">
          <ArrowDown className="h-3.5 w-3.5" />
        </span>
        {t("scrollHint")}
      </motion.div>
    </section>
  );
}
