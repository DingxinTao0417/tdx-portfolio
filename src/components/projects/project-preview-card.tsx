import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Project } from "@/data/projects";
import { pick } from "@/data/types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import styles from "./project-preview-card.module.css";

export function ProjectPreviewCard({ project, locale, category, cta, featuredLabel, lead = false }: {
  project: Project;
  locale: string;
  category: string;
  cta: string;
  featuredLabel: string;
  lead?: boolean;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(styles.card, lead && styles.lead)}
      style={{ "--project-hue": project.hue } as CSSProperties}
      data-project-card={project.slug}
      data-project-lead={lead || undefined}
    >
      <div className={styles.visual}>
        <div className={styles.window}>
          <div className={styles.windowBar} aria-hidden="true">
            <span className={styles.dots}><i /><i /><i /></span>
            <span>{pick(project.title, locale)}</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
          {project.cover && (
            <Image
              src={project.cover.src}
              alt={pick(project.cover.alt, locale)}
              width={project.cover.width}
              height={project.cover.height}
              sizes={lead ? "(min-width: 1280px) 680px, (min-width: 1024px) 55vw, (min-width: 768px) 90vw, 100vw" : "(min-width: 1280px) 520px, (min-width: 768px) 44vw, 100vw"}
              loading={lead ? "eager" : "lazy"}
              className={styles.screenshot}
            />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className="font-mono text-[10px] uppercase tracking-[.12em] text-accent">{lead ? featuredLabel : category}</span>
          <span className={styles.status} data-tone={project.stage.tone}>
            <span aria-hidden="true" />{pick(project.stage.label, locale)}
          </span>
        </div>
        <h2 className={styles.title}>{pick(project.title, locale)}</h2>
        <p className="text-xs leading-6 text-muted">{pick(project.kind, locale)}<span className="mx-2" aria-hidden="true">/</span>{project.year}</p>
        <p className={styles.description}>{pick(project.tagline, locale)}</p>
        {lead && <ul className={styles.highlights}>
          {project.highlights.slice(0, 2).map(item => <li key={item.en}><span aria-hidden="true" />{pick(item, locale)}</li>)}
        </ul>}
        <ul className={styles.stack}>
          {project.stack.slice(0, 4).map(tech => <li key={tech}>{tech}</li>)}
          {project.stack.length > 4 && <li>+{project.stack.length - 4}</li>}
        </ul>
        <div className={styles.action}><span>{cta}</span><span className={styles.arrow}><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></div>
      </div>
    </Link>
  );
}
