import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import styles from "./what-i-do.module.css";

const cards = [
  { image: "/images/home/feature-ai.webp", href: "/projects/conuo", layout: "tall" },
  { image: "/images/home/feature-fullstack.webp", href: "/projects/opc-workspace", layout: "wide" },
  { image: "/images/home/feature-fde.webp", href: "/learn/fde", layout: "compact" },
  { image: "/images/home/feature-notes.webp", href: "/blog", layout: "compact" },
] as const;

type Item = { title: string; body: string; label: string; cta: string };

export function WhatIDo() {
  const t = useTranslations("Home.whatIDo");
  const items = t.raw("items") as Item[];

  return (
    <section id="development" className="container-x section-space scroll-mt-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleAccent")} />
        <ButtonLink href="/projects" variant="secondary" arrow>{t("cta")}</ButtonLink>
      </div>

      <div className={cn(styles.grid, "mt-8 sm:mt-10")} data-feature-cards>
        {items.map((item, i) => {
          const card = cards[i];
          if (!card) return null;
          return (
            <article key={card.image} className={cn(styles.card, styles[card.layout])}>
              <div className={styles.media}>
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes={card.layout === "wide" ? "(min-width: 1280px) 780px, (min-width: 768px) 66vw, 100vw" : "(min-width: 1280px) 380px, (min-width: 768px) 33vw, 100vw"}
                  className={styles.artwork}
                />
              </div>
              <div className={styles.meta}>
                <span className="font-mono text-xs">0{i + 1} /</span>
                <span>{item.label}</span>
              </div>
              <div className={styles.content}>
                <h3 className="font-display text-2xl font-medium tracking-tight lg:text-[1.75rem]">{item.title}</h3>
                <p className={styles.description}>{item.body}</p>
                <Link href={card.href} className={cn(styles.glass, "mt-5 self-start rounded-xl px-4 py-2.5 text-[13px] text-white/90 transition-transform hover:scale-[1.02] motion-reduce:transform-none")}>
                  {item.cta}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
