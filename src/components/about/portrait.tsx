import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { BorderBeam } from "@/components/fx/border-beam";
import { ScrambleText } from "@/components/fx/scramble-text";
import { FxTrigger } from "@/components/fx/trigger";
import { LocalClock } from "@/components/layout/local-clock";
import { site } from "@/data/site";
import { pick } from "@/data/types";
import { cn } from "@/lib/utils";
import { HoloCard } from "./holo-card";
import styles from "./about.module.css";

const corners = ["tl", "tr", "bl", "br"] as const;

/**
 * The portrait as a holographic ID card: it materializes behind a scan line when revealed,
 * then tilts with foil and glare under the pointer. The portrait stays the focal point.
 */
export function Portrait() {
  const locale = useLocale();
  const t = useTranslations("FX.about.portrait");

  const hud = (
    <div aria-hidden className={styles.hud}>
      {corners.map((corner, i) => (
        <span key={corner} data-c={corner} className={styles.corner} style={{ "--i": i } as CSSProperties} />
      ))}
      <div className={cn(styles.chips, "absolute inset-x-3 top-3 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em]")}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-bg/85 px-2 py-1 text-fg">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <ScrambleText text={t("label")} delay={0.75} />
        </span>
        <span className="rounded-full bg-bg/85 px-2 py-1 normal-case tracking-[0.04em] text-muted">
          <ScrambleText text={`@${site.handle}`} delay={0.9} />
        </span>
      </div>
    </div>
  );

  return (
    <FxTrigger className={styles.holo}>
      <div className="relative mx-auto w-full max-w-[19rem] lg:mr-0 lg:max-w-[22rem]">
        <HoloCard hud={hud}>
          {/* Crop only the bottom attribution strip, keeping the full subject width. */}
          <div className={styles.media}>
            <Image
              src="/avatar.png"
              alt={site.name}
              fill
              sizes="(max-width: 640px) 80vw, 352px"
              className="object-cover object-top"
              preload
            />
            <span aria-hidden className={styles.scanlines} />
            <span aria-hidden className={styles.foil} />
            <span aria-hidden className={styles.glare} />
            <span aria-hidden className={styles.band} />
            {/* HUD caption; the name is already the heading and the image alt. */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 flex flex-col gap-1 px-4 pb-3.5 pt-12"
              style={{ background: "linear-gradient(to top, color-mix(in oklab, var(--bg) 92%, transparent), color-mix(in oklab, var(--bg) 55%, transparent) 55%, transparent)" }}
            >
              <p className="flex items-baseline gap-2 font-display text-lg font-semibold leading-tight tracking-tight text-fg">
                {site.name}
                <span lang="zh-CN" className="text-sm font-medium text-accent">{site.nameZh}</span>
              </p>
              <LocalClock label={pick(site.location, locale)} className="text-[10px] tracking-[0.14em]" />
            </div>
          </div>
          <span aria-hidden className={styles.edge} />
          <BorderBeam duration={9} size={80} />
        </HoloCard>
      </div>
    </FxTrigger>
  );
}
