import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { BorderBeam } from "@/components/fx/border-beam";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SplitText } from "@/components/fx/split-text";
import { SpotlightGroup } from "@/components/fx/spotlight";
import { FxTrigger } from "@/components/fx/trigger";
import { DepthCard } from "@/components/home/showcase/depth-card";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import styles from "./what-i-do.module.css";

// `delay` (s) offsets each card's reveal from its bento neighbours.
const cards = [
  { image: "/images/home/feature-ai.webp", href: "/projects/conuo", layout: "tall", cursor: "view", delay: 0 },
  { image: "/images/home/feature-fullstack.webp", href: "/projects/opc-workspace", layout: "wide", cursor: "view", delay: 0.1 },
  { image: "/images/home/feature-fde.webp", href: "/learn/fde", layout: "compact", cursor: "open", delay: 0.05 },
  { image: "/images/home/feature-notes.webp", href: "/blog", layout: "compact", cursor: "read", delay: 0.15 },
] as const;

type Item = { title: string; body: string; label: string; cta: string };
type Card = (typeof cards)[number];

export function WhatIDo() {
  const t = useTranslations("Home.whatIDo");
  const cursor = useTranslations("FX.common.cursor");
  const items = t.raw("items") as Item[];

  return (
    <section id="development" className="container-x section-space scroll-mt-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleAccent")} />
        <Magnetic>
          <ButtonLink href="/projects" variant="secondary" arrow>{t("cta")}</ButtonLink>
        </Magnetic>
      </div>

      <SpotlightGroup className="relative isolate mt-8 sm:mt-10">
        <div
          aria-hidden
          data-fx-spot=""
          className="fx-spot-lit fx-grid-lit pointer-events-none absolute -inset-x-4 -inset-y-8 -z-10 sm:-inset-x-8"
        />
        <div className={styles.grid} data-feature-cards>
          {items.map((item, i) => {
            const card = cards[i];
            if (!card) return null;
            return <BentoCard key={card.image} item={item} card={card} index={i} cursorText={cursor(card.cursor)} />;
          })}
        </div>
      </SpotlightGroup>
    </section>
  );
}

function BentoCard({ item, card, index, cursorText }: { item: Item; card: Card; index: number; cursorText: string }) {
  return (
    <FxTrigger
      as="article"
      amount={card.layout === "tall" ? 0.12 : 0.25}
      className={cn(styles.cell, styles[card.layout])}
      style={{ "--delay": `${card.delay}s` } as CSSProperties}
    >
      {/* The curtain clips this wrapper, not the observed article: IntersectionObserver measures
          a target through its own clip-path, so a clipped article would never count as visible. */}
      <div className={styles.reveal}>
        <DepthCard className={styles.card} cursorText={cursorText}>
          <span className={styles.shadow} aria-hidden />
          <div className={styles.media} aria-hidden>
            <div className={styles.zoom}>
              <Image
                src={card.image}
                alt=""
                fill
                sizes={card.layout === "wide" ? "(min-width: 1280px) 780px, (min-width: 768px) 66vw, 100vw" : "(min-width: 1280px) 380px, (min-width: 768px) 33vw, 100vw"}
                className={styles.artwork}
              />
            </div>
          </div>
          <span className={styles.lamp} aria-hidden />
          {card.layout === "tall" && <BorderBeam duration={9} size={90} />}
          {/* Whole-card hit area; the visible CTA below stays the one keyboard and AT stop. */}
          <Link href={card.href} tabIndex={-1} aria-hidden className={styles.overlay} />
          <div className={cn(styles.plane, styles.meta)}>
            <p className={styles.metaRow}>
              <ScrambleText text={`0${index + 1}`} delay={card.delay + 0.7} className="font-mono text-xs" />
              <span
                className={cn("fx-line", styles.rule)}
                style={{ "--fx-line-delay": `${card.delay + 0.55}s` } as CSSProperties}
              />
              <ScrambleText text={item.label} trigger="hover" />
            </p>
          </div>
          <div className={cn(styles.plane, styles.content)}>
            <div className={styles.copy}>
              <h3 className="font-display text-2xl font-medium tracking-tight lg:text-[1.75rem]">
                <SplitText text={item.title} delay={card.delay + 0.3} />
              </h3>
              <p className={cn(styles.description, styles.rise)}>{item.body}</p>
              <Link
                href={card.href}
                className={cn(styles.glass, styles.cta, styles.rise, "mt-5 rounded-xl px-4 py-2.5 text-[13px] text-white/90")}
              >
                {item.cta}
                <span className={styles.arrow} aria-hidden>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </DepthCard>
      </div>
    </FxTrigger>
  );
}
