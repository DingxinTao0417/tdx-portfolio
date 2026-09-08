import { Bot, Layers, Radar } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";

const icons = [Bot, Layers, Radar];

type Item = { title: string; body: string; tags: string[] };

export function WhatIDo() {
  const t = useTranslations("Home.whatIDo");
  const items = t.raw("items") as Item[];

  return (
    <section className="container-x section-space">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} accent={t("titleAccent")} />

      <Stagger className="mt-10 grid border-y border-line md:grid-cols-3">
        {items.map((item, i) => {
          const Icon = icons[i] ?? Bot;
          return (
            <StaggerItem key={item.title} className="h-full border-line not-last:border-b md:not-last:border-r md:not-last:border-b-0">
                <article className="group relative flex h-full flex-col gap-5 px-1 py-8 transition-colors duration-300 md:px-7 md:py-9">
                  <div className="flex items-center justify-between">
                    <span className="text-accent">
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="text-[15px] leading-[1.85] text-muted">{item.body}</p>
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {item.tags.map((tag) => (
                      <li key={tag}>
                        <Tag>{tag}</Tag>
                      </li>
                    ))}
                  </ul>
                </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
