import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { pick } from "@/data/types";
import { Link } from "@/i18n/navigation";
import { GenerativeCover } from "@/components/ui/generative-cover";
import { Tag } from "@/components/ui/tag";
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
      <Link
        href={`/projects/${project.slug}`}
        data-cursor-text={ctaLabel}
        className={cn(
          "group relative flex h-full flex-col rounded-2xl border border-line bg-bg-elevated p-3 transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-soft sm:p-4",
          size === "lg" && "md:grid md:grid-cols-[1.4fr_1fr] md:items-center md:gap-4",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-line bg-bg",
            !project.cover && "aspect-[16/9]",
          )}
        >
          {project.cover ? (
            <Image
              src={project.cover.src}
              alt={pick(project.cover.alt, locale)}
              width={project.cover.width}
              height={project.cover.height}
              sizes={size === "lg" ? "(min-width: 1280px) 660px, (min-width: 768px) 55vw, 100vw" : "(min-width: 1280px) 570px, (min-width: 768px) 50vw, 100vw"}
              className="h-auto w-full object-contain"
            />
          ) : (
            <GenerativeCover
              hue={project.hue}
              motif={project.motif}
              index={project.index}
              className="transition-opacity duration-300 group-hover:opacity-90"
            />
          )}
        </div>

        <div className={cn("flex flex-1 flex-col gap-4 px-2 pb-2 pt-6 sm:px-3 sm:pb-3", size === "lg" && "md:py-5 lg:px-5")}>
          <div className="flex items-center justify-between gap-3">
            <Tag tone="accent" className="rounded-md border-transparent px-2 py-1 tracking-normal">{categoryLabel}</Tag>
            <span className="font-mono text-[11px] text-muted">{project.year} / {project.index}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className={cn("font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl", size === "lg" && "lg:text-3xl")}>
              {pick(project.title, locale)}
            </h3>
          </div>
          <p className="text-sm leading-7 text-muted sm:text-[15px]">
            {pick(project.tagline, locale)}
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {project.stack.slice(0, 5).map((s) => (
              <li
                key={s}
                className="font-mono text-[11px] text-muted"
              >
                {s}
              </li>
            ))}
            {project.stack.length > 5 && (
              <li className="font-mono text-[11px] text-muted">
                +{project.stack.length - 5}
              </li>
            )}
          </ul>
          <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-sm font-medium">
            <span className="transition-colors group-hover:text-accent">{ctaLabel}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-bg text-fg transition-colors group-hover:bg-accent group-hover:text-white">
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
  );
}
