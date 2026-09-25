import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Aurora } from "@/components/fx/aurora";
import { BorderBeam } from "@/components/fx/border-beam";
import { ScrambleText } from "@/components/fx/scramble-text";
import { countUnits } from "@/components/fx/split";
import { SplitText } from "@/components/fx/split-text";
import { FxTrigger } from "@/components/fx/trigger";
import { HeroGridTrail } from "@/components/home/hero/grid-trail";
import { HeroAccent } from "@/components/home/hero/hero-accent";
import { HeroScrollLayer, HeroSection } from "@/components/home/hero/hero-motion";
import styles from "@/components/home/hero/hero.module.css";
import { HeroScrollCue } from "@/components/home/hero/scroll-cue";
import { SplitLines } from "@/components/home/hero/split-lines";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";

const TITLE_DELAY = 0.12;
const TITLE_STAGGER = 0.028;
const ACCENT_STAGGER = 0.034;

/**
 * Entrance (after the intro curtain): the eyebrow decodes, headline glyphs rise from their masks,
 * the accent glints and gets underlined, the intro rises line by line, the CTAs pop, and the
 * particle stage is scanned in. Scrolling away lifts the copy and sinks the stage.
 */
export function Hero() {
  const t = useTranslations("Home");
  const isChinese = useLocale() === "zh";
  const title = t("headline1");
  const accent = t("headline2");
  const accentDelay = TITLE_DELAY + countUnits(title, "char") * TITLE_STAGGER + 0.06;
  const underlineDelay = accentDelay + countUnits(accent, "char") * ACCENT_STAGGER + 0.45;

  return (
    <HeroSection className="relative isolate overflow-hidden pt-28 sm:pt-32 lg:pt-28" aria-labelledby="hero-title">
      {/* Atmosphere: grid, glow, drifting light, and a grid that lights up around the pointer. */}
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-20 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{ backgroundImage: "var(--hero-glow)" }}
      />
      <Aurora className="-z-20" intensity={0.75} />
      <div
        aria-hidden
        data-fx-spot=""
        className="fx-spot-lit fx-grid-lit pointer-events-none absolute inset-0 -z-10 [--fx-spot-size:18rem]"
      />
      <HeroGridTrail />

      <FxTrigger
        trigger="mount"
        className="container-x relative grid items-center gap-10 pb-16 lg:min-h-[calc(min(100svh,960px)-7rem)] lg:grid-cols-2 lg:gap-14 lg:pt-8 lg:pb-24"
      >
        <HeroScrollLayer layer="copy" className="relative z-10 max-w-2xl">
          <p className="eyebrow mb-7 flex items-center gap-3 leading-relaxed">
            <span className="fx-line inline-block h-px w-8 shrink-0 bg-accent" />
            <ScrambleText text={t("eyebrow")} delay={0.08} duration={1.2} />
          </p>

          <h1
            id="hero-title"
            className={cn(
              "font-display font-semibold",
              isChinese
                ? "text-[clamp(1.8rem,4vw,3.65rem)] leading-[1.28] tracking-[-0.035em] sm:text-[clamp(2.5rem,4vw,3.65rem)]"
                : "text-[clamp(2.8rem,5.4vw,4.8rem)] leading-[1.08] tracking-[-0.04em]",
            )}
          >
            <SplitText text={title} by="char" delay={TITLE_DELAY} stagger={TITLE_STAGGER} duration={1} className="block" />{" "}
            <span className="block pb-3 font-serif font-normal italic tracking-[-0.01em] text-accent">
              <HeroAccent text={accent} delay={accentDelay} stagger={ACCENT_STAGGER} underlineDelay={underlineDelay} />
            </span>
          </h1>

          <SplitLines
            text={t("intro")}
            delay={0.55}
            className="mt-7 max-w-[34rem] text-[15px] leading-[1.95] text-muted sm:text-base lg:max-w-[30rem] lg:pr-6 xl:max-w-[34rem]"
          />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span data-reveal="" className={styles.pop} style={{ "--pop-delay": "0.95s" } as CSSProperties}>
              <Magnetic>
                <ButtonLink href="/projects" size="lg" arrow>
                  {t("ctaPrimary")}
                </ButtonLink>
              </Magnetic>
            </span>
            <span data-reveal="" className={styles.pop} style={{ "--pop-delay": "1.07s" } as CSSProperties}>
              <Magnetic strength={0.25}>
                <span className="relative inline-flex rounded-full">
                  <ButtonLink href="/contact" size="lg" variant="secondary">
                    {t("ctaSecondary")}
                  </ButtonLink>
                  <BorderBeam duration={7} size={60} />
                </span>
              </Magnetic>
            </span>
          </div>
        </HeroScrollLayer>

        <HeroScrollLayer layer="stage" className="relative mx-auto w-full max-w-[38rem] lg:max-w-none">
          <div data-reveal="" className={styles.reveal}>
            <HeroCanvas className="w-full" />
          </div>
          <span aria-hidden className={styles.scan} />
        </HeroScrollLayer>
      </FxTrigger>

      <HeroScrollCue hint={t("scrollHint")} />
    </HeroSection>
  );
}
