"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { ScenePalette } from "./palette";
import { fragmentShader, vertexShader } from "./hero-shaders";
import { buildTargets, PHASES } from "./hero-targets";

type SceneProps = {
  palette: ScenePalette;
  reduced: boolean;
  active: boolean;
  playing: boolean;
  onPhaseChange: (phase: number) => void;
  fallback: ReactNode;
};

const HOLD = 4.8;
const POINT_DURATION = 2;
// Maximum shader delay is 0.4 seconds. All points must arrive before swapping targets.
const MORPH_DURATION = POINT_DURATION + 0.4;

function pickQuality() {
  const small = window.innerWidth < 768;
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  return {
    count: small || weak ? 4200 : 7000,
    // Fixed for this mount; never resize the canvas for a mid-morph quality change.
    dpr: Math.min(window.devicePixelRatio || 1, small || weak ? 1.25 : 1.5),
  };
}

function Field({
  palette, reduced, playing, onPhaseChange, count,
}: Pick<SceneProps, "palette" | "reduced" | "playing" | "onPhaseChange"> & { count: number }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const cycle = useRef({ from: 0, to: 0, elapsed: MORPH_DURATION, hold: 0, time: 0 });
  const skipNextDelta = useRef(true);

  const geometry = useMemo(() => {
    const targets = buildTargets(count);
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(targets.monogram, 3));
    result.setAttribute("aCode", new THREE.BufferAttribute(targets.code, 3));
    result.setAttribute("aDatabase", new THREE.BufferAttribute(targets.database, 3));
    result.setAttribute("aSeed", new THREE.BufferAttribute(targets.seeds, 3));
    result.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return result;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uElapsed: { value: MORPH_DURATION },
    uFrom: { value: 0 },
    uTo: { value: 0 },
    uMorphDur: { value: POINT_DURATION },
    uSize: { value: 1.8 },
    uPixelRatio: { value: 1 },
    uMovement: { value: 1 },
    uColor: { value: new THREE.Color(palette.point) },
    uAccent: { value: new THREE.Color(palette.accent) },
    uOpacity: { value: palette.additive ? 0.82 : 0.78 },
  }), [palette.point, palette.accent, palette.additive]);

  useEffect(() => {
    invalidate();
  }, [palette, invalidate]);

  // Resume without counting time spent paused in the next animation frame.
  useEffect(() => {
    skipNextDelta.current = true;
    invalidate();
  }, [playing, reduced, invalidate]);

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    const dt = skipNextDelta.current ? 0 : Math.min(delta, 0.05);
    skipNextDelta.current = false;
    const u = m.uniforms;
    const c = cycle.current;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uMovement.value = reduced ? 0 : 1;

    if (!reduced && playing) {
      c.time += dt;
      if (c.elapsed < MORPH_DURATION) {
        c.elapsed = Math.min(MORPH_DURATION, c.elapsed + dt);
      } else {
        c.hold += dt;
        if (c.hold >= HOLD) {
          c.from = c.to;
          c.to = (c.to + 1) % PHASES.length;
          c.elapsed = 0;
          c.hold = 0;
          onPhaseChange(c.to);
        }
      }
    }
    u.uTime.value = c.time;
    u.uFrom.value = reduced ? 2 : c.from;
    u.uTo.value = reduced ? 2 : c.to;
    u.uElapsed.value = reduced ? MORPH_DURATION : c.elapsed;

    if (points.current) {
      // The database has a baked viewing angle; keep the letters almost front-on.
      const x = reduced ? 0 : -state.pointer.y * 0.045;
      const y = reduced ? 0 : state.pointer.x * 0.065;
      if (reduced) points.current.rotation.set(0, 0, 0);
      else if (playing) {
        points.current.rotation.x = THREE.MathUtils.damp(points.current.rotation.x, x, 3, dt);
        points.current.rotation.y = THREE.MathUtils.damp(points.current.rotation.y, y, 3, dt);
      }
    }
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material} uniforms={uniforms}
        vertexShader={vertexShader} fragmentShader={fragmentShader}
        transparent depthWrite={false} depthTest={false}
      />
    </points>
  );
}

export default function HeroScene({ palette, reduced, active, playing, onPhaseChange, fallback }: SceneProps) {
  const [quality] = useState(pickQuality);
  return (
    <Canvas
      dpr={quality.dpr}
      frameloop={active && playing && !reduced ? "always" : "demand"}
      camera={{ position: [0, 0, 7], fov: 38 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      fallback={fallback}
      onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; }}
    >
      <Field
        palette={palette} reduced={reduced} playing={active && playing}
        onPhaseChange={onPhaseChange} count={quality.count}
      />
    </Canvas>
  );
}
