"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { ScenePalette } from "./palette";

export type SphereItem = {
  name: string;
  category: string;
  weight: number; // 0..1
};

type Props = {
  items: SphereItem[];
  palette: ScenePalette;
  activeCategory: string | null;
  categoryColors: Record<string, string>;
  reduced: boolean;
  active: boolean;
};

/** Evenly distributes N points on a sphere (Fibonacci lattice). */
function fibonacciSphere(count: number, radius: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return pts;
}

function Cloud({
  items,
  palette,
  activeCategory,
  categoryColors,
  reduced,
}: Omit<Props, "active">) {
  const group = useRef<THREE.Group>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();
  const radius = 2.45;
  const positions = useMemo(() => fibonacciSphere(items.length, radius), [items.length]);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const world = useMemo(() => new THREE.Vector3(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reduced) g.rotation.y += delta * 0.12;

    // Fade labels/nodes that are on the far side of the sphere.
    const mesh = nodes.current;
    for (let i = 0; i < positions.length; i++) {
      world.copy(positions[i]).applyMatrix4(g.matrixWorld);
      const depth = world.clone().sub(camera.position).length();
      const t = THREE.MathUtils.clamp((depth - (6.4 - radius)) / (radius * 2), 0, 1); // 0 = near, 1 = far
      const item = items[i];
      const dimmed = activeCategory !== null && item.category !== activeCategory;
      const opacity = (1 - t * 0.85) * (dimmed ? 0.18 : 1);
      const el = labelRefs.current[i];
      if (el) {
        el.style.opacity = String(opacity);
        el.style.transform = `scale(${0.75 + (1 - t) * 0.35})`;
      }
      if (mesh) {
        tmp.position.copy(positions[i]);
        const s = (0.045 + item.weight * 0.05) * (dimmed ? 0.5 : 1);
        tmp.scale.setScalar(s);
        tmp.updateMatrix();
        mesh.setMatrixAt(i, tmp.matrix);
        color.set(dimmed ? palette.wire : categoryColors[item.category] ?? palette.accent);
        mesh.setColorAt(i, color);
      }
    }
    if (mesh) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {/* Structural wireframe */}
      <mesh>
        <sphereGeometry args={[radius * 0.98, 24, 16]} />
        <meshBasicMaterial color={palette.wire} wireframe transparent opacity={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.12, 0.004, 8, 128]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0.5, 0]}>
        <torusGeometry args={[radius * 1.25, 0.003, 8, 128]} />
        <meshBasicMaterial color={palette.amber} transparent opacity={0.3} />
      </mesh>

      {/* Nodes */}
      <instancedMesh ref={nodes} args={[undefined, undefined, items.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Labels */}
      {items.map((item, i) => (
        <Html
          key={item.name}
          position={positions[i]}
          center
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none", transition: "opacity 120ms linear" }}
        >
          <div
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 font-mono text-[12px] tracking-[0.06em] text-fg shadow-soft backdrop-blur-sm"
            style={{
              borderColor:
                activeCategory === item.category ? categoryColors[item.category] : undefined,
              fontWeight: item.weight > 0.85 ? 600 : 400,
            }}
          >
            {item.name}
          </div>
        </Html>
      ))}
    </group>
  );
}

export default function TechSphere(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={props.active ? "always" : "never"}
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1} />
      <Cloud {...props} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        autoRotate={false}
      />
    </Canvas>
  );
}
