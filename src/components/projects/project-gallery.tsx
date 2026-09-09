"use client";

import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

/** Native scroll snapping keeps touch gestures and vertical page scrolling intact. */
export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("Projects.gallery");
  const reducedMotion = useReducedMotion();
  const viewportId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const targetIndex = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let previousWidth = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === previousWidth) return;
      previousWidth = element.clientWidth;
      element.scrollTo({ left: targetIndex.current * previousWidth, behavior: "instant" });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  function select(index: number) {
    const element = viewport.current;
    if (!element || images.length === 0) return;
    const next = (index + images.length) % images.length;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    targetIndex.current = next;
    setActive(next);
    element.scrollTo({
      left: next * element.clientWidth,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  function syncAfterScroll() {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    // Commit native swipes once they settle, not at every intermediate pixel.
    settleTimer.current = setTimeout(() => {
      const element = viewport.current;
      if (!element || element.clientWidth === 0) return;
      const index = Math.max(0, Math.min(images.length - 1, Math.round(element.scrollLeft / element.clientWidth)));
      targetIndex.current = index;
      setActive(index);
    }, 120);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const destination = {
      ArrowLeft: targetIndex.current - 1,
      ArrowRight: targetIndex.current + 1,
      Home: 0,
      End: images.length - 1,
    }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    select(destination);
  }

  const current = images[active] ?? images[0];
  if (!current) return null;
  const aspectRatio = 1 / Math.max(...images.map((image) => image.height / image.width));

  return (
    <section aria-label={t("label")} aria-roledescription={t("carousel")} data-project-gallery>
      <div className="mb-3 flex items-center justify-between gap-4 px-1">
        <p className="text-xs font-medium text-muted">{t("label")}</p>
        <a
          href={current.src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("openLabel")}
          className="inline-flex min-h-11 items-center gap-2 text-xs text-muted transition-colors hover:text-accent"
        >
          <Expand className="h-3.5 w-3.5" aria-hidden />
          {t("open")}
        </a>
      </div>

      <div className="rounded-2xl border border-line bg-bg-elevated p-1.5 sm:p-2.5">
        <div
          ref={viewport}
          id={viewportId}
          tabIndex={0}
          aria-label={t("hint")}
          data-gallery-viewport
          data-lenis-prevent
          onScroll={syncAfterScroll}
          onKeyDown={onKeyDown}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-lg border border-line bg-bg [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              key={image.src}
              role="group"
              aria-roledescription={t("slide")}
              aria-label={`${index + 1} / ${images.length} — ${image.caption}`}
              aria-hidden={index !== active}
              className="relative w-full shrink-0 snap-center snap-always"
              style={{ aspectRatio }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={index === 0}
                sizes="(min-width: 1280px) 1200px, 100vw"
                draggable={false}
                className="select-none object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-16 items-center justify-between gap-4 px-1 py-2">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-sm" aria-live="polite" aria-atomic="true">
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
            {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
          <span>{current.caption}</span>
        </p>
        {images.length > 1 && (
          <div className="flex shrink-0 gap-2">
            <button type="button" aria-label={t("previous")} aria-controls={viewportId} onClick={() => select(targetIndex.current - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-bg-elevated transition-colors hover:border-accent hover:text-accent">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" aria-label={t("next")} aria-controls={viewportId} onClick={() => select(targetIndex.current + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-bg-elevated transition-colors hover:border-accent hover:text-accent">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className={cn("grid gap-2 sm:flex sm:flex-wrap sm:gap-3", images.length > 4 ? "grid-cols-3" : "grid-cols-4")} role="group" aria-label={t("thumbnails")}>
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={t("show", { index: index + 1, caption: image.caption })}
              aria-pressed={active === index}
              aria-controls={viewportId}
              onClick={() => select(index)}
              className={cn(
                "min-h-11 min-w-0 rounded-lg border p-1 text-left transition-colors sm:w-36",
                active === index ? "border-accent bg-accent-soft" : "border-line bg-bg-elevated hover:border-accent/50",
              )}
            >
              <span className="relative block aspect-[2/1] overflow-hidden rounded bg-bg">
                <Image src={image.src} alt="" fill sizes={`(min-width: 640px) 134px, ${images.length > 4 ? "33" : "25"}vw`} draggable={false} className="object-contain" />
              </span>
              <span className="hidden truncate px-1 pb-1 pt-2 text-[11px] text-muted sm:block">{image.caption}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
