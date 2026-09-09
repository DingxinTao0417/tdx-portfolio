"use client";

import { Brain, Network, Pause, Play } from "lucide-react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Component, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { palettes } from "./palette";

const phases = ["monogram", "brain", "network"] as const;

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
    <div className="absolute inset-0 flex items-center justify-center gap-6 text-accent/50">
      <span className="font-mono text-3xl font-semibold tracking-tight">
        <span className="text-accent">T</span><span className="text-fg">DX</span>
      </span>
      <span className="h-px w-6 bg-current" />
      <Brain className="h-14 w-14" strokeWidth={1} />
      <span className="h-px w-6 bg-current" />
      <Network className="h-14 w-14" strokeWidth={1} />
    </div>
  );
}

/** Particle silhouettes with a pause control and a readable text equivalent. */
export function HeroCanvas({ className }: { className?: string }) {
  const t = useTranslations("Home.particles");
  const wrapper = useRef<HTMLElement>(null);
  const inView = useInView(wrapper, { amount: 0.15 });
  const { resolvedTheme } = useTheme();
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, serverSnapshot);
  const visible = useSyncExternalStore(subscribeVisibility, getVisible, serverSnapshot);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const [selection, setSelection] = useState({ index: 1, version: 0 });
  const palette = useMemo(() => ({
    ...palettes[resolvedTheme === "dark" ? "dark" : "light"],
    accent: resolvedTheme === "dark" ? "#ee805a" : "#c94720",
  }), [resolvedTheme]);

  return (
    <figure ref={wrapper} className={cn("relative min-w-0", className)} aria-label={t("description")} data-hero-particles data-phase={reduced ? selection.index : phase} data-playing={playing && !reduced}>
      <div className="relative aspect-[6/5] w-full" aria-hidden>
        <SceneBoundary fallback={<Fallback />}>
          <HeroScene
            palette={palette} reduced={reduced} active={inView && visible}
            playing={playing} selection={selection} onPhaseChange={setPhase} fallback={<Fallback />}
          />
        </SceneBoundary>
      </div>
      <figcaption className="mx-auto flex max-w-md items-center justify-center gap-3 font-mono text-[11px] tracking-[0.04em] text-muted sm:gap-5 sm:text-xs">
        {phases.map((key, index) => (
          <button key={key} type="button"
            onClick={() => setSelection((current) => ({ index, version: current.version + 1 }))}
            aria-pressed={(reduced ? selection.index : phase) === index}
            className={cn("flex min-h-11 items-center gap-1.5 whitespace-nowrap transition-colors hover:text-accent motion-reduce:transition-none", (reduced ? selection.index : phase) === index && "text-accent")}>
            <span className="hidden text-[9px] opacity-60 min-[360px]:inline" aria-hidden>0{index + 1}</span>
            {t(key)}
          </button>
        ))}
        {!reduced && (
          <button
            type="button" onClick={() => setPlaying((current) => !current)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent"
            aria-label={t(playing ? "pause" : "play")} title={t(playing ? "pause" : "play")}
          >
            {playing ? <Pause className="h-3 w-3" aria-hidden /> : <Play className="h-3 w-3" aria-hidden />}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
