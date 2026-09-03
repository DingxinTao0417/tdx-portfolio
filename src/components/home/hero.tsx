"use client";

import { ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { HeroCanvas } from "@/components/three/hero-canvas";
import type { Phase } from "@/components/three/hero-targets";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("Home");
  const ref = useRef<HTMLElement>(null);
  // Live readout from the particle field; null until WebGL is up.
  const [telemetry, setTelemetry] = useState<{ phase: Phase; count: number } | null>(null);
  const onPhase = useCallback((phase: Phase, count: number) => {
    setTelemetry({ phase, count });
  }, []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const hudOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

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
          onPhase={onPhase}
          className="absolute inset-x-0 top-[38%] h-[70vh] opacity-70 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[58%] lg:opacity-100"
        />
      </div>

      {/* HUD labels */}
      <motion.div
        style={{ opacity: hudOpacity }}
        className="pointer-events-none absolute inset-x-0 top-24 hidden lg:block"
        aria-hidden
      >
        <div className="container-x flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("hud.location")}
          </span>
          <span className="inline-flex items-center gap-2">
            {t("hud.state")}
            <span className="text-fg/40">·</span>
            {telemetry ? (
              <motion.span
                key={telemetry.phase}
                className="inline-block text-accent"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
              >
                {t(`hud.phases.${telemetry.phase}`)}
              </motion.span>
            ) : (
              <span>{t("hud.online")}</span>
            )}
          </span>
          <span>{telemetry ? t("hud.points", { count: telemetry.count }) : t("hud.render")}</span>
          <span>{t("hud.build")}</span>
        </div>
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="container-x relative flex min-h-[calc(100svh-7rem)] flex-col justify-center pb-24 sm:min-h-[calc(100svh-8rem)] short:min-h-[calc(100svh-7rem)] short:pb-12"
      >
        <div className="max-w-3xl">
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
            className="font-display text-[clamp(2.6rem,7.2vw,6.2rem)] font-bold leading-[0.98] tracking-[-0.03em] short:text-[clamp(2.4rem,min(7.2vw,10.5svh),6.2rem)]"
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

            {/* Status pill: its own row normally, joins the CTA row on short viewports. */}
            <div className="mt-8 basis-full short:mt-0 short:basis-auto">
              <motion.div
                className="inline-flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 text-sm text-fg/80 backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.85 }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
                {t("status")}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: hudOpacity }}
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
