/**
 * GLSL for the hero particle field. All motion lives in the vertex shader:
 * per-point staggered morphing between three target attributes, idle noise
 * drift, pointer repulsion, and scroll dispersal. One draw call.
 */

// Simplex 3D noise — Ian McEwan / Ashima Arts (MIT).
const simplex = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uElapsed;     // seconds since the current morph began
uniform float uFrom;        // 0 scatter · 1 lattice · 2 halo
uniform float uTo;
uniform float uBurst;       // 1 while dissolving back to scatter
uniform float uDisperse;    // hero scroll progress 0..1
uniform float uSize;        // base point size in CSS px
uniform float uPixelRatio;
uniform float uDrift;       // idle noise amplitude
uniform float uMorphDur;    // per-point travel time
uniform float uAccentRatio; // share of permanently accent-coloured points
uniform vec3 uRayOrigin;
uniform vec3 uRayDir;
uniform float uPointer;     // 0..1 pointer influence

attribute vec3 aLattice;
attribute vec3 aHalo;
attribute vec3 aSeed;       // delay seed · accent seed · size jitter

varying float vHeat;
varying float vAlpha;
varying float vAccent;

${simplex}

vec3 pick(float i) {
  return mix(mix(position, aLattice, step(0.5, i)), aHalo, step(1.5, i));
}

float easeInOut(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
  vec3 from = pick(uFrom);
  vec3 to = pick(uTo);

  // Staggered morph: the wave sweeps outward from the centre, jittered per point.
  float delay = aSeed.x * 0.45 + min(length(from), 2.6) * 0.15;
  float t = clamp((uElapsed - delay) / uMorphDur, 0.0, 1.0);
  float e = easeInOut(t);
  vec3 p = mix(from, to, e);

  // Mid-flight swell; a full outward burst when the structure dissolves.
  float travel = length(to - from);
  float arc = sin(t * 3.14159265);
  vec3 radial = normalize(p + vec3(1e-4));
  p += radial * arc * (uBurst * 0.7 + 0.12 * min(travel, 1.0));

  // Heat = energy of motion. Points that barely move stay cool.
  float heat = arc * clamp(travel / 0.5, 0.0, 1.0);

  // Idle drift so the field never fully freezes.
  vec3 q = p * 0.9 + uTime * 0.12;
  p += vec3(snoise(q), snoise(q + 31.7), snoise(q + 71.3)) * uDrift;

  // Scroll: fly apart and fade as the hero leaves.
  p += radial * uDisperse * 2.2;

  vec4 wp = modelMatrix * vec4(p, 1.0);

  // Pointer repulsion, measured as distance to the pointer ray in world space.
  vec3 toP = wp.xyz - uRayOrigin;
  vec3 perp = toP - dot(toP, uRayDir) * uRayDir;
  float d = length(perp);
  float push = smoothstep(0.95, 0.0, d) * uPointer;
  wp.xyz += (perp / max(d, 1e-4)) * push * 0.55;
  heat = max(heat, push * 0.9);

  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;

  float accent = step(1.0 - uAccentRatio, aSeed.y);
  vAccent = accent;
  vHeat = clamp(heat, 0.0, 1.0);

  float depth = -mv.z;
  vAlpha = smoothstep(10.5, 5.0, depth) * (1.0 - uDisperse);

  float size = uSize * (0.85 + aSeed.z * 0.3) * (1.0 + accent * 0.7 + vHeat * 0.5);
  gl_PointSize = size * uPixelRatio * (7.0 / max(depth, 0.1));
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;

varying float vHeat;
varying float vAlpha;
varying float vAccent;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float hot = max(vAccent, vHeat);

  // Neutral points are crisp discs; hot points gain a soft glow skirt.
  float core = smoothstep(0.5, 0.32, d);
  float glow = smoothstep(0.5, 0.05, d) * 0.6;
  float a = mix(core, max(core, glow), hot);

  vec3 col = mix(uColor, uAccent, hot);
  float alpha = a * vAlpha * mix(uOpacity, 1.0, hot);
  if (alpha < 0.01) discard;

  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;
