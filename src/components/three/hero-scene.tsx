"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import type { ScenePalette } from "./palette";
import { fragmentShader, vertexShader } from "./hero-shaders";
import { buildTargets } from "./hero-targets";
import { getNetworkLayers, NETWORK_SCALE, NETWORK_SWAY } from "./hero-network";
import { createHeroCycle, MORPH_DURATION, POINT_DURATION, requestNext, stepHeroCycle } from "./hero-cycle";
import type { HeroInteraction } from "./hero-interaction";

type SceneProps = {
  palette: ScenePalette;
  reduced: boolean;
  active: boolean;
  nextRequest: number;
  interaction: RefObject<HeroInteraction>;
  onInvalidateReady: (invalidate: (() => void) | null) => void;
  onPhaseChange: (phase: number) => void;
  fallback: ReactNode;
};

function pickQuality() {
  const small = window.innerWidth < 768;
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  return {
    count: small || weak ? 7200 : 11000,
    // Fixed for this mount; never resize the canvas for a mid-morph quality change.
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
  };
}

function Field({
  palette, reduced, active, nextRequest, interaction, onInvalidateReady, onPhaseChange, count,
}: Pick<SceneProps, "palette" | "reduced" | "active" | "nextRequest" | "interaction" | "onInvalidateReady" | "onPhaseChange"> & { count: number }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const cycle = useRef(createHeroCycle(reduced));
  const skipNextDelta = useRef(true);
  const hoverTime = useRef(0);
  const networkLayers = useMemo(() => getNetworkLayers(), []);
  const probes = useRef({ corner: new THREE.Vector3(), axis: new THREE.Vector3(0, 1, 0) });

  const geometry = useMemo(() => {
    const targets = buildTargets(count);
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(targets.monogram, 3));
    result.setAttribute("aDatabase", new THREE.BufferAttribute(targets.database, 3));
    result.setAttribute("aDatabaseStyle", new THREE.BufferAttribute(targets.databaseStyles, 3));
    result.setAttribute("aDatabaseDetail", new THREE.BufferAttribute(targets.databaseDetails, 3));
    result.setAttribute("aNetwork", new THREE.BufferAttribute(targets.network, 3));
    result.setAttribute("aNetworkStyle", new THREE.BufferAttribute(targets.networkStyles, 3));
    result.setAttribute("aNetworkLink", new THREE.BufferAttribute(targets.networkLinks, 3));
    result.setAttribute("aLattice", new THREE.BufferAttribute(targets.lattice, 3));
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
    uSize: { value: 2.4 },
    uPixelRatio: { value: 1 },
    uMovement: { value: 1 },
    uHoverNode: { value: -1 },
    uHoverTime: { value: 0 },
    uHoverStrength: { value: 0 },
    uColor: { value: new THREE.Color(palette.point) },
    uAccent: { value: new THREE.Color(palette.accent) },
    uOpacity: { value: palette.additive ? 0.95 : 0.9 },
  }), [palette.point, palette.accent, palette.additive]);

  useEffect(() => {
    invalidate();
  }, [palette, invalidate]);

  useEffect(() => {
    onInvalidateReady(invalidate);
    onPhaseChange(cycle.current.to);
    return () => onInvalidateReady(null);
  }, [onInvalidateReady, invalidate, onPhaseChange]);

  useEffect(() => {
    if (nextRequest === 0) return;
    requestNext(cycle.current);
    invalidate();
  }, [nextRequest, invalidate]);

  // Returning onscreen must not count time spent hidden in the next frame.
  useEffect(() => {
    skipNextDelta.current = true;
    invalidate();
  }, [active, reduced, invalidate]);

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    const dt = skipNextDelta.current ? 0 : Math.min(delta, 0.05);
    skipNextDelta.current = false;
    const u = m.uniforms;
    const c = cycle.current;
    const input = interaction.current;
    const probe = probes.current;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    // Keep the point-grid coverage consistent as the drawing surface grows.
    u.uSize.value = 2.4 * Math.max(1, state.size.width / (560 * Math.sqrt(count / 11000)));
    u.uMovement.value = reduced ? 0 : 1;

    const changedPhase = stepHeroCycle(c, dt, { active, reduced });
    if (changedPhase !== null) onPhaseChange(changedPhase);
    u.uTime.value = c.time;
    u.uFrom.value = c.from;
    u.uTo.value = c.to;
    u.uElapsed.value = c.elapsed;

    if (points.current) {
      // Gentle parallax exposes slab thickness without overlapping nearby layers.
      const progress = THREE.MathUtils.smoothstep(c.elapsed, 0, MORPH_DURATION);
      const networkWeight = THREE.MathUtils.lerp(Number(c.from === 2), Number(c.to === 2), progress);
      const x = reduced || !input.inside ? 0 : -input.y * THREE.MathUtils.lerp(0.045, 0.028, networkWeight);
      const y = reduced || !input.inside ? 0 : input.x * THREE.MathUtils.lerp(0.065, 0.040, networkWeight);
      if (reduced) points.current.rotation.set(0, 0, 0);
      else if (active) {
        points.current.rotation.x = THREE.MathUtils.damp(points.current.rotation.x, x, 3, dt);
        points.current.rotation.y = THREE.MathUtils.damp(points.current.rotation.y, y, 3, dt);
      }

      // Project the cuboid bounds so tall feature maps have layer-shaped hit areas.
      let hovered = -1;
      let nearest = Infinity;
      if (input.inside && c.to === 2 && c.elapsed >= MORPH_DURATION) {
        points.current.updateMatrixWorld();
        const angle = reduced ? 0 : Math.sin(c.time * 0.26) * NETWORK_SWAY;
        for (const layer of networkLayers) {
          let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
          for (const corner of layer.corners) {
            probe.corner.fromArray(corner).multiplyScalar(NETWORK_SCALE)
              .applyAxisAngle(probe.axis, angle).applyMatrix4(points.current.matrixWorld).project(state.camera);
            left = Math.min(left, probe.corner.x);
            right = Math.max(right, probe.corner.x);
            bottom = Math.min(bottom, probe.corner.y);
            top = Math.max(top, probe.corner.y);
          }
          const padX = 12 / state.size.width;
          const padY = 12 / state.size.height;
          if (input.x < left - padX || input.x > right + padX || input.y < bottom - padY || input.y > top + padY) continue;
          const score = Math.abs(input.x - (left + right) / 2) / (right - left + padX * 2)
            + 0.15 * Math.abs(input.y - (top + bottom) / 2) / (top - bottom + padY * 2);
          if (score < nearest) { hovered = layer.id; nearest = score; }
        }
      }
      if (hovered >= 0 && hovered !== u.uHoverNode.value) {
        u.uHoverNode.value = hovered;
        hoverTime.current = 0;
      }
      const strength = hovered >= 0 ? 1 : 0;
      u.uHoverStrength.value = active && !reduced
        ? THREE.MathUtils.damp(u.uHoverStrength.value, strength, 12, dt) : strength;
      if (hovered < 0 && u.uHoverStrength.value < 0.002) u.uHoverNode.value = -1;
      if (active && !reduced) hoverTime.current += dt;
      u.uHoverTime.value = hoverTime.current;
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

export default function HeroScene({ palette, reduced, active, nextRequest, interaction, onInvalidateReady, onPhaseChange, fallback }: SceneProps) {
  const [quality] = useState(pickQuality);
  return (
    <Canvas
      dpr={quality.dpr}
      frameloop={active && !reduced ? "always" : "demand"}
      camera={{ position: [0, 0, 7], fov: 38 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      fallback={fallback}
      onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping; }}
    >
      <Field
        palette={palette} reduced={reduced} active={active}
        nextRequest={nextRequest} interaction={interaction} onInvalidateReady={onInvalidateReady}
        onPhaseChange={onPhaseChange} count={quality.count}
      />
    </Canvas>
  );
}
