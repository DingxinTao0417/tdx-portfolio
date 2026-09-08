"use client";

import { Code2, Database, Pause, Play } from "lucide-react";
import { useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Component, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { palettes } from "./palette";

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
      <span className="font-mono text-3xl font-semibold tracking-tight">TDX</span>
      <span className="h-px w-6 bg-current" />
      <Code2 className="h-14 w-14" strokeWidth={1} />
      <span className="h-px w-6 bg-current" />
      <Database className="h-14 w-14" strokeWidth={1} />
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
  const palette = useMemo(() => ({
    ...palettes[resolvedTheme === "dark" ? "dark" : "light"],
    accent: resolvedTheme === "dark" ? "#ee805a" : "#c94720",
  }), [resolvedTheme]);

  return (
    <figure ref={wrapper} className={cn("relative min-w-0", className)} aria-label={t("description")} data-hero-particles data-phase={reduced ? 2 : phase} data-playing={playing && !reduced}>
      <div className="relative aspect-[6/5] w-full" aria-hidden>
        <SceneBoundary fallback={<Fallback />}>
          <HeroScene
            palette={palette} reduced={reduced} active={inView && visible}
            playing={playing} onPhaseChange={setPhase} fallback={<Fallback />}
          />
        </SceneBoundary>
      </div>
      <figcaption className="mx-auto flex max-w-sm items-center justify-center gap-5 font-mono text-[11px] tracking-[0.08em] text-muted sm:gap-7 sm:text-xs">
        {["monogram", "code", "database"].map((key, index) => (
          <span key={key} className={cn("flex items-center gap-2 transition-colors duration-700 motion-reduce:transition-none", (reduced ? 2 : phase) === index && "text-accent")}>
            <span className="text-[9px] opacity-60" aria-hidden>0{index + 1}</span>
            {t(key)}
          </span>
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
