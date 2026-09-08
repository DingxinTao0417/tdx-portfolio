/**
 * Hero targets: a geometric TDX monogram, a code window, and a 3D database.
 * Letter strokes and the code window sit near the XY plane. Database layers
 * retain their depth and receive one baked X rotation to expose their tops.
 * All samples are deterministic and spatially ordered for the morph shader.
 */
export const PHASES = ["monogram", "code", "database"] as const;
export type Phase = (typeof PHASES)[number];

export const DATABASE_PITCH = 0.4;
export const DATABASE_RADIUS = 1.45;

export type Targets = Record<Phase, Float32Array> & {
  /** vec3 per particle: transition delay, accent selection, size variation. */
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

const TAU = Math.PI * 2;
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

function roundedRect(
  strokes: Stroke[],
  left: number,
  bottom: number,
  right: number,
  top: number,
  radius = 0.14,
  width = 0.052,
) {
  line(strokes, [left + radius, top], [right - radius, top], width);
  arc(strokes, right - radius, top - radius, radius, Math.PI / 2, 0, width);
  line(strokes, [right, top - radius], [right, bottom + radius], width);
  arc(strokes, right - radius, bottom + radius, radius, 0, -Math.PI / 2, width);
  line(strokes, [right - radius, bottom], [left + radius, bottom], width);
  arc(strokes, left + radius, bottom + radius, radius, -Math.PI / 2, -Math.PI, width);
  line(strokes, [left, bottom + radius], [left, top - radius], width);
  arc(strokes, left + radius, top - radius, radius, Math.PI, Math.PI / 2, width);
}

/** A narrow circular stroke overlaps itself to fill each window-control dot. */
function dot(strokes: Stroke[], x: number, y: number) {
  arc(strokes, x, y, 0.018, 0, TAU, 0.045);
}

function windowFrame(strokes: Stroke[]) {
  roundedRect(strokes, -2, -1.25, 2, 1.25, 0.16, 0.058);
  line(strokes, [-2, 0.76], [2, 0.76], 0.045);
  for (const x of [-1.66, -1.4, -1.14]) dot(strokes, x, 1);
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

function codeStrokes() {
  const strokes: Stroke[] = [];
  windowFrame(strokes);
  polyline(strokes, [[-0.8, 0.32], [-1.25, -0.12], [-0.8, -0.56]], 0.07);
  line(strokes, [0.22, 0.4], [-0.22, -0.65], 0.07);
  polyline(strokes, [[0.8, 0.32], [1.25, -0.12], [0.8, -0.56]], 0.07);
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

/** A square point grid clipped to a disk, with exactly the requested count. */
function diskGrid(count: number) {
  if (count === 0) return [];
  const radius = DATABASE_RADIUS - 0.025;
  let side = Math.ceil(Math.sqrt((count * 4) / Math.PI)) + 2;
  let candidates: V2[];
  do {
    candidates = [];
    const step = (radius * 2) / (side - 1);
    for (let row = 0; row < side; row++) {
      for (let col = 0; col < side; col++) {
        const x = -radius + col * step;
        const z = -radius + row * step;
        if (x * x + z * z <= radius * radius) candidates.push([x, z]);
      }
    }
    side++;
  } while (candidates.length < count);

  return Array.from({ length: count }, (_, i) =>
    candidates[Math.floor(((i + 0.5) * candidates.length) / count)],
  );
}

function databasePoints(count: number) {
  const samples: Sample[] = [];
  const layers = 4;
  const spacing = 0.6;
  const thickness = 0.26;
  const cosine = Math.cos(DATABASE_PITCH);
  const sine = Math.sin(DATABASE_PITCH);

  const add = (x: number, y: number, z: number) => {
    // Only this rotation is baked in; the shader can invert it for radial colour.
    const rotatedY = y * cosine - z * sine;
    const rotatedZ = y * sine + z * cosine;
    samples.push({ x, y: rotatedY, z: rotatedZ, order: spatialOrder(x, rotatedY) });
  };

  for (let layer = 0; layer < layers; layer++) {
    const layerCount = Math.floor(count / layers) + (layer < count % layers ? 1 : 0);
    const centreY = (layer - (layers - 1) / 2) * spacing;
    const topY = centreY + thickness / 2;
    const bottomY = centreY - thickness / 2;
    const topCount = Math.floor(layerCount * 0.46);
    const wallCount = Math.floor(layerCount * 0.14);
    const edgeCount = layerCount - topCount - wallCount;
    const salt = 701 + layer * 31;
    const top = diskGrid(topCount);

    for (let i = 0; i < topCount; i++) {
      const [x, z] = top[i];
      add(
        x + (hash(i, salt) - 0.5) * 0.008,
        topY + (hash(i, salt + 1) - 0.5) * 0.012,
        z + (hash(i, salt + 2) - 0.5) * 0.008,
      );
    }

    // Sparse samples connect the upper and lower edges into short cylinder walls.
    for (let i = 0; i < wallCount; i++) {
      const angle = ((i + hash(i, salt + 3)) / wallCount) * TAU;
      const radius = DATABASE_RADIUS + (hash(i, salt + 4) - 0.5) * 0.012;
      add(
        Math.cos(angle) * radius,
        bottomY + hash(i, salt + 5) * thickness,
        Math.sin(angle) * radius,
      );
    }

    // Both edges get more samples per unit length than the interior grid.
    for (let i = 0; i < edgeCount; i++) {
      const upper = i % 2 === 0;
      const edgeIndex = Math.floor(i / 2);
      const pointsOnEdge = upper ? Math.ceil(edgeCount / 2) : Math.floor(edgeCount / 2);
      const angle = ((edgeIndex + hash(i, salt + 6)) / pointsOnEdge) * TAU;
      const radius = DATABASE_RADIUS + (hash(i, salt + 7) - 0.5) * 0.022;
      add(
        Math.cos(angle) * radius,
        (upper ? topY : bottomY) + (hash(i, salt + 8) - 0.5) * 0.016,
        Math.sin(angle) * radius,
      );
    }
  }

  return orderedPositions(samples);
}

export function buildTargets(count = 7000): Targets {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("Particle count must be a non-negative safe integer.");
  }

  const monogram = sampleStrokes(monogramStrokes(), count, 101);
  const code = sampleStrokes(codeStrokes(), count, 211);
  const database = databasePoints(count);
  const seeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    seeds[i * 3] = hash(i, 401);
    seeds[i * 3 + 1] = hash(i, 503);
    seeds[i * 3 + 2] = hash(i, 601);
  }
  return { monogram, code, database, seeds, count };
}
