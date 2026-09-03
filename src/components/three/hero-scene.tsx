"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ScenePalette } from "./palette";
import { fragmentShader, vertexShader } from "./hero-shaders";
import { buildTargets, PHASES } from "./hero-targets";

type SceneProps = {
  palette: ScenePalette;
  reduced: boolean;
  /** 0..1 scroll progress of the hero, drives dispersal + a slow pull-back. */
  progressRef: React.RefObject<number>;
};

const damp = THREE.MathUtils.damp;

/** Timing (seconds). Max stagger delay is ≈0.84s, so a full sweep is ≈2.4s. */
const INTRO_HOLD = 1.8;
const HOLD = 6.5;
const POINT_DUR = 1.6;
const MORPH_TOTAL = 2.4;

/**
 * Layout decisions made once on the client.
 * side: 64 → 24,576 points on desktop; 40 → 9,600 on small or weak devices.
 * Narrow screens centre the field behind the copy and shrink it to fit.
 */
function pickLayout() {
  const narrow = window.innerWidth < 1024;
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  return {
    side: narrow || weak ? 40 : 64,
    offsetX: narrow ? 0 : 0.35,
    scale: narrow ? 0.8 : 1,
  };
}

function Field({
  palette,
  reduced,
  progressRef,
  side,
}: SceneProps & { side: number }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const hovered = useRef(false);
  const fade = useRef(0);
  const cycle = useRef({ from: 0, to: 0, elapsed: 0, hold: INTRO_HOLD });
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const geometry = useMemo(() => {
    const t = buildTargets(side);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(t.scatter, 3));
    g.setAttribute("aLattice", new THREE.BufferAttribute(t.lattice, 3));
    g.setAttribute("aHalo", new THREE.BufferAttribute(t.halo, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(t.seeds, 3));
    // Positions are displaced in the shader; a generous sphere avoids culling.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
    return g;
  }, [side]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Theme-independent initial uniforms; colours are synced in the effect below.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uElapsed: { value: 0 },
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uBurst: { value: 0 },
      uDisperse: { value: 0 },
      uSize: { value: 2.0 },
      uPixelRatio: { value: 1 },
      uDrift: { value: 0.06 },
      uMorphDur: { value: POINT_DUR },
      uAccentRatio: { value: 0.04 },
      uRayOrigin: { value: new THREE.Vector3(0, 0, 7) },
      uRayDir: { value: new THREE.Vector3(0, 0, -1) },
      uPointer: { value: 0 },
      uColor: { value: new THREE.Color("#000000") },
      uAccent: { value: new THREE.Color("#ff5a1f") },
      uOpacity: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const m = material.current;
    if (!m) return;
    (m.uniforms.uColor.value as THREE.Color).set(palette.point);
    (m.uniforms.uAccent.value as THREE.Color).set(palette.accent);
    m.blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    m.needsUpdate = true;
  }, [palette]);

  useEffect(() => {
    const el = gl.domElement;
    const enter = () => {
      hovered.current = true;
    };
    const leave = () => {
      hovered.current = false;
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    const u = m.uniforms;
    const dt = Math.min(delta, 0.05);

    fade.current = damp(fade.current, 1, 1.6, dt);
    u.uOpacity.value = palette.pointOpacity * fade.current;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uDisperse.value = progressRef.current ?? 0;

    // Slow sway around the baked "best angle" instead of a full spin, so the
    // lattice never degenerates into edge-on lines.
    if (points.current && !reduced) {
      points.current.rotation.y = Math.sin(u.uTime.value * 0.15) * 0.22;
    }

    // Pointer → world-space ray for repulsion.
    raycaster.setFromCamera(state.pointer, state.camera);
    (u.uRayOrigin.value as THREE.Vector3).copy(raycaster.ray.origin);
    (u.uRayDir.value as THREE.Vector3).copy(raycaster.ray.direction);
    u.uPointer.value = damp(u.uPointer.value, hovered.current && !reduced ? 1 : 0, 4, dt);

    if (reduced) {
      u.uDrift.value = 0;
      u.uFrom.value = 1;
      u.uTo.value = 1;
      u.uElapsed.value = 100;
      u.uBurst.value = 0;
      return;
    }

    u.uTime.value += dt;
    u.uDrift.value = 0.06;

    // scatter → lattice → halo → (burst) → scatter …
    const c = cycle.current;
    c.elapsed += dt;
    if (c.elapsed > c.hold) {
      c.from = c.to;
      c.to = (c.to + 1) % PHASES.length;
      c.elapsed = 0;
      c.hold = MORPH_TOTAL + HOLD;
    }
    u.uFrom.value = c.from;
    u.uTo.value = c.to;
    u.uElapsed.value = c.elapsed;
    u.uBurst.value = c.to === 0 ? 1 : 0;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </points>
  );
}

/** Rig: gentle pointer parallax + scroll pull-back, applied to the whole field. */
function Rig({
  children,
  reduced,
  progressRef,
  offsetX,
  scale,
}: {
  children: React.ReactNode;
  reduced: boolean;
  progressRef: React.RefObject<number>;
  offsetX: number;
  scale: number;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const p = progressRef.current ?? 0;
    const targetX = reduced ? 0 : state.pointer.y * 0.12;
    const targetY = reduced ? 0 : state.pointer.x * 0.2;
    group.current.rotation.x = damp(group.current.rotation.x, -targetX, 3, delta);
    group.current.rotation.y = damp(group.current.rotation.y, targetY, 3, delta);
    group.current.position.y = damp(group.current.position.y, p * 1.2, 4, delta);
    const cam = state.camera;
    cam.position.z = damp(cam.position.z, 7 + p * 1.2, 4, delta);
  });
  // On desktop the field is nudged right so it clears the headline's ragged edge.
  return (
    <group ref={group} position={[offsetX, 0, 0]} scale={scale}>
      {children}
    </group>
  );
}

export default function HeroScene({
  palette,
  reduced,
  progressRef,
  active,
}: SceneProps & { active: boolean }) {
  const [dpr, setDpr] = useState(1.5);
  const [layout] = useState(pickLayout);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 7], fov: 38 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))}
      />
      <Rig
        reduced={reduced}
        progressRef={progressRef}
        offsetX={layout.offsetX}
        scale={layout.scale}
      >
        <Field
          palette={palette}
          reduced={reduced}
          progressRef={progressRef}
          side={layout.side}
        />
      </Rig>
    </Canvas>
  );
}
