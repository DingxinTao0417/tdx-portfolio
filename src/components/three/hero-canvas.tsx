"use client";

import { Database, Layers, Network } from "lucide-react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Component, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { HERO_MORPH_EVENT } from "@/components/home/hero/events";
import { HeroHud, heroHudHost, type HeroHudHandle } from "@/components/home/hero/hero-hud";
import { useIntroDone } from "@/components/fx/intro-store";
import { cn } from "@/lib/utils";
import { HOLD, MORPH_DURATION, PLAYBACK_ORDER } from "./hero-cycle";
import { palettes } from "./palette";
import { createHeroTelemetry, type HeroInteraction, type HeroTelemetry } from "./hero-interaction";

// Indexed by shader ID: 0=monogram, 1=database, 2=network, 3=lattice.
// Monogram is no longer played back but the ID mapping must stay intact.
const phaseNames = ["monogram", "database", "network", "lattice"] as const;
const playback: readonly number[] = PLAYBACK_ORDER;
const pad = (value: number) => String(value).padStart(2, "0");

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
  const fx = useTranslations("FX.hero");
  const wrapper = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const hud = useRef<HeroHudHandle>(null);
  const interaction = useRef<HeroInteraction>({ x: 0, y: 0, inside: false });
  const invalidate = useRef<(() => void) | null>(null);
  const onInvalidateReady = useCallback((callback: (() => void) | null) => { invalidate.current = callback; }, []);
  const telemetry = useRef<HeroTelemetry>(createHeroTelemetry());
  const gesture = useRef<{ x: number; y: number; moved: boolean; mouse: boolean } | null>(null);
  const introDone = useIntroDone();
  const inView = useInView(wrapper, { amount: 0.15 });
  const { resolvedTheme } = useTheme();
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, serverSnapshot);
  const visible = useSyncExternalStore(subscribeVisibility, getVisible, serverSnapshot);
  // `key` restarts the HUD meter per shape; `morph` is false for the first shape, which starts settled.
  const [cycle, setCycle] = useState({ phase: 0, key: 0, morph: false });
  const phase = cycle.phase;
  const onPhaseChange = useCallback((next: number) => {
    setCycle((current) => (current.phase === next ? current : { phase: next, key: current.key + 1, morph: current.phase !== 0 }));
  }, []);
  const [nextRequest, setNextRequest] = useState(0);
  const palette = useMemo(() => ({
    ...palettes[resolvedTheme === "dark" ? "dark" : "light"],
    accent: resolvedTheme === "dark" ? "#ee805a" : "#c94720",
  }), [resolvedTheme]);

  useEffect(() => {
    if (cycle.morph) document.dispatchEvent(new Event(HERO_MORPH_EVENT));
  }, [cycle]);

  function updatePointer(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current && Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 8) {
      gesture.current.moved = true;
    }
    const rect = surface.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const input = interaction.current;
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2));
    // Mouse drags orbit the model (after the same 8px as the click guard); touch keeps native scrolling.
    if (gesture.current?.mouse && (event.buttons & 1) === 1) {
      input.dragging = gesture.current.moved;
      input.dragX = (input.dragX ?? 0) + x - input.x;
      input.dragY = (input.dragY ?? 0) + y - input.y;
    }
    input.x = x;
    input.y = y;
    input.inside = event.pointerType !== "touch";
    invalidate.current?.();
    hud.current?.track({ x: event.clientX, y: event.clientY });
  }

  function leavePointer() {
    interaction.current.inside = false;
    interaction.current.dragging = false;
    invalidate.current?.();
    hud.current?.track(null);
  }

  const morph = cycle.morph ? MORPH_DURATION : 0;

  return (
    <figure ref={wrapper} className={cn("relative aspect-square min-w-0", heroHudHost, className)} aria-label={t("description")} data-hero-particles data-phase={phase} data-playing={inView && visible && !reduced}>
      {/* Enlarge the drawing surface, not the camera zoom, to retain morph headroom. */}
      <div ref={surface} className="absolute top-1/2 left-[calc(50%_-_12px)] aspect-[6/5] w-[130%] -translate-x-1/2 -translate-y-1/2 min-[800px]:w-[148.2%] lg:left-1/2 lg:w-[158.6%]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <SceneBoundary fallback={<Fallback />}>
            <HeroScene
              palette={palette} reduced={reduced} active={inView && visible}
              nextRequest={nextRequest} interaction={interaction} onInvalidateReady={onInvalidateReady}
              onPhaseChange={onPhaseChange} fallback={<Fallback />}
              holdEntrance={!introDone} telemetry={telemetry}
            />
          </SceneBoundary>
        </div>
        <button
          type="button" data-particle-surface
          data-cursor-text={fx("cursor")}
          className="absolute inset-x-[6%] inset-y-[8%] touch-pan-y cursor-pointer rounded-2xl bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label={t("next", { shape: t(phaseNames[phase]) })}
          onPointerEnter={updatePointer}
          onPointerMove={updatePointer}
          onPointerLeave={leavePointer}
          onPointerDown={(event) => {
            const mouse = event.pointerType === "mouse" && event.button === 0;
            gesture.current = { x: event.clientX, y: event.clientY, moved: false, mouse };
            // Keep receiving moves while a mouse drag leaves the surface.
            if (mouse) event.currentTarget.setPointerCapture(event.pointerId);
            updatePointer(event);
          }}
          onPointerUp={() => { interaction.current.dragging = false; }}
          onPointerCancel={() => { gesture.current = null; leavePointer(); }}
          onBlur={leavePointer}
          onClick={(event) => {
            const dragged = event.detail !== 0 && gesture.current?.moved;
            gesture.current = null;
            interaction.current.dragging = false;
            if (dragged) return;
            // The shockwave starts at the pointer; keyboard activation (detail 0) uses the centre.
            interaction.current.clickX = event.detail === 0 ? 0 : interaction.current.x;
            interaction.current.clickY = event.detail === 0 ? 0 : interaction.current.y;
            // Optional skip only; autoplay starts and continues without this event.
            setNextRequest((request) => request + 1);
          }}
        />
      </div>
      <HeroHud
        ref={hud}
        interaction={interaction}
        telemetry={telemetry}
        index={`${pad(playback.indexOf(phase) + 1)}/${pad(playback.length)}`}
        name={phase === 0 ? fx("hud.standby") : t(phaseNames[phase])}
        cycleKey={cycle.key}
        morph={morph}
        duration={phase === 0 ? 0 : morph + HOLD}
        reduced={reduced}
        labels={{
          shape: fx("hud.shape"),
          engine: fx("hud.engine"),
          morphing: fx("hud.morphing"),
          stable: fx("hud.stable"),
          static: fx("hud.static"),
          hint: fx("hud.hint"),
          hintTouch: fx("hud.hintTouch"),
        }}
      />
    </figure>
  );
}
