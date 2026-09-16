"use client";

import { Database, Layers, Network } from "lucide-react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Component, useCallback, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { palettes } from "./palette";
import type { HeroInteraction } from "./hero-interaction";

// Indexed by shader ID: 0=monogram, 1=database, 2=network, 3=lattice.
// Monogram is no longer played back but the ID mapping must stay intact.
const phaseNames = ["monogram", "database", "network", "lattice"] as const;

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });
const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(notify: () => void) {
  const media = window.matchMedia(reducedQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
function getReduced() { return window.matchMedia(reducedQuery).matches; }
function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}
function getVisible() { return document.visibilityState === "visible"; }
function serverSnapshot() { return false; }

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Fallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 text-accent/50 sm:gap-6">
      <Network className="h-10 w-10 sm:h-14 sm:w-14" strokeWidth={1} />
      <Database className="h-10 w-10 sm:h-14 sm:w-14" strokeWidth={1} />
      <Layers className="h-10 w-10 sm:h-14 sm:w-14" strokeWidth={1} />
    </div>
  );
}

/** Particle silhouettes autoplay independently of pointer interaction. */
export function HeroCanvas({ className }: { className?: string }) {
  const t = useTranslations("Home.particles");
  const wrapper = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const interaction = useRef<HeroInteraction>({ x: 0, y: 0, inside: false });
  const invalidate = useRef<(() => void) | null>(null);
  const onInvalidateReady = useCallback((callback: (() => void) | null) => { invalidate.current = callback; }, []);
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const inView = useInView(wrapper, { amount: 0.15 });
  const { resolvedTheme } = useTheme();
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, serverSnapshot);
  const visible = useSyncExternalStore(subscribeVisibility, getVisible, serverSnapshot);
  const [phase, setPhase] = useState(0);
  const [nextRequest, setNextRequest] = useState(0);
  const palette = useMemo(() => ({
    ...palettes[resolvedTheme === "dark" ? "dark" : "light"],
    accent: resolvedTheme === "dark" ? "#ee805a" : "#c94720",
  }), [resolvedTheme]);

  function updatePointer(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current && Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 8) {
      gesture.current.moved = true;
    }
    const rect = surface.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const input = interaction.current;
    input.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    input.y = Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2));
    input.inside = event.pointerType !== "touch";
    invalidate.current?.();
  }

  function leavePointer() {
    interaction.current.inside = false;
    invalidate.current?.();
  }

  return (
    <figure ref={wrapper} className={cn("relative aspect-square min-w-0", className)} aria-label={t("description")} data-hero-particles data-phase={phase} data-playing={inView && visible && !reduced}>
      {/* Enlarge the drawing surface, not the camera zoom, to retain morph headroom. */}
      <div ref={surface} className="absolute top-1/2 left-[calc(50%_-_12px)] aspect-[6/5] w-[130%] -translate-x-1/2 -translate-y-1/2 min-[800px]:w-[148.2%] lg:left-[37.5%] lg:w-[158.6%]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <SceneBoundary fallback={<Fallback />}>
            <HeroScene
              palette={palette} reduced={reduced} active={inView && visible}
              nextRequest={nextRequest} interaction={interaction} onInvalidateReady={onInvalidateReady}
              onPhaseChange={setPhase} fallback={<Fallback />}
            />
          </SceneBoundary>
        </div>
        <button
          type="button" data-particle-surface
          className="absolute inset-x-[6%] inset-y-[8%] touch-pan-y cursor-pointer rounded-2xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label={t("next", { shape: t(phaseNames[phase]) })}
          onPointerEnter={updatePointer}
          onPointerMove={updatePointer}
          onPointerLeave={leavePointer}
          onPointerDown={(event) => {
            gesture.current = { x: event.clientX, y: event.clientY, moved: false };
            updatePointer(event);
          }}
          onPointerCancel={() => { gesture.current = null; leavePointer(); }}
          onBlur={leavePointer}
          onClick={(event) => {
            const dragged = event.detail !== 0 && gesture.current?.moved;
            gesture.current = null;
            if (dragged) return;
            // Optional skip only; autoplay starts and continues without this event.
            setNextRequest((request) => request + 1);
          }}
        />
      </div>
    </figure>
  );
}
