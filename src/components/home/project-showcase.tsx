"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { motion, useInView, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import styles from "./project-showcase.module.css";

type ShowcaseProject = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  stack: string[];
  cover?: { src: string; alt: string };
};

const CYCLE_MS = 6500;

export function ProjectShowcase({ projects }: { projects: ShowcaseProject[] }) {
  const t = useTranslations("Home.featured.carousel");
  const tc = useTranslations("Common");
  const viewportId = useId();
  const root = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const inView = useInView(root, { amount: 0.35 });
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const tiltX = useSpring(0, { stiffness: 130, damping: 22 });
  const tiltY = useSpring(0, { stiffness: 130, damping: 22 });
  const count = projects.length;
  const rotating = playing && !reducedMotion && !hovered && !focused && !dragging && inView && pageVisible && count > 1;

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden) setActive((index) => (index + 1) % count);
    }, CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [active, count, rotating]);

  function select(index: number) {
    setActive(((index % count) + count) % count);
    tiltX.set(0);
    tiltY.set(0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const destination = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: count - 1 }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    select(destination);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    if (start && start.id === event.pointerId) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tiltX.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 4);
    tiltY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 6);
  }

  function finishSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    pointer.current = null;
    setDragging(false);
    if (!start || start.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClickUntil.current = performance.now() + 350;
      select(active + (dx < 0 ? 1 : -1));
    }
  }

  const current = projects[active];
  if (!current) return null;

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription={t("role")}
      aria-label={t("label")}
      data-project-showcase
      className="mt-8 sm:mt-10"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        tiltX.set(0);
        tiltY.set(0);
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div
        id={viewportId}
        className={styles.stage}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          setDragging(true);
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={(event) => {
          tiltX.set(0);
          tiltY.set(0);
          if (pointer.current && !event.currentTarget.hasPointerCapture(pointer.current.id)) {
            pointer.current = null;
            setDragging(false);
          }
        }}
        onPointerUp={finishSwipe}
        onPointerCancel={() => {
          pointer.current = null;
          setDragging(false);
        }}
        onLostPointerCapture={() => {
          pointer.current = null;
          setDragging(false);
        }}
        onClickCapture={(event) => {
          if (performance.now() < suppressClickUntil.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <div className={styles.glow} aria-hidden />
        {projects.map((project, index) => {
          let offset = (index - active + count) % count;
          if (offset > count / 2) offset -= count;
          const selected = offset === 0;
          const distant = Math.abs(offset) > 1;
          return (
            <div
              key={project.slug}
              className={styles.card}
              data-active={selected}
              data-distant={distant}
              role="group"
              aria-roledescription={t("slide")}
              aria-label={t("position", { index: index + 1, count, name: project.title })}
              aria-hidden={distant}
              inert={distant}
              style={{ "--offset": offset, "--distance": Math.abs(offset), zIndex: count - Math.abs(offset) } as CSSProperties}
            >
              <motion.div className={styles.frame} style={{ rotateX: selected && !reducedMotion ? tiltX : 0, rotateY: selected && !reducedMotion ? tiltY : 0 }}>
                <div className={styles.chrome} aria-hidden>
                  <span className="flex gap-1.5"><i /><i /><i /></span>
                  <span className="truncate font-mono text-[10px] sm:text-[11px]">{project.title}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
                <div className={styles.screen}>
                  {project.cover ? (
                    <Image
                      src={project.cover.src}
                      alt={project.cover.alt}
                      fill
                      sizes="(min-width: 1280px) 780px, (min-width: 640px) 66vw, 84vw"
                      draggable={false}
                      className="object-contain"
                    />
                  ) : <span className="font-display text-3xl">{project.title}</span>}
                </div>
                {selected ? (
                  <Link href={`/projects/${project.slug}`} draggable={false} className={styles.hitArea} aria-label={t("open", { name: project.title })} />
                ) : (
                  <button type="button" className={styles.hitArea} tabIndex={-1} onClick={() => select(index)} aria-label={t("select", { name: project.title })} />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="relative grid gap-6 border-t border-line pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8 sm:pt-8">
        <div className="min-w-0 sm:min-h-40">
          <p className="mb-3 flex items-center gap-3 text-xs text-muted">
            <span className="font-mono tabular-nums text-accent">{String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
            <span className="h-3 w-px bg-line-strong" aria-hidden />
            {current.category}
          </p>
          <div aria-live={rotating ? "off" : "polite"} aria-atomic="true">
            <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{current.title}</h3>
            <p className="mt-3 min-h-14 max-w-2xl text-sm leading-7 text-muted sm:min-h-0 sm:text-[15px]">{current.tagline}</p>
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] text-muted">
            {current.stack.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-col sm:flex-nowrap sm:items-end sm:justify-start sm:gap-6">
          <ButtonLink href={`/projects/${current.slug}`} arrow variant="secondary">{tc("viewProject")}</ButtonLink>
          {count > 1 && (
            <div className="flex items-center gap-1.5">
              {!reducedMotion && (
                <button type="button" className={cn(styles.control, "mr-1 text-muted")} aria-label={t(playing ? "pause" : "play")} onClick={() => setPlaying((value) => !value)}>
                  {playing ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
                </button>
              )}
              <button type="button" className={styles.control} aria-label={t("previous")} aria-controls={viewportId} onClick={() => select(active - 1)}><ArrowLeft className="h-4 w-4" aria-hidden /></button>
              <button type="button" className={styles.control} aria-label={t("next")} aria-controls={viewportId} onClick={() => select(active + 1)}><ArrowRight className="h-4 w-4" aria-hidden /></button>
            </div>
          )}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-4 sm:mt-6 sm:gap-x-7" role="group" aria-label={t("choose")}>
          {projects.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              className={cn("flex min-h-11 items-center gap-2 border-b-2 text-xs transition-colors sm:text-[13px]", active === index ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg")}
              aria-label={t("select", { name: project.title })}
              aria-pressed={active === index}
              aria-controls={viewportId}
              onClick={() => select(index)}
            >
              <span className={cn("font-mono text-[10px]", active === index && "text-accent")}>{String(index + 1).padStart(2, "0")}</span>
              {project.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
