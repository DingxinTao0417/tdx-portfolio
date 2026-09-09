type Vector3 = readonly [number, number, number];
type NetworkNode = { center: Vector3; radius: number; accent: number };
type Connection = { start: Vector3; end: Vector3; bend: number; accent: number };
type Sample = { position: Vector3; style: Vector3 };

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function hash(index: number, salt: number) {
  let value = Math.imul(index + 1, 0x9e3779b1) ^ salt;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function allocate(total: number, parts: number, index: number) {
  return Math.floor(total / parts) + (index < total % parts ? 1 : 0);
}

/** Two 2-by-3 hidden layers expose actual depth, including in the resting pose. */
function architecture() {
  const layers = [
    { x: -1.77, ys: [0.72, 0, -0.72], zs: [0] },
    { x: -0.6, ys: [0.72, 0, -0.72], zs: [-0.55, 0.55] },
    { x: 0.6, ys: [0.72, 0, -0.72], zs: [-0.55, 0.55] },
    { x: 1.77, ys: [0.72, 0, -0.72], zs: [0] },
  ];
  const nodes: NetworkNode[][] = layers.map((layer, layerIndex) =>
    layer.ys.flatMap((y, rowIndex) => layer.zs.map((z, depthIndex) => ({
      center: [layer.x, y, z] as Vector3,
      radius: layerIndex === 3 ? 0.17 : 0.145,
      accent: (layerIndex === 1 && rowIndex === 1 && depthIndex === 1)
        || (layerIndex === 2 && rowIndex === 0 && depthIndex === 0)
        || (layerIndex === 3 && rowIndex === 1) ? 0.92 : 0.035,
    }))),
  );
  // Adjacent branches show information flow without an unreadable all-to-all mesh.
  const links = [
    [[0, 0], [0, 1], [1, 2], [1, 3], [2, 4], [2, 5]],
    [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
      [0, 2], [3, 1], [2, 4], [5, 3]],
    [[0, 0], [1, 0], [2, 1], [3, 1], [4, 2], [5, 2], [2, 0], [3, 2]],
  ];
  const connections: Connection[] = [];
  links.forEach((layerLinks, layerIndex) => {
    layerLinks.forEach(([fromIndex, toIndex], linkIndex) => {
      const from = nodes[layerIndex][fromIndex];
      const to = nodes[layerIndex + 1][toIndex];
      const delta = to.center.map((value, axis) => value - from.center[axis]);
      const length = Math.hypot(...delta);
      // Terminate outside each shell so dark wires never bisect the neuron cores.
      const start = from.center.map((value, axis) =>
        value + delta[axis] / length * from.radius * 1.1) as unknown as Vector3;
      const end = to.center.map((value, axis) =>
        value - delta[axis] / length * to.radius * 1.1) as unknown as Vector3;
      connections.push({
        start,
        end,
        bend: linkIndex % 2 === 0 ? 0.085 : -0.085,
        accent: from.accent > 0.5 && toIndex === fromIndex ? 0.3 : 0.025,
      });
    });
  });
  return { nodes: nodes.flat(), connections };
}

function viewingAngle([x, y, z]: Vector3): Vector3 {
  const yaw = -0.5;
  const pitch = 0.28;
  const turnedX = x * Math.cos(yaw) + z * Math.sin(yaw);
  const turnedZ = -x * Math.sin(yaw) + z * Math.cos(yaw);
  return [turnedX, y * Math.cos(pitch) - turnedZ * Math.sin(pitch),
    y * Math.sin(pitch) + turnedZ * Math.cos(pitch)];
}

/** Deterministic point shells, orbital contours, and sparse three-dimensional edges. */
export function buildNetwork(count: number): { positions: Float32Array; styles: Float32Array } {
  const { nodes, connections } = architecture();
  const samples: Sample[] = [];
  const neuronCount = Math.floor(count * 0.74);

  nodes.forEach((node, nodeIndex) => {
    const budget = allocate(neuronCount, nodes.length, nodeIndex);
    const shellCount = Math.floor(budget * 0.62);
    const contourCount = Math.floor(budget * 0.3);
    const centerCount = budget - shellCount - contourCount;
    const add = (x: number, y: number, z: number, alpha: number, size: number) => {
      samples.push({
        position: [node.center[0] + x, node.center[1] + y, node.center[2] + z],
        style: [node.accent, alpha, size],
      });
    };

    for (let i = 0; i < shellCount; i++) {
      const z = 1 - 2 * (i + 0.5) / shellCount;
      const radial = Math.sqrt(1 - z * z);
      const angle = i * GOLDEN_ANGLE + nodeIndex * 0.71;
      add(
        Math.cos(angle) * radial * node.radius,
        Math.sin(angle) * radial * node.radius,
        z * node.radius,
        0.4 + (z + 1) * 0.22,
        0.84 + (z + 1) * 0.09,
      );
    }

    // Two visible great-circle contours supply a crisp edge and an internal depth cue.
    for (let i = 0; i < contourCount; i++) {
      const circle = i % 2;
      const steps = allocate(contourCount, 2, circle);
      const angle = Math.floor(i / 2) / steps * TAU;
      const sine = Math.sin(angle);
      const cosine = Math.cos(angle);
      const radius = node.radius * 1.015;
      if (circle === 0) {
        add(cosine * radius, sine * radius * 0.94, sine * radius * 0.342, 0.88, 1.08);
      } else {
        add(cosine * radius * 0.34, sine * radius, cosine * radius * 0.94, 0.6, 0.92);
      }
    }

    for (let i = 0; i < centerCount; i++) {
      const z = 1 - 2 * (i + 0.5) / centerCount;
      const radial = Math.sqrt(1 - z * z);
      const angle = i * GOLDEN_ANGLE;
      const radius = node.radius * 0.25 * Math.cbrt(hash(i, 407 + nodeIndex));
      add(Math.cos(angle) * radial * radius, Math.sin(angle) * radial * radius,
        z * radius, 0.78, 1.06);
    }
  });

  const edgeCount = count - neuronCount;
  connections.forEach((connection, connectionIndex) => {
    const budget = allocate(edgeCount, connections.length, connectionIndex);
    for (let i = 0; i < budget; i++) {
      const t = (i + 0.5) / budget;
      const bow = Math.sin(Math.PI * t);
      // Single-file sampling keeps every connection fine, even at desktop quality.
      const position: Vector3 = [
        connection.start[0] + (connection.end[0] - connection.start[0]) * t,
        connection.start[1] + (connection.end[1] - connection.start[1]) * t,
        connection.start[2] + (connection.end[2] - connection.start[2]) * t
          + bow * connection.bend,
      ];
      samples.push({ position, style: [connection.accent, 0.38, 0.76] });
    }
  });

  // Bake the oblique view before sorting so even a paused model reveals both depth columns.
  samples.forEach((sample) => { sample.position = viewingAngle(sample.position); });
  // Position and appearance always travel together when the morph reorders samples.
  samples.sort((a, b) => a.position[0] - b.position[0]
    || a.position[1] - b.position[1] || a.position[2] - b.position[2]);
  const positions = new Float32Array(count * 3);
  const styles = new Float32Array(count * 3);
  samples.forEach((sample, i) => {
    positions.set(sample.position, i * 3);
    styles.set(sample.style, i * 3);
  });
  return { positions, styles };
}
