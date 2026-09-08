import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";

type Fact = { value: string; label: string };

export function Facts() {
  const t = useTranslations("Home.facts");
  const items = t.raw("items") as Fact[];

  return (
    <section className="container-x pt-16 sm:pt-20">
      <Reveal>
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="inline-block h-px w-6 bg-accent" />
          {t("eyebrow")}
        </p>
      </Reveal>
      <div className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            key={item.label}
            delay={i * 0.06}
            className="relative flex flex-col gap-2 border-line p-5 nth-[-n+2]:border-b odd:border-r lg:nth-[-n+2]:border-b-0 lg:not-last:border-r sm:p-7"
          >
            <span className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {item.value}
            </span>
            <span className="text-sm text-muted">{item.label}</span>
            <span className="absolute right-3 top-3 font-mono text-[9px] text-muted/60">
              0{i + 1}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
