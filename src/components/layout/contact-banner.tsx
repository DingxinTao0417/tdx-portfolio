import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BorderBeam } from "@/components/fx/border-beam";
import { DrawUnderline } from "@/components/fx/draw-underline";
import { Parallax } from "@/components/fx/parallax";
import { ScrambleText } from "@/components/fx/scramble-text";
import { countUnits } from "@/components/fx/split";
import { SplitText } from "@/components/fx/split-text";
import { FxTrigger } from "@/components/fx/trigger";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import styles from "./contact-banner.module.css";

const STAGGER = 0.05;

export async function ContactBanner() {
  const t = await getTranslations("Footer");
  const tagline = t("tagline");
  const accentDelay = 0.15 + countUnits(tagline) * STAGGER;

  return (
    <FxTrigger
      as="section"
      amount={0.3}
      className={cn(styles.banner, "fx-spotlight")}
      aria-labelledby="contact-banner-title"
      data-contact-banner=""
      data-fx-spot=""
    >
      <div className={styles.artwork}>
        <Parallax speed={0.08} className={styles.artworkLayer}>
          <Image
            src="/images/contact/collaboration.webp"
            alt=""
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        </Parallax>
      </div>
      <div aria-hidden="true" className={styles.glow} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-3 sm:inset-4">
        <span className="hud-corners block h-full w-full" />
      </span>
      <BorderBeam duration={9} size={80} className="inset-0" />

      <div className={styles.content}>
        <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.18em] text-white/55">
          <span className="fx-line inline-block h-px w-6 bg-[#ff9b64]" />
          <ScrambleText text={t("bannerEyebrow")} />
        </p>
        <h2
          id="contact-banner-title"
          className="mt-5 font-display text-2xl font-medium leading-[1.3] tracking-tight sm:text-3xl lg:text-[2.5rem]"
        >
          <SplitText text={tagline} stagger={STAGGER} delay={0.15} className="block" />
          <span className="relative inline-block font-serif font-normal italic text-[#ff9b64]">
            <SplitText text={t("taglineAccent")} stagger={STAGGER} delay={accentDelay} />
            <DrawUnderline delay={accentDelay + 0.35} duration={1.1} />
          </span>
        </h2>
        <Reveal delay={0.45}>
          <p className="mt-4 max-w-sm text-[13px] leading-7 text-white/70">{t("bannerBody")}</p>
          <Magnetic strength={0.3} className="mt-7">
            <ButtonLink
              href="/contact"
              variant="secondary"
              arrow
              className="border-white/30 bg-white/5 text-white backdrop-blur-sm"
            >
              {t("cta")}
            </ButtonLink>
          </Magnetic>
        </Reveal>
      </div>
    </FxTrigger>
  );
}
