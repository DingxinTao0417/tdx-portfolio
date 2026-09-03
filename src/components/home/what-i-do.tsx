import { Bot, Layers, Radar } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { TiltCard } from "@/components/ui/tilt-card";

const icons = [Bot, Layers, Radar];

type Item = { title: string; body: string; tags: string[] };

export function WhatIDo() {
  const t = useTranslations("Home.whatIDo");
  const items = t.raw("items") as Item[];

  return (
    <section className="container-x py-24 sm:py-32">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleAccent")} />

      <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
        {items.map((item, i) => {
          const Icon = icons[i] ?? Bot;
          return (
            <StaggerItem key={item.title} className="h-full">
              <TiltCard className="h-full rounded-3xl" max={6}>
                <article className="hud-corners group relative flex h-full flex-col gap-5 rounded-3xl border border-line bg-bg-elevated p-7 transition-colors duration-500 hover:border-accent/50">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{item.body}</p>
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {item.tags.map((tag) => (
                      <li key={tag}>
                        <Tag>{tag}</Tag>
                      </li>
                    ))}
                  </ul>
                </article>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
