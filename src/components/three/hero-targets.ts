/**
 * Target shapes for the hero particle field.
 *
 * Every point owns one position per phase; the vertex shader interpolates
 * between them. Generation is fully deterministic (hash-based), so the same
 * cloud is produced on every mount and nothing here depends on Math.random.
 *
 *   scatter — raw, unlabelled data: an anisotropic cloud with streaks + outliers
 *   lattice — the model: six stacked 2.8×2.8 planes, seen in three-quarter view
 *   halo    — the running system: a tilted torus with two thin outer rings
 */

export const PHASES = ["scatter", "lattice", "halo"] as const;
export type Phase = (typeof PHASES)[number];

const LAYERS = 6;
const TAU = Math.PI * 2;
/** Global scale so the structure sits inside the right-hand canvas with air around it. */
const SCALE = 0.78;

/** Points needed to fill the lattice exactly: layers × side². */
export function pointCount(side: number) {
  return LAYERS * side * side;
}

type V3 = [number, number, number];

function hash(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Standard normal via Box–Muller on two hashes. */
function gauss(i: number, salt: number) {
  const u = Math.max(hash(i, salt), 1e-6);
  const v = hash(i, salt + 17);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

function rotX([x, y, z]: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}
function rotY([x, y, z]: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}
function rotZ([x, y, z]: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c, z];
}

function scatterPoint(i: number): V3 {
  const kind = hash(i, 1);

  // 3% outliers on a loose shell.
  if (kind < 0.03) {
    const th = hash(i, 2) * TAU;
    const ph = Math.acos(2 * hash(i, 3) - 1);
    const r = 1.6 + hash(i, 4) * 0.7;
    return [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)];
  }

  // 6% along five thin streaks shooting through the cloud.
  if (kind < 0.09) {
    const k = Math.floor(hash(i, 5) * 5);
    const dir = rotY(rotZ([1, 0, 0], k * 0.7 + 0.3), k * 1.1);
    const len = (hash(i, 6) - 0.5) * 4.2;
    const j = 0.05;
    return [
      dir[0] * len + gauss(i, 7) * j,
      dir[1] * len + gauss(i, 8) * j,
      dir[2] * len + gauss(i, 9) * j,
    ];
  }

  // Bulk: anisotropic gaussian, rotated so the long axis runs diagonally.
  const p = rotZ([gauss(i, 10) * 1.15, gauss(i, 11) * 0.72, gauss(i, 12) * 0.6], 0.6);
  const r = Math.hypot(p[0], p[1], p[2]);
  if (r > 2.3) {
    const s = 2.3 / r;
    return [p[0] * s, p[1] * s, p[2] * s];
  }
  return p;
}

function latticePoint(i: number, side: number): V3 {
  const perLayer = side * side;
  const layer = Math.floor(i / perLayer);
  const rem = i - layer * perLayer;
  const row = Math.floor(rem / side);
  const col = rem - row * side;

  const extent = 2.8;
  const step = extent / (side - 1);
  const j = 0.006;
  // Horizontal sheets stacked along Y — read as "layers" from any angle.
  const p: V3 = [
    -extent / 2 + col * step + (hash(i, 13) - 0.5) * j,
    -1.25 + layer * 0.5 + (hash(i, 14) - 0.5) * j,
    -extent / 2 + row * step + (hash(i, 15) - 0.5) * j,
  ];
  // Yaw for a diagonal footprint, pitch so we look down onto the stack.
  return rotX(rotY(p, 0.6), 0.35);
}

function haloPoint(i: number): V3 {
  const k = hash(i, 16);
  const u = hash(i, 17) * TAU;
  const v = hash(i, 18) * TAU;
  const fill = Math.sqrt(hash(i, 19));

  let R: number;
  let r: number;
  let tilt: V3;
  if (k < 0.7) {
    R = 1.5;
    r = 0.1 * fill;
    tilt = [-0.95, 0, 0.25];
  } else if (k < 0.88) {
    R = 1.9;
    r = 0.03 * fill;
    tilt = [-0.6, 0, 0.25];
  } else {
    R = 2.25;
    r = 0.02 * fill;
    tilt = [-1.25, 0.4, 0.25];
  }

  const p: V3 = [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)];
  return rotZ(rotY(rotX(p, tilt[0]), tilt[1]), tilt[2]);
}

export type Targets = {
  scatter: Float32Array;
  lattice: Float32Array;
  halo: Float32Array;
  /** vec3 per point: delay seed, accent seed, size jitter. */
  seeds: Float32Array;
  count: number;
};

export function buildTargets(side: number): Targets {
  const count = pointCount(side);
  const scatter = new Float32Array(count * 3);
  const lattice = new Float32Array(count * 3);
  const halo = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const o = i * 3;
    const s = scatterPoint(i);
    const l = latticePoint(i, side);
    const h = haloPoint(i);
    scatter[o] = s[0] * SCALE;
    scatter[o + 1] = s[1] * SCALE;
    scatter[o + 2] = s[2] * SCALE;
    lattice[o] = l[0] * SCALE;
    lattice[o + 1] = l[1] * SCALE;
    lattice[o + 2] = l[2] * SCALE;
    halo[o] = h[0] * SCALE;
    halo[o + 1] = h[1] * SCALE;
    halo[o + 2] = h[2] * SCALE;
    seeds[o] = hash(i, 20);
    seeds[o + 1] = hash(i, 21);
    seeds[o + 2] = hash(i, 22);
  }

  return { scatter, lattice, halo, seeds, count };
}
