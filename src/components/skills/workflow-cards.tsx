import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const steps = [
  { image: "context", href: "/blog/structured-workflows" },
  { image: "review", href: "/projects/as-a" },
  { image: "scope", href: "/projects/omnigate" },
  { image: "docs", href: "/blog" },
] as const;
type Step = { title: string; body: string; link: string };

export function WorkflowCards() {
  const t = useTranslations("Skills.principles");
  const items = t.raw("items") as Step[];
  return (
    <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-workflow-cards>
      {items.map((item, index) => (
        <li key={steps[index].image} className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated">
          <div className="relative aspect-[3/2] bg-[#eee5d8]">
            <Image src={`/images/workflow/${steps[index].image}.webp`} alt="" fill sizes="(min-width: 1280px) 280px, (min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between text-accent">
              <span className="font-mono text-[11px] tracking-widest">0{index + 1} /</span>
              {index < items.length - 1 && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
            </div>
            <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">{item.title}</h3>
            <p className="mt-3 mb-6 text-[13px] leading-[1.9] text-muted">{item.body}</p>
            <Link href={steps[index].href} className="mt-auto inline-flex min-h-11 items-center justify-between gap-3 border-t border-line pt-3 text-xs font-medium transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              {item.link}<ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </li>
      ))}
    </ol>
  );
}
