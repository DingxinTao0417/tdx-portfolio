type Vector3 = readonly [number, number, number];
type NetworkNode = { id: number; center: Vector3; radius: number; accent: number };
type Connection = {
  fromId: number; toId: number;
  start: Vector3; end: Vector3; bend: number; accent: number;
};
type Sample = { position: Vector3; style: Vector3; link: Vector3 };

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

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
  let nextId = 0;
  const nodes: NetworkNode[][] = layers.map((layer, layerIndex) =>
    layer.ys.flatMap((y, rowIndex) => layer.zs.map((z, depthIndex) => ({
      id: nextId++,
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
      // Terminate outside each node so dark wires never bisect its filled face.
      const start = from.center.map((value, axis) =>
        value + delta[axis] / length * from.radius * 1.1) as unknown as Vector3;
      const end = to.center.map((value, axis) =>
        value - delta[axis] / length * to.radius * 1.1) as unknown as Vector3;
      connections.push({
        fromId: from.id,
        toId: to.id,
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

/** Centers share the particle model's baked view; the scene applies its own scale. */
export function getNetworkNodes(): { id: number; center: Vector3; radius: number }[] {
  return architecture().nodes.map(({ id, center, radius }) => ({
    id, center: viewingAngle(center), radius,
  }));
}

/** Filled, camera-facing neuron discs and sparse three-dimensional connections. */
export function buildNetwork(count: number): {
  positions: Float32Array; styles: Float32Array; links: Float32Array;
} {
  const { nodes, connections } = architecture();
  const samples: Sample[] = [];
  const neuronCount = Math.floor(count * 0.74);

  nodes.forEach((node, nodeIndex) => {
    const budget = allocate(neuronCount, nodes.length, nodeIndex);
    const center = viewingAngle(node.center);

    // Uniform disc sampling spends every neuron particle on its visible face.
    // Bake the view into the center first so the discs stay round, not oblique.
    for (let i = 0; i < budget; i++) {
      const radial = Math.sqrt((i + 0.5) / budget);
      const angle = i * GOLDEN_ANGLE + nodeIndex * 0.71;
      const cap = 1 - radial * radial;
      samples.push({
        position: [
          center[0] + Math.cos(angle) * radial * node.radius,
          center[1] + Math.sin(angle) * radial * node.radius,
          center[2] + cap * node.radius * 0.12,
        ],
        // Overlapping opaque points remove the hollow shell and central-knot look.
        // Slightly larger output nodes keep the same coverage per visible area.
        style: [node.accent, 1.55 + cap * 0.18, 1.38 * node.radius / 0.145],
        link: [node.id, node.id, -1],
      });
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
      samples.push({
        position: viewingAngle(position),
        style: [connection.accent, 0.38, 0.76],
        link: [connection.fromId, connection.toId, t],
      });
    }
  });

  // Position, appearance, and graph identity travel together through both sorts.
  samples.sort((a, b) => a.position[0] - b.position[0]
    || a.position[1] - b.position[1] || a.position[2] - b.position[2]);
  const positions = new Float32Array(count * 3);
  const styles = new Float32Array(count * 3);
  const links = new Float32Array(count * 3);
  samples.forEach((sample, i) => {
    positions.set(sample.position, i * 3);
    styles.set(sample.style, i * 3);
    links.set(sample.link, i * 3);
  });
  return { positions, styles, links };
}
