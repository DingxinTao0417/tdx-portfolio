export const HOLD = 6.8;
export const POINT_DURATION = 2;
export const MORPH_DURATION = POINT_DURATION + 0.4;
// Shader IDs stay fixed: lettering(0), database(1), network(2), lattice(3).
// Monogram/TDX phase removed from playback.
export const PLAYBACK_ORDER = [2, 1, 3] as const;
export const REDUCED_PHASE = 1;
const TIME_EPSILON = 1e-9;

export type HeroCycle = {
  index: number;
  from: number;
  to: number;
  elapsed: number;
  hold: number;
  time: number;
  pending: boolean;
  reduced: boolean;
};

export function createHeroCycle(reduced = false): HeroCycle {
  const phase = reduced ? REDUCED_PHASE : PLAYBACK_ORDER[0];
  return {
    index: PLAYBACK_ORDER.indexOf(phase),
    from: phase,
    to: phase,
    elapsed: MORPH_DURATION,
    hold: 0,
    time: 0,
    pending: false,
    reduced,
  };
}

/** A burst of clicks reserves only one transition after the current morph. */
export function requestNext(cycle: HeroCycle) {
  cycle.pending = true;
}

function advance(cycle: HeroCycle, instant: boolean) {
  cycle.index = (cycle.index + 1) % PLAYBACK_ORDER.length;
  const next = PLAYBACK_ORDER[cycle.index];
  cycle.from = instant ? next : cycle.to;
  cycle.to = next;
  cycle.elapsed = instant ? MORPH_DURATION : 0;
  cycle.hold = 0;
  cycle.pending = false;
  return next;
}

/** Advance a deterministic cycle; the scene supplies zero delta on resume. */
export function stepHeroCycle(
  cycle: HeroCycle,
  delta: number,
  { active, reduced }: { active: boolean; reduced: boolean },
): number | null {
  // Offscreen/background rendering must not consume time or queued interaction.
  if (!active) return null;

  if (reduced !== cycle.reduced) {
    cycle.reduced = reduced;
    if (reduced) {
      // A preference change supersedes any queued animated transition.
      cycle.index = PLAYBACK_ORDER.indexOf(REDUCED_PHASE);
      cycle.from = REDUCED_PHASE;
      cycle.to = REDUCED_PHASE;
      cycle.elapsed = MORPH_DURATION;
      cycle.hold = 0;
      cycle.pending = false;
      return REDUCED_PHASE;
    }
    // Resume autoplay with a full hold on the manually selected static phase.
    cycle.from = cycle.to;
    cycle.elapsed = MORPH_DURATION;
    cycle.hold = 0;
  }

  if (reduced) {
    return cycle.pending ? advance(cycle, true) : null;
  }

  const dt = Number.isFinite(delta) ? Math.max(0, Math.min(delta, 0.05)) : 0;
  cycle.time += dt;

  if (cycle.elapsed < MORPH_DURATION) {
    cycle.elapsed = Math.min(MORPH_DURATION, cycle.elapsed + dt);
    if (cycle.elapsed < MORPH_DURATION - TIME_EPSILON) return null;
    cycle.elapsed = MORPH_DURATION;
    // Only use the completed target as a new origin, never an in-flight one.
    return cycle.pending ? advance(cycle, false) : null;
  }

  // Manual intent wins when a click and the automatic deadline share a frame.
  if (cycle.pending) return advance(cycle, false);

  cycle.hold += dt;
  if (cycle.hold >= HOLD - TIME_EPSILON) {
    return advance(cycle, false);
  }
  return null;
}
