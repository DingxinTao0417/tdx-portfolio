import assert from "node:assert/strict";
import test from "node:test";
import {
  HOLD,
  MORPH_DURATION,
  PLAYBACK_ORDER,
  REDUCED_PHASE,
  createHeroCycle,
  requestNext,
  stepHeroCycle,
} from "../src/components/three/hero-cycle.ts";

const FRAME = 0.05;
const ACTIVE = { active: true, reduced: false };
const INACTIVE = { active: false, reduced: false };
const REDUCED = { active: true, reduced: true };

function runFrames(cycle, count, options = ACTIVE) {
  const transitions = [];
  for (let frame = 0; frame < count; frame += 1) {
    const next = stepHeroCycle(cycle, FRAME, options);
    if (next !== null) transitions.push(next);
  }
  return transitions;
}

function nextTransition(cycle) {
  const maxFrames = Math.ceil((HOLD + MORPH_DURATION) / FRAME) + 2;
  for (let frame = 1; frame <= maxFrames; frame += 1) {
    const next = stepHeroCycle(cycle, FRAME, ACTIVE);
    if (next !== null) return { next, frames: frame };
  }
  assert.fail("The visible particle cycle must continue to its next shape");
}

test("autoplay starts at lettering and repeats the complete intended order for six rounds", () => {
  assert.deepEqual(PLAYBACK_ORDER, [0, 2, 1, 3]);
  const cycle = createHeroCycle();
  assert.equal(cycle.to, 0);
  assert.equal(cycle.from, 0);

  const seen = [cycle.to];
  for (let transition = 0; transition < 24; transition += 1) {
    const previous = cycle.to;
    const { next } = nextTransition(cycle);
    seen.push(next);
    assert.equal(cycle.from, previous);
    assert.equal(cycle.to, next);
    assert.equal(cycle.elapsed, 0);
  }

  assert.deepEqual(seen, Array.from({ length: 25 }, (_, index) => [0, 2, 1, 3][index % 4]));
});

test("every automatic transition keeps the same hold and morph cadence without user input", () => {
  const cycle = createHeroCycle();
  const first = nextTransition(cycle);
  assert.ok(Math.abs(first.frames * FRAME - HOLD) <= FRAME);

  for (let transition = 0; transition < 12; transition += 1) {
    const startedAt = cycle.time;
    const { frames } = nextTransition(cycle);
    assert.ok(Math.abs(frames * FRAME - (HOLD + MORPH_DURATION)) <= FRAME);
    assert.ok(Math.abs(cycle.time - startedAt - (HOLD + MORPH_DURATION)) <= FRAME);
  }
});

test("each morph finishes before the next shape begins its full hold", () => {
  const cycle = createHeroCycle();
  assert.equal(nextTransition(cycle).next, 2);

  assert.deepEqual(runFrames(cycle, Math.ceil(MORPH_DURATION / FRAME)), []);
  assert.equal(cycle.from, 0);
  assert.equal(cycle.to, 2);
  assert.equal(cycle.elapsed, MORPH_DURATION);
  assert.equal(cycle.hold, 0);
  assert.deepEqual(runFrames(cycle, Math.round(HOLD / FRAME) - 1), []);
  assert.equal(cycle.to, 2);
  assert.equal(stepHeroCycle(cycle, FRAME, ACTIVE), 1);
  assert.equal(cycle.from, 2);
  assert.equal(cycle.elapsed, 0);
});

test("offscreen or background frames freeze hold and morph, then autoplay resumes without input", () => {
  const cycle = createHeroCycle();
  runFrames(cycle, 20);
  const before = structuredClone(cycle);
  assert.deepEqual(runFrames(cycle, 400, INACTIVE), []);
  assert.deepEqual(cycle, before);

  assert.equal(stepHeroCycle(cycle, 0, ACTIVE), null);
  assert.deepEqual(cycle, before);
  const resumedHold = nextTransition(cycle);
  assert.equal(resumedHold.next, 2);
  assert.ok(Math.abs(resumedHold.frames * FRAME - (HOLD - before.hold)) <= FRAME);

  runFrames(cycle, 12);
  const midMorph = structuredClone(cycle);
  assert.deepEqual(runFrames(cycle, 400, INACTIVE), []);
  assert.deepEqual(cycle, midMorph);
  assert.equal(stepHeroCycle(cycle, 0, ACTIVE), null);
  assert.deepEqual(cycle, midMorph);

  const resumedMorph = nextTransition(cycle);
  assert.equal(resumedMorph.next, 1);
  assert.equal(cycle.from, 2);
  assert.ok(Math.abs(resumedMorph.frames * FRAME - (MORPH_DURATION - midMorph.elapsed + HOLD)) <= FRAME);
});

test("reduced motion stays static indefinitely", () => {
  const cycle = createHeroCycle(true);
  const before = structuredClone(cycle);
  assert.equal(cycle.to, REDUCED_PHASE);
  assert.deepEqual(runFrames(cycle, 2000, REDUCED), []);
  assert.deepEqual(cycle, before);
});

test("turning reduced motion on settles immediately and turning it off restores autoplay", () => {
  const cycle = createHeroCycle();
  nextTransition(cycle);
  runFrames(cycle, 10);
  assert.equal(stepHeroCycle(cycle, FRAME, REDUCED), REDUCED_PHASE);
  assert.equal(cycle.from, REDUCED_PHASE);
  assert.equal(cycle.to, REDUCED_PHASE);
  assert.equal(cycle.elapsed, MORPH_DURATION);
  const staticState = structuredClone(cycle);
  assert.deepEqual(runFrames(cycle, 2000, REDUCED), []);
  assert.deepEqual(cycle, staticState);

  assert.equal(stepHeroCycle(cycle, 0, ACTIVE), null);
  assert.equal(cycle.from, REDUCED_PHASE);
  assert.equal(cycle.to, REDUCED_PHASE);
  const resumed = nextTransition(cycle);
  assert.equal(resumed.next, PLAYBACK_ORDER[(PLAYBACK_ORDER.indexOf(REDUCED_PHASE) + 1) % 4]);
  assert.ok(Math.abs(resumed.frames * FRAME - HOLD) <= FRAME);
});

test("invalid or negative delta cannot corrupt time, hold, or an in-progress morph", () => {
  const invalid = [Number.NaN, Infinity, -Infinity, -1, -0.05, 0];
  for (const midMorph of [false, true]) {
    const cycle = createHeroCycle();
    if (midMorph) nextTransition(cycle);
    runFrames(cycle, 10);
    const before = structuredClone(cycle);
    for (const delta of invalid) {
      assert.equal(stepHeroCycle(cycle, delta, ACTIVE), null);
      assert.deepEqual(cycle, before);
    }
  }
});

test("large frame gaps are bounded instead of skipping through multiple shapes", () => {
  const cycle = createHeroCycle();
  assert.equal(stepHeroCycle(cycle, 3600, ACTIVE), null);
  assert.ok(cycle.time > 0 && cycle.time <= FRAME);
  assert.ok(cycle.hold > 0 && cycle.hold <= FRAME);
  assert.equal(cycle.to, PLAYBACK_ORDER[0]);
  assert.equal(nextTransition(cycle).next, 2);
  assert.equal(stepHeroCycle(cycle, 3600, ACTIVE), null);
  assert.ok(cycle.elapsed > 0 && cycle.elapsed <= FRAME);
  assert.equal(cycle.to, 2);
});

test("a click advances during a hold and autoplay continues with a full morph and hold", () => {
  const cycle = createHeroCycle();
  runFrames(cycle, 20);
  requestNext(cycle);
  assert.equal(stepHeroCycle(cycle, FRAME, ACTIVE), 2);
  assert.equal(cycle.from, 0);
  assert.equal(cycle.elapsed, 0);
  assert.equal(cycle.hold, 0);
  assert.equal(cycle.pending, false);

  const resumed = nextTransition(cycle);
  assert.equal(resumed.next, 1);
  assert.ok(Math.abs(resumed.frames * FRAME - (MORPH_DURATION + HOLD)) <= FRAME);
  assert.equal(nextTransition(cycle).next, 3);
});

test("clicks during a morph merge into one queued transition without interrupting its origin", () => {
  const cycle = createHeroCycle();
  assert.equal(nextTransition(cycle).next, 2);
  runFrames(cycle, 12);

  for (let click = 0; click < 5; click += 1) requestNext(cycle);
  const remainingFrames = Math.round((MORPH_DURATION - cycle.elapsed) / FRAME);
  assert.deepEqual(runFrames(cycle, remainingFrames - 1), []);
  assert.equal(cycle.from, 0);
  assert.equal(cycle.to, 2);
  assert.equal(cycle.pending, true);

  assert.equal(stepHeroCycle(cycle, FRAME, ACTIVE), 1);
  assert.equal(cycle.from, 2);
  assert.equal(cycle.elapsed, 0);
  assert.equal(cycle.pending, false);
  const resumed = nextTransition(cycle);
  assert.equal(resumed.next, 3);
  assert.ok(Math.abs(resumed.frames * FRAME - (MORPH_DURATION + HOLD)) <= FRAME);
});

test("a click on the automatic deadline advances once and starts a fresh cadence", () => {
  const cycle = createHeroCycle();
  runFrames(cycle, Math.round(HOLD / FRAME) - 1);
  requestNext(cycle);
  assert.equal(stepHeroCycle(cycle, FRAME, ACTIVE), 2);
  assert.equal(cycle.pending, false);
  assert.equal(stepHeroCycle(cycle, FRAME, ACTIVE), null);
  assert.equal(cycle.to, 2);
  const resumed = nextTransition(cycle);
  assert.equal(resumed.next, 1);
  assert.ok(Math.abs((resumed.frames + 1) * FRAME - (MORPH_DURATION + HOLD)) <= FRAME);
});

test("offscreen frames preserve a queued click until rendering resumes", () => {
  const cycle = createHeroCycle();
  requestNext(cycle);
  const before = structuredClone(cycle);
  assert.deepEqual(runFrames(cycle, 400, INACTIVE), []);
  assert.deepEqual(cycle, before);
  assert.equal(stepHeroCycle(cycle, 0, ACTIVE), 2);
  assert.equal(cycle.pending, false);
});

test("reduced motion allows immediate manual changes and restores autoplay from the selected shape", () => {
  const cycle = createHeroCycle(true);
  for (const expected of [3, 0]) {
    requestNext(cycle);
    assert.equal(stepHeroCycle(cycle, FRAME, REDUCED), expected);
    assert.equal(cycle.from, expected);
    assert.equal(cycle.to, expected);
    assert.equal(cycle.elapsed, MORPH_DURATION);
    const selected = structuredClone(cycle);
    assert.deepEqual(runFrames(cycle, 2000, REDUCED), []);
    assert.deepEqual(cycle, selected);
  }

  assert.equal(stepHeroCycle(cycle, 0, ACTIVE), null);
  const resumed = nextTransition(cycle);
  assert.equal(resumed.next, 2);
  assert.ok(Math.abs(resumed.frames * FRAME - HOLD) <= FRAME);
});
