import { useTranslations } from "next-intl";
import { Marquee } from "@/components/ui/marquee";
import { TechIcon } from "@/components/ui/tech-icon";
import { iconKeyForStack } from "@/lib/icons";

export function TechMarquee() {
  const t = useTranslations("Home");
  const items = t.raw("marquee") as string[];

  return (
    <section aria-label="Technologies" className="relative border-y border-line py-5">
      <Marquee itemClassName="px-7">
        {items.map((item) => {
          const key = iconKeyForStack(item);
          return (
            <span
              key={item}
              className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted"
            >
              {key ? (
                <TechIcon icon={key} name={item} size={15} className="text-fg/70" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
              {item}
            </span>
          );
        })}
      </Marquee>
    </section>
  );
}
