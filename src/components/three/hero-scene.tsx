"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import type { ScenePalette } from "./palette";
import { fragmentShader, vertexShader } from "./hero-shaders";
import { buildTargets } from "./hero-targets";
import { getNetworkNodes } from "./hero-network";
import { createHeroCycle, MORPH_DURATION, noteActivity, POINT_DURATION, requestNext, stepHeroCycle } from "./hero-cycle";
import type { HeroInteraction } from "./hero-interaction";

type SceneProps = {
  palette: ScenePalette;
  reduced: boolean;
  active: boolean;
  playing: boolean;
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
  palette, reduced, playing, nextRequest, interaction, onInvalidateReady, onPhaseChange, count,
}: Pick<SceneProps, "palette" | "reduced" | "playing" | "nextRequest" | "interaction" | "onInvalidateReady" | "onPhaseChange"> & { count: number }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const cycle = useRef(createHeroCycle(reduced));
  const skipNextDelta = useRef(true);
  const activityVersion = useRef(0);
  const hoverTime = useRef(0);
  const networkNodes = useMemo(() => getNetworkNodes(), []);
  const probes = useRef({ center: new THREE.Vector3(), edge: new THREE.Vector3(), axis: new THREE.Vector3(0, 1, 0) });

  const geometry = useMemo(() => {
    const targets = buildTargets(count);
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(targets.monogram, 3));
    result.setAttribute("aDatabase", new THREE.BufferAttribute(targets.database, 3));
    result.setAttribute("aDatabaseStyle", new THREE.BufferAttribute(targets.databaseStyles, 3));
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
    noteActivity(cycle.current);
    invalidate();
  }, [nextRequest, invalidate]);

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
    const input = interaction.current;
    const probe = probes.current;
    if (activityVersion.current !== input.activityVersion) {
      activityVersion.current = input.activityVersion;
      noteActivity(c);
    }
    u.uPixelRatio.value = state.gl.getPixelRatio();
    // Keep particle coverage consistent as the drawing surface grows, especially
    // on solid neurons; a larger canvas must not turn their faces into sparse dots.
    u.uSize.value = 2.4 * Math.max(1, state.size.width / (560 * Math.sqrt(count / 11000)));
    u.uMovement.value = reduced ? 0 : 1;

    const changedPhase = stepHeroCycle(c, dt, { playing, reduced });
    if (changedPhase !== null) onPhaseChange(changedPhase);
    u.uTime.value = c.time;
    u.uFrom.value = c.from;
    u.uTo.value = c.to;
    u.uElapsed.value = c.elapsed;

    if (points.current) {
      // Limit network parallax so its front and back neurons stay separated.
      const progress = THREE.MathUtils.smoothstep(c.elapsed, 0, MORPH_DURATION);
      const networkWeight = THREE.MathUtils.lerp(Number(c.from === 2), Number(c.to === 2), progress);
      const x = reduced || !input.inside ? 0 : -input.y * THREE.MathUtils.lerp(0.045, 0.015, networkWeight);
      const y = reduced || !input.inside ? 0 : input.x * THREE.MathUtils.lerp(0.065, 0.015, networkWeight);
      if (reduced) points.current.rotation.set(0, 0, 0);
      else if (playing) {
        points.current.rotation.x = THREE.MathUtils.damp(points.current.rotation.x, x, 3, dt);
        points.current.rotation.y = THREE.MathUtils.damp(points.current.rotation.y, y, 3, dt);
      }

      // Pick the 18 visible node faces, not thousands of morphing GPU particles.
      let hovered = -1;
      let nearest = Infinity;
      if (input.inside && c.to === 2 && c.elapsed >= MORPH_DURATION) {
        points.current.updateMatrixWorld();
        const angle = reduced ? 0 : Math.sin(c.time * 0.26) * 0.02;
        for (const node of networkNodes) {
          probe.center.fromArray(node.center).multiplyScalar(1.12);
          probe.edge.copy(probe.center);
          probe.edge.x += node.radius * 1.12;
          probe.center.applyAxisAngle(probe.axis, angle).applyMatrix4(points.current.matrixWorld).project(state.camera);
          probe.edge.applyAxisAngle(probe.axis, angle).applyMatrix4(points.current.matrixWorld).project(state.camera);
          const radius = Math.abs(probe.edge.x - probe.center.x) * state.size.width / 2 + 8;
          const distance = Math.hypot((input.x - probe.center.x) * state.size.width / 2,
            (input.y - probe.center.y) * state.size.height / 2);
          const score = distance / radius;
          if (score < 1 && score < nearest) { hovered = node.id; nearest = score; }
        }
      }
      if (hovered >= 0 && hovered !== u.uHoverNode.value) {
        u.uHoverNode.value = hovered;
        hoverTime.current = 0;
      }
      const strength = hovered >= 0 ? 1 : 0;
      u.uHoverStrength.value = playing && !reduced
        ? THREE.MathUtils.damp(u.uHoverStrength.value, strength, 12, dt) : strength;
      if (hovered < 0 && u.uHoverStrength.value < 0.002) u.uHoverNode.value = -1;
      if (playing && !reduced) hoverTime.current += dt;
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

export default function HeroScene({ palette, reduced, active, playing, nextRequest, interaction, onInvalidateReady, onPhaseChange, fallback }: SceneProps) {
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
        nextRequest={nextRequest} interaction={interaction} onInvalidateReady={onInvalidateReady}
        onPhaseChange={onPhaseChange} count={quality.count}
      />
    </Canvas>
  );
}
