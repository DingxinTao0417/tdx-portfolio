"use client";

import { Database, Layers, Network, Pause, Play } from "lucide-react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Component, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { palettes } from "./palette";
import type { HeroInteraction } from "./hero-interaction";

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
      <span className="font-mono text-3xl font-semibold tracking-tight">
        <span className="text-accent">T</span><span className="text-fg">DX</span>
      </span>
      <Network className="h-10 w-10 sm:h-14 sm:w-14" strokeWidth={1} />
      <Database className="h-10 w-10 sm:h-14 sm:w-14" strokeWidth={1} />
      <Layers className="h-10 w-10 sm:h-14 sm:w-14" strokeWidth={1} />
    </div>
  );
}

/** Particle silhouettes with a pause control and a readable text equivalent. */
export function HeroCanvas({ className }: { className?: string }) {
  const t = useTranslations("Home.particles");
  const wrapper = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const interaction = useRef<HeroInteraction>({ x: 0, y: 0, inside: false, activityVersion: 0 });
  const invalidate = useRef<(() => void) | null>(null);
  const onInvalidateReady = useCallback((callback: (() => void) | null) => { invalidate.current = callback; }, []);
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const hintSeen = useRef(false);
  const inView = useInView(wrapper, { amount: 0.15 });
  const { resolvedTheme } = useTheme();
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, serverSnapshot);
  const visible = useSyncExternalStore(subscribeVisibility, getVisible, serverSnapshot);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const [nextRequest, setNextRequest] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const palette = useMemo(() => ({
    ...palettes[resolvedTheme === "dark" ? "dark" : "light"],
    accent: resolvedTheme === "dark" ? "#ee805a" : "#c94720",
  }), [resolvedTheme]);

  useEffect(() => {
    if (!hintVisible) return;
    const timer = window.setTimeout(() => setHintVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [hintVisible]);

  function showHint() {
    if (hintSeen.current) return;
    hintSeen.current = true;
    setHintVisible(true);
  }

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
    input.activityVersion++;
    invalidate.current?.();
  }

  function leavePointer() {
    interaction.current.inside = false;
    invalidate.current?.();
  }

  return (
    <figure ref={wrapper} className={cn("relative aspect-square min-w-0", className)} aria-label={t("description")} data-hero-particles data-phase={phase} data-playing={playing && !reduced}>
      {/* Enlarge the drawing surface, not the camera zoom, to retain morph headroom. */}
      <div ref={surface} className="absolute top-1/2 left-[calc(50%_-_12px)] aspect-[6/5] w-[130%] -translate-x-1/2 -translate-y-1/2 min-[800px]:w-[148.2%] lg:left-[37.5%] lg:w-[158.6%]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <SceneBoundary fallback={<Fallback />}>
            <HeroScene
              palette={palette} reduced={reduced} active={inView && visible}
              playing={playing} nextRequest={nextRequest} interaction={interaction} onInvalidateReady={onInvalidateReady}
              onPhaseChange={setPhase} fallback={<Fallback />}
            />
          </SceneBoundary>
        </div>
        <button
          type="button" data-particle-surface
          className="absolute inset-x-[6%] inset-y-[8%] touch-manipulation cursor-pointer bg-transparent focus-visible:outline-none"
          aria-label={t("next", { shape: t(phaseNames[phase]) })}
          onPointerEnter={(event) => { updatePointer(event); if (event.pointerType !== "touch") showHint(); }}
          onPointerMove={updatePointer}
          onPointerLeave={leavePointer}
          onPointerDown={(event) => {
            setKeyboardFocused(false);
            gesture.current = { x: event.clientX, y: event.clientY, moved: false };
            updatePointer(event);
          }}
          onPointerCancel={() => { gesture.current = null; leavePointer(); }}
          onFocus={(event) => { setKeyboardFocused(event.currentTarget.matches(":focus-visible")); showHint(); }}
          onKeyDown={() => setKeyboardFocused(true)}
          onBlur={() => { setKeyboardFocused(false); leavePointer(); }}
          onClick={(event) => {
            const dragged = event.detail !== 0 && gesture.current?.moved;
            gesture.current = null;
            if (dragged) return;
            hintSeen.current = true;
            setHintVisible(false);
            setNextRequest((request) => request + 1);
          }}
        />
      </div>
      <span aria-hidden className={cn("pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-bg/90 px-3 py-2 text-xs text-muted transition-opacity duration-300 motion-reduce:transition-none", hintVisible || keyboardFocused ? "opacity-100" : "opacity-0", keyboardFocused && "ring-2 ring-accent ring-offset-4 ring-offset-bg")}>
        {t("hint")}
      </span>
      {!reduced && (
        <button
          type="button" onClick={() => setPlaying((current) => !current)}
          className="absolute right-0 bottom-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label={t(playing ? "pause" : "play")} title={t(playing ? "pause" : "play")}
        >
          {playing ? <Pause className="h-3 w-3" aria-hidden /> : <Play className="h-3 w-3" aria-hidden />}
        </button>
      )}
    </figure>
  );
}
