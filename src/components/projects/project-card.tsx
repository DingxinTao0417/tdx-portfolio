import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { pick } from "@/data/types";
import { Link } from "@/i18n/navigation";
import { GenerativeCover } from "@/components/ui/generative-cover";
import { Tag } from "@/components/ui/tag";
import { TiltCard } from "@/components/ui/tilt-card";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  locale,
  categoryLabel,
  ctaLabel,
  size = "md",
}: {
  project: Project;
  locale: string;
  categoryLabel: string;
  ctaLabel: string;
  size?: "md" | "lg";
}) {
  return (
    <TiltCard className="h-full rounded-3xl">
      <Link
        href={`/projects/${project.slug}`}
        data-cursor-text={ctaLabel}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-bg-elevated shadow-soft transition-[border-color,box-shadow] duration-500 hover:border-accent/50 hover:shadow-glow",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            project.cover ? "aspect-[2/1]" : size === "lg" ? "aspect-[16/9]" : "aspect-[4/3]",
          )}
        >
          {project.cover ? (
            <Image
              src={project.cover.src}
              alt={pick(project.cover.alt, locale)}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
            />
          ) : (
            <GenerativeCover
              hue={project.hue}
              motif={project.motif}
              index={project.index}
              className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          )}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Tag tone="accent">{categoryLabel}</Tag>
            <Tag>{project.year}</Tag>
          </div>
          <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-fg backdrop-blur transition-all duration-300 group-hover:bg-accent group-hover:text-white">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
              {pick(project.title, locale)}
            </h3>
            <span className="font-mono text-xs text-muted">{project.index}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted sm:text-[15px]">
            {pick(project.tagline, locale)}
          </p>
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {project.stack.slice(0, 5).map((s) => (
              <li
                key={s}
                className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
              >
                {s}
              </li>
            ))}
            {project.stack.length > 5 && (
              <li className="rounded-md px-1.5 py-0.5 font-mono text-[11px] text-muted">
                +{project.stack.length - 5}
              </li>
            )}
          </ul>
        </div>
      </Link>
    </TiltCard>
  );
}
