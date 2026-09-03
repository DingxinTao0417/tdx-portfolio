"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  MeshDistortMaterial,
  PerformanceMonitor,
  Sparkles,
} from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ScenePalette } from "./palette";

type SceneProps = {
  palette: ScenePalette;
  reduced: boolean;
  /** 0..1 scroll progress of the hero, drives a slow zoom-out. */
  progressRef: React.RefObject<number>;
};

const damp = THREE.MathUtils.damp;

/** Deterministic pseudo-random in [0, 1) so renders stay pure and SSR-safe. */
function noise(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Molten core: a distorted icosahedron with a metallic, emissive skin. */
function Core({ palette, reduced }: { palette: ScenePalette; reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!mesh.current || reduced) return;
    mesh.current.rotation.y += delta * 0.18;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.92, 24]} />
      <MeshDistortMaterial
        color={palette.core}
        emissive={palette.coreEmissive}
        emissiveIntensity={palette.emissiveIntensity}
        metalness={0.7}
        roughness={0.22}
        clearcoat={1}
        clearcoatRoughness={0.12}
        distort={reduced ? 0 : 0.42}
        speed={reduced ? 0 : 1.4}
        envMapIntensity={palette.envIntensity}
      />
    </mesh>
  );
}

/** Wireframe shells: two counter-rotating icosahedron edge cages. */
function Cage({ palette, reduced }: { palette: ScenePalette; reduced: boolean }) {
  const outer = useRef<THREE.LineSegments>(null);
  const inner = useRef<THREE.LineSegments>(null);
  const outerGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.1, 1)),
    [],
  );
  const innerGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.45, 0)),
    [],
  );
  useFrame((_, delta) => {
    if (reduced) return;
    if (outer.current) {
      outer.current.rotation.y -= delta * 0.08;
      outer.current.rotation.z += delta * 0.03;
    }
    if (inner.current) {
      inner.current.rotation.y += delta * 0.14;
      inner.current.rotation.x -= delta * 0.05;
    }
  });
  return (
    <>
      <lineSegments ref={outer} geometry={outerGeo}>
        <lineBasicMaterial color={palette.wire} transparent opacity={0.55} />
      </lineSegments>
      <lineSegments ref={inner} geometry={innerGeo}>
        <lineBasicMaterial color={palette.amber} transparent opacity={0.8} />
      </lineSegments>
    </>
  );
}

/** Data ring: points orbiting on a tilted circle, like a telemetry halo. */
function DataRing({ palette, reduced }: { palette: ScenePalette; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 420;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = 2.7 + (noise(i) - 0.5) * 0.28;
      arr[i * 3] = Math.cos(t) * r;
      arr[i * 3 + 1] = (noise(i, 1) - 0.5) * 0.08;
      arr[i * 3 + 2] = Math.sin(t) * r;
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += delta * 0.22;
  });
  return (
    <points ref={ref} rotation={[Math.PI / 2.6, 0, 0.4]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={palette.particle}
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}

/** Floating low-poly shards drifting around the core. */
function Shards({ palette, reduced }: { palette: ScenePalette; reduced: boolean }) {
  const shards = useMemo(
    () =>
      [
        { p: [2.9, 1.2, -0.6], s: 0.28, r: 1 },
        { p: [-2.6, -1.1, 0.4], s: 0.22, r: 2 },
        { p: [-2.2, 1.7, -1.2], s: 0.18, r: 3 },
        { p: [2.3, -1.6, 0.8], s: 0.2, r: 4 },
        { p: [0.4, 2.5, -1.6], s: 0.16, r: 5 },
        { p: [-0.6, -2.6, -0.2], s: 0.24, r: 6 },
        { p: [3.4, -0.2, -1.9], s: 0.14, r: 7 },
      ] as const,
    [],
  );
  return (
    <>
      {shards.map((s, i) => (
        <Float
          key={i}
          speed={reduced ? 0 : 1.2 + (i % 3) * 0.3}
          rotationIntensity={reduced ? 0 : 1.4}
          floatIntensity={reduced ? 0 : 1.6}
          floatingRange={[-0.25, 0.25]}
        >
          <mesh position={[s.p[0], s.p[1], s.p[2]]} rotation={[s.r, s.r * 0.7, 0]}>
            {i % 2 === 0 ? (
              <octahedronGeometry args={[s.s, 0]} />
            ) : (
              <tetrahedronGeometry args={[s.s, 0]} />
            )}
            <meshStandardMaterial
              color={i % 3 === 0 ? palette.accent : palette.shard}
              metalness={0.6}
              roughness={0.25}
              flatShading
              envMapIntensity={palette.envIntensity}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/** Rig: pointer parallax + scroll zoom, applied to the whole composition. */
function Rig({
  children,
  reduced,
  progressRef,
}: {
  children: React.ReactNode;
  reduced: boolean;
  progressRef: React.RefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const p = progressRef.current ?? 0;
    const targetX = reduced ? 0 : state.pointer.y * 0.25;
    const targetY = reduced ? 0 : state.pointer.x * 0.45;
    group.current.rotation.x = damp(group.current.rotation.x, -targetX, 3, delta);
    group.current.rotation.y = damp(group.current.rotation.y, targetY, 3, delta);
    const scale = 1 - p * 0.28;
    group.current.scale.setScalar(damp(group.current.scale.x, scale, 4, delta));
    group.current.position.y = damp(group.current.position.y, p * 1.4, 4, delta);
    const cam = state.camera;
    cam.position.z = damp(cam.position.z, 7 + p * 1.5, 4, delta);
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ palette, reduced, progressRef }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={2.2} color={palette.amber} />
      <directionalLight position={[-5, -2, -4]} intensity={1.4} color={palette.cool} />
      <pointLight position={[0, 0, 0]} intensity={reduced ? 0 : 6} color={palette.coreEmissive} distance={6} />

      <Rig reduced={reduced} progressRef={progressRef}>
        <Core palette={palette} reduced={reduced} />
        <Cage palette={palette} reduced={reduced} />
        <DataRing palette={palette} reduced={reduced} />
        <Shards palette={palette} reduced={reduced} />
        <Sparkles
          count={reduced ? 0 : 90}
          scale={[8, 6, 6]}
          size={2.2}
          speed={0.35}
          opacity={0.7}
          color={palette.particle}
        />
      </Rig>

      {/* Procedural environment — no external HDR files needed. */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.5} color={palette.amber} position={[4, 3, 2]} scale={[6, 2, 1]} form="rect" />
        <Lightformer intensity={1.6} color={palette.cool} position={[-5, 2, -2]} scale={[4, 3, 1]} form="rect" />
        <Lightformer intensity={0.9} color="#ffffff" position={[0, -5, 2]} scale={[8, 1, 1]} form="rect" />
        <Lightformer intensity={1.2} color={palette.accent} position={[0, 4, -5]} scale={[10, 1, 1]} form="ring" />
      </Environment>
    </>
  );
}

export default function HeroScene({
  palette,
  reduced,
  progressRef,
  active,
}: SceneProps & { active: boolean }) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 7], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))}
      />
      <Scene palette={palette} reduced={reduced} progressRef={progressRef} />
    </Canvas>
  );
}
