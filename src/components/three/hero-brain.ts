type Vec2 = readonly [number, number];
type Vec3 = readonly [number, number, number];
type Segment = { a: Vec2; b: Vec2; length: number; start: number };

type BrainGeometry = {
  positions: Float32Array;
  styles: Float32Array;
  normals: Float32Array;
};

const TAU = Math.PI * 2;
const PITCH = -0.16;
const YAW = -0.12;

// Open, branching sulci give each hemisphere a cortex instead of latitude rings.
// Coordinates describe one hemisphere's projected unit disk, then wrap in depth.
const SULCI: readonly (readonly Vec2[])[] = [
  [[0.25, 0.91], [0.32, 0.76], [0.25, 0.60], [0.31, 0.46], [0.44, 0.39], [0.46, 0.23], [0.39, 0.09], [0.46, -0.08], [0.58, -0.17], [0.59, -0.34]],
  [[0.51, 0.79], [0.48, 0.65], [0.57, 0.53], [0.70, 0.54], [0.76, 0.40], [0.66, 0.29], [0.67, 0.15], [0.79, 0.08], [0.93, 0.16]],
  [[0.08, 0.71], [0.16, 0.58], [0.12, 0.41], [0.21, 0.29], [0.19, 0.11], [0.10, 0.02]],
  [[0.12, -0.18], [0.29, -0.13], [0.44, -0.23], [0.59, -0.35], [0.78, -0.36], [0.91, -0.23]],
  [[0.10, -0.39], [0.26, -0.36], [0.36, -0.48], [0.34, -0.64], [0.47, -0.73], [0.54, -0.82]],
  [[0.66, -0.51], [0.56, -0.56], [0.57, -0.69], [0.70, -0.69]],
  [[0.09, -0.68], [0.19, -0.62], [0.23, -0.76], [0.18, -0.91]],
  [[0.37, 0.13], [0.27, 0.05], [0.30, -0.09]],
  [[0.82, 0.40], [0.90, 0.30], [0.91, 0.04], [0.85, -0.07], [0.72, -0.09]],
  [[0.37, 0.65], [0.37, 0.55], [0.48, 0.49]],
];

function hash(index: number, salt: number) {
  let value = Math.imul(index + 1, 0x9e3779b1) ^ salt;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function catmull(points: readonly Vec2[], section: number, t: number): Vec2 {
  const a = points[Math.max(0, section - 1)];
  const b = points[section];
  const c = points[section + 1];
  const d = points[Math.min(points.length - 1, section + 2)];
  const t2 = t * t;
  const t3 = t2 * t;
  const coordinate = (axis: 0 | 1) => 0.5 * (
    2 * b[axis] + (-a[axis] + c[axis]) * t +
    (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t2 +
    (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t3
  );
  return [coordinate(0), coordinate(1)];
}

function cortexPaths() {
  const segments: Segment[] = [];
  let total = 0;
  for (const path of SULCI) {
    let a = path[0];
    for (let section = 0; section < path.length - 1; section++) {
      for (let step = 1; step <= 10; step++) {
        const b = catmull(path, section, step / 10);
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        segments.push({ a, b, length, start: total });
        total += length;
        a = b;
      }
    }
  }
  return { segments, total };
}

function grooveDistance(x: number, y: number, segments: readonly Segment[]) {
  let distance2 = 4;
  for (const { a, b } of segments) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1,
      ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy),
    ));
    const px = x - a[0] - dx * t;
    const py = y - a[1] - dy * t;
    distance2 = Math.min(distance2, px * px + py * py);
  }
  return Math.sqrt(distance2);
}

function normalize(x: number, y: number, z: number): Vec3 {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function rotate([x, y, z]: Vec3): Vec3 {
  const py = y * Math.cos(PITCH) - z * Math.sin(PITCH);
  const pz = y * Math.sin(PITCH) + z * Math.cos(PITCH);
  return [x * Math.cos(YAW) + pz * Math.sin(YAW), py, -x * Math.sin(YAW) + pz * Math.cos(YAW)];
}

function surface(u: number, v: number, side: number, front: number, distance: number) {
  const w = Math.sqrt(Math.max(0.002, 1 - u * u - v * v));
  const fold = Math.exp(-Math.pow(distance / 0.033, 2));
  const shoulder = Math.exp(-Math.pow((distance - 0.067) / 0.033, 2));
  const ripple = 0.017 * Math.sin(u * 31 + v * 13) * Math.sin(v * 21 - u * 7);
  const recess = 0.105 * fold;
  const x = side * (0.058 + u * (1.47 + 0.05 * Math.sin(v * 4.2)));
  // A central cleft, broad frontal lobes and tucked lower midline shape the silhouette.
  const y = v * 1.19 + 0.045 + 0.035 * u
    - 0.12 * Math.exp(-u * 7) * Math.max(0, v)
    + 0.14 * Math.exp(-u * 7) * Math.max(0, -v);
  const z = front * (0.90 * w + (0.043 * shoulder + ripple - recess) * Math.sqrt(w));
  return {
    position: [x, y, z] as Vec3,
    normal: normalize(side * u / 1.49, v / 1.19, front * w / 0.9),
    fold,
    shoulder,
  };
}

/** Deterministic, genuinely volumetric cortex with a restrained internal tract. */
export function buildBrain(count: number): BrainGeometry {
  const positions = new Float32Array(count * 3);
  const styles = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const paths = cortexPaths();
  const cortexCount = Math.floor(count * 0.63);
  const ridgeCount = Math.floor(count * 0.33);
  const stemCount = Math.floor(count * 0.025);

  const write = (index: number, position: Vec3, normal: Vec3, style: Vec3) => {
    positions.set(rotate(position), index * 3);
    normals.set(rotate(normal), index * 3);
    styles.set(style, index * 3);
  };

  for (let i = 0; i < cortexCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    // Projected equal-area sampling spends detail on the visible cortex.
    const radius = Math.sqrt(hash(i, 1801)) * 0.998;
    const angle = hash(i, 1807) * Math.PI - Math.PI / 2;
    const u = radius * Math.cos(angle);
    const v = radius * Math.sin(angle);
    const front = hash(i, 1811) > 0.16 ? 1 : -1;
    const distance = grooveDistance(u, v, paths.segments);
    const point = surface(u, v, side, front, distance);
    const opacity = (0.66 + point.shoulder * 0.20) * (1 - point.fold * 0.84);
    write(i, point.position, point.normal, [
      0.025 + point.shoulder * 0.12,
      opacity * (front > 0 ? 1 : 0.48),
      0.77 + hash(i, 1823) * 0.25,
    ]);
  }

  for (let j = 0; j < ridgeCount; j++) {
    const i = cortexCount + j;
    const side = j % 2 === 0 ? -1 : 1;
    const laneCount = Math.ceil(ridgeCount / 4);
    const distance = ((Math.floor(j / 4) + hash(j, 1901) * 0.65) / laneCount) * paths.total;
    let low = 0;
    let high = paths.segments.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const segment = paths.segments[middle];
      if (segment.start + segment.length < distance) low = middle + 1;
      else high = middle;
    }
    const segment = paths.segments[low];
    const t = (distance - segment.start) / segment.length;
    const dx = (segment.b[0] - segment.a[0]) / segment.length;
    const dy = (segment.b[1] - segment.a[1]) / segment.length;
    const bank = (Math.floor(j / 2) % 2 === 0 ? 1 : -1) * (0.055 + hash(j, 1913) * 0.010);
    const u = Math.max(0.01, segment.a[0] + dx * segment.length * t - dy * bank);
    const v = segment.a[1] + dy * segment.length * t + dx * bank;
    const radius = Math.hypot(u, v);
    const safe = radius > 0.99 ? 0.99 / radius : 1;
    const point = surface(u * safe, v * safe, side, 1, Math.abs(bank));
    write(i, point.position, point.normal, [
      0.30 + hash(j, 1919) * 0.26,
      0.90 + hash(j, 1921) * 0.10,
      0.91 + hash(j, 1927) * 0.18,
    ]);
  }

  // The small descending stem makes the lower silhouette anatomical at a glance.
  for (let j = 0; j < stemCount; j++) {
    const i = cortexCount + ridgeCount + j;
    const t = hash(j, 2003);
    const angle = hash(j, 2011) * TAU;
    const radius = 0.13 - t * 0.055;
    write(i, [radius * Math.cos(angle), -0.96 - t * 0.38, 0.12 + radius * Math.sin(angle)],
      normalize(Math.cos(angle), 0.2, Math.sin(angle)), [0.10, 0.54, 0.8]);
  }

  // A few arched commissural fibres connect the hemispheres under the outer shell.
  for (let i = cortexCount + ridgeCount + stemCount; i < count; i++) {
    const j = i - cortexCount - ridgeCount - stemCount;
    const lane = j % 4;
    const t = hash(j, 2101);
    const x = (t * 2 - 1) * (0.62 + lane * 0.05);
    const y = -0.09 + lane * 0.11 + Math.sin(t * Math.PI) * 0.15;
    const z = -0.11 + lane * 0.055 + Math.sin(t * Math.PI) * 0.20;
    write(i, [x, y, z], [0, 0, 0], [0.72, 0.31, 0.76]);
  }

  return { positions, styles, normals };
}
