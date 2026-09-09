import { buildBrain } from "./hero-brain";
import { buildNetwork } from "./hero-network";

/** Positions and their visual attributes share a deterministic spatial ordering. */
export const PHASES = ["monogram", "brain", "network"] as const;
export type Phase = (typeof PHASES)[number];

export type Targets = Record<Phase, Float32Array> & {
  brainStyles: Float32Array;
  brainNormals: Float32Array;
  networkStyles: Float32Array;
  /** vec3 per particle: transition delay, path variation, size variation. */
  seeds: Float32Array;
  count: number;
};

type V2 = readonly [number, number];
type Stroke = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  width: number;
};
type Sample = { x: number; y: number; z: number; order: number };

const X_LIMIT = 2.15;
const Y_LIMIT = 1.7;

/** Integer hash avoids mutable PRNG state and platform-dependent sine hashes. */
function hash(index: number, salt: number) {
  let value = Math.imul(index + 1, 0x9e3779b1) ^ salt;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function line(strokes: Stroke[], a: V2, b: V2, width = 0.052) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy);
  if (length === 0) return;
  strokes.push({ x: a[0], y: a[1], dx, dy, length, width });
}

function polyline(strokes: Stroke[], points: readonly V2[], width = 0.052) {
  for (let i = 1; i < points.length; i++) {
    line(strokes, points[i - 1], points[i], width);
  }
}

function arc(
  strokes: Stroke[],
  cx: number,
  cy: number,
  radius: number,
  start: number,
  end: number,
  width = 0.052,
) {
  const segments = Math.max(4, Math.ceil(Math.abs(end - start) * 12));
  let previous: V2 = [cx + Math.cos(start) * radius, cy + Math.sin(start) * radius];
  for (let i = 1; i <= segments; i++) {
    const angle = start + ((end - start) * i) / segments;
    const next: V2 = [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    line(strokes, previous, next, width);
    previous = next;
  }
}

function monogramStrokes() {
  const strokes: Stroke[] = [];
  // T: a full-width cap and a centred stem.
  line(strokes, [-1.99, 0.82], [-0.91, 0.82], 0.17);
  line(strokes, [-1.45, 0.82], [-1.45, -0.9], 0.17);
  // D: a straight back with a rounded right side, not a rectangular outline.
  polyline(strokes, [[-0.65, -0.82], [-0.65, 0.82], [-0.3, 0.82]], 0.16);
  arc(strokes, -0.3, 0, 0.82, Math.PI / 2, -Math.PI / 2, 0.16);
  line(strokes, [-0.3, -0.82], [-0.65, -0.82], 0.16);
  // X: two solid diagonal strokes with space clear of the D.
  line(strokes, [0.91, 0.84], [1.96, -0.86], 0.17);
  line(strokes, [0.91, -0.86], [1.96, 0.84], 0.17);
  return strokes;
}

/** Interleave ten bits of each axis for a stable, local Morton ordering. */
function spreadBits(value: number) {
  value = (value | (value << 8)) & 0x00ff00ff;
  value = (value | (value << 4)) & 0x0f0f0f0f;
  value = (value | (value << 2)) & 0x33333333;
  return (value | (value << 1)) & 0x55555555;
}

function spatialOrder(x: number, y: number) {
  const ix = Math.max(0, Math.min(1023, Math.floor(((x + X_LIMIT) / (X_LIMIT * 2)) * 1023)));
  const iy = Math.max(0, Math.min(1023, Math.floor(((y + Y_LIMIT) / (Y_LIMIT * 2)) * 1023)));
  return spreadBits(ix) | (spreadBits(iy) << 1);
}

function orderedPositions(samples: Sample[]) {
  samples.sort((a, b) => a.order - b.order || a.x - b.x || a.y - b.y || a.z - b.z);
  const positions = new Float32Array(samples.length * 3);
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    positions[i * 3] = sample.x;
    positions[i * 3 + 1] = sample.y;
    positions[i * 3 + 2] = sample.z;
  }
  return positions;
}

function sampleStrokes(strokes: Stroke[], count: number, salt: number) {
  const totalLength = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
  const samples: Sample[] = [];
  let segmentIndex = 0;
  let segmentStart = 0;

  for (let i = 0; i < count; i++) {
    // One sample per equal arc-length interval, with small deterministic jitter.
    const distance = ((i + hash(i, salt)) / count) * totalLength;
    while (
      segmentIndex < strokes.length - 1 &&
      distance > segmentStart + strokes[segmentIndex].length
    ) {
      segmentStart += strokes[segmentIndex].length;
      segmentIndex++;
    }
    const segment = strokes[segmentIndex];
    const t = (distance - segmentStart) / segment.length;
    const offset = (hash(i, salt + 1) - 0.5) * segment.width;
    const x = segment.x + segment.dx * t - (segment.dy / segment.length) * offset;
    const y = segment.y + segment.dy * t + (segment.dx / segment.length) * offset;
    const z = (hash(i, salt + 2) - 0.5) * 0.08;
    samples.push({ x, y, z, order: spatialOrder(x, y) });
  }

  return orderedPositions(samples);
}

/** Reorder all attributes together so morphs keep both locality and surface detail. */
function orderModel<T extends { positions: Float32Array }>(model: T): T {
  const order = Array.from({ length: model.positions.length / 3 }, (_, index) => index);
  order.sort((a, b) => spatialOrder(model.positions[a * 3], model.positions[a * 3 + 1])
    - spatialOrder(model.positions[b * 3], model.positions[b * 3 + 1]) || a - b);
  const ordered = {} as Record<string, Float32Array>;
  for (const [name, values] of Object.entries(model) as [string, Float32Array][]) {
    const next = new Float32Array(values.length);
    for (let i = 0; i < order.length; i++) {
      next.set(values.subarray(order[i] * 3, order[i] * 3 + 3), i * 3);
    }
    ordered[name] = next;
  }
  return ordered as T;
}

export function buildTargets(count = 11000): Targets {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("Particle count must be a non-negative safe integer.");
  }
  const monogram = sampleStrokes(monogramStrokes(), count, 101);
  const brain = orderModel(buildBrain(count));
  const network = orderModel(buildNetwork(count));
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    seeds[i * 3] = hash(i, 401);
    seeds[i * 3 + 1] = hash(i, 503);
    seeds[i * 3 + 2] = hash(i, 601);
  }
  return {
    monogram, brain: brain.positions, network: network.positions,
    brainStyles: brain.styles, brainNormals: brain.normals,
    networkStyles: network.styles, seeds, count,
  };
}
