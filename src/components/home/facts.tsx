import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";

type Fact = { value: string; label: string };

export function Facts() {
  const t = useTranslations("Home.facts");
  const items = t.raw("items") as Fact[];

  return (
    <section className="container-x">
      <Reveal>
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-6 bg-accent" />
          {t("eyebrow")}
        </p>
      </Reveal>
      <div className="grid overflow-hidden rounded-3xl border border-line bg-bg-elevated sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            key={item.label}
            delay={i * 0.06}
            className="group relative flex flex-col gap-2 p-7 transition-colors hover:bg-accent-soft/60 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line sm:[&:nth-child(odd)]:border-r lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r"
          >
            <span className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
              {item.value}
            </span>
            <span className="text-sm text-muted">{item.label}</span>
            <span className="absolute right-6 top-6 font-mono text-[10px] text-muted/60">
              0{i + 1}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
