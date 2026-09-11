import { NETWORK_SCALE, NETWORK_SWAY } from "./hero-network";
import { DATABASE_PITCH } from "./hero-database";

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

/** One particle field morphs between TDX, a database, a neural network, and sheets. */
export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uElapsed;
uniform float uFrom;
uniform float uTo;
uniform float uMorphDur;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMovement;
uniform float uHoverNode;
uniform float uHoverTime;
uniform float uHoverStrength;
attribute vec3 aDatabase;
attribute vec3 aDatabaseStyle;
attribute vec3 aDatabaseDetail;
attribute vec3 aNetwork;
attribute vec3 aNetworkStyle;
attribute vec3 aNetworkLink;
attribute vec3 aLattice;
attribute vec3 aSeed;
varying float vAccent;
varying float vAlpha;

${simplex}

vec3 turn(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

float angleAt(float phase) {
  if (phase < 1.5) return 0.0;
  if (phase > 2.5) return sin(uTime * 0.15) * 0.22 * uMovement;
  return sin(uTime * 0.26) * ${NETWORK_SWAY} * uMovement;
}

// Transform the baked view back to the cylinder's local vertical axis.
float databaseHeight() {
  return aDatabase.y * ${Math.cos(DATABASE_PITCH)} + aDatabase.z * ${Math.sin(DATABASE_PITCH)};
}

float databaseReadWave() {
  // Enter and leave beyond the silhouette so the wrap never flashes in place.
  float head = mod(uTime * 0.82, 3.0) - 1.5;
  return (1.0 - smoothstep(0.035, 0.19, abs(databaseHeight() - head))) * uMovement;
}

vec3 target(float phase) {
  if (phase > 2.5) {
    // Restore the original coherent sheet drift before applying the gentle sway.
    vec3 q = aLattice * 0.9 + uTime * 0.12;
    vec3 ripple = vec3(snoise(q), snoise(q + 31.7), snoise(q + 71.3));
    return turn(aLattice + ripple * 0.06 * uMovement, angleAt(phase));
  }
  if (phase > 0.5 && phase < 1.5) {
    // Move whole tiers, not individual surface points. Spacing can expand a
    // little but never contract; no rotation of the pre-occluded back faces.
    float breath = (0.5 + 0.5 * sin(uTime * 1.15)) * 0.035;
    float lift = (sin(uTime * 1.15) * 0.055 + (aDatabaseDetail.x - 1.0) * breath) * uMovement;
    return aDatabase + vec3(0.0, ${Math.cos(DATABASE_PITCH)}, ${Math.sin(DATABASE_PITCH)}) * lift;
  }
  vec3 p = mix(mix(position, aDatabase, step(0.5, phase)), aNetwork, step(1.5, phase));
  if (phase > 1.5) p *= ${NETWORK_SCALE};
  return turn(p, angleAt(phase));
}

// x: accent, y: opacity, z: size. Distinct weights keep rims and synapses readable.
vec3 appearance(float phase) {
  if (phase < 0.5) return vec3(1.0 - step(-0.8, position.x), 0.9, 0.82);
  if (phase < 1.5) {
    float rim = 1.0 - step(0.5, abs(aDatabaseDetail.z - 2.0));
    float wall = 1.0 - step(0.5, aDatabaseDetail.z);
    float indicator = step(3.5, aDatabaseDetail.z);
    // Opposite travelling highlights keep one scan visible on the front half.
    float head = fract(uTime * 0.20 - aDatabaseDetail.x * 0.16);
    float distance = abs(aDatabaseDetail.y - head);
    distance = min(distance, 1.0 - distance);
    distance = min(distance, abs(distance - 0.5));
    float sweep = (1.0 - smoothstep(0.012, 0.065, distance)) * uMovement;
    float read = databaseReadWave();
    float activity = max(sweep * max(rim, wall * 0.45), read * max(wall * 0.82, indicator));
    float heartbeat = (0.5 + 0.5 * sin(uTime * 2.1 - aDatabaseDetail.x * 1.4)) * indicator * uMovement;
    return vec3(
      mix(aDatabaseStyle.x, 1.0, activity),
      aDatabaseStyle.y + activity * 0.60 + heartbeat * 0.16,
      aDatabaseStyle.z * (1.0 + activity * 0.28)
    );
  }
  if (phase > 2.5) {
    float accent = step(0.96, aSeed.y);
    return vec3(accent, 0.82, mix(0.7, 1.15, accent));
  }
  float edge = step(0.0, aNetworkLink.z);
  // Stage-index flow lights complete feature maps, then their outgoing paths.
  float stage = mix(aNetworkLink.x, mix(aNetworkLink.x, aNetworkLink.y, aNetworkLink.z), edge);
  float wave = mod(uTime * 1.35, 9.5) - 1.0;
  float signal = (1.0 - smoothstep(0.12, 0.65, abs(stage - wave))) * uMovement;
  float hover = step(-0.5, uHoverNode) * clamp(uHoverStrength, 0.0, 1.0);
  float fromSelected = 1.0 - step(0.5, abs(aNetworkLink.x - uHoverNode));
  float toSelected = 1.0 - step(0.5, abs(aNetworkLink.y - uHoverNode));
  float source = (1.0 - edge) * fromSelected * hover;
  float connected = edge * max(fromSelected, toSelected) * hover;
  // Reverse the edge parameter when the selected node is at its target end.
  float outwardT = mix(1.0 - aNetworkLink.z, aNetworkLink.z, fromSelected);
  float pulsePosition = mod(max(uHoverTime, 0.0) * 0.85, 1.5);
  float pulse = (1.0 - smoothstep(0.035, 0.16, abs(outwardT - pulsePosition))) * uMovement;
  // Keep automatic layer flow; hover emphasizes only adjacent connections.
  float automatic = signal * (1.0 - edge * hover);
  vec3 style = vec3(
    mix(aNetworkStyle.x, 1.0, automatic * 0.9),
    mix(aNetworkStyle.y, max(aNetworkStyle.y, 0.85), automatic),
    aNetworkStyle.z * (1.0 + signal * 0.10)
  );
  float highlight = max(source * 0.94, connected * (0.18 + pulse * 0.78));
  style.x = mix(style.x, 1.0, highlight);
  style.y = max(style.y, mix(style.y, 1.85, source * 0.65));
  style.y = max(style.y, mix(style.y, 0.52 + pulse * 0.63, connected));
  return style;
}

void main() {
  vec3 from = target(uFrom);
  vec3 to = target(uTo);
  float delay = aSeed.x * 0.4;
  float t = clamp((uElapsed - delay) / uMorphDur, 0.0, 1.0);
  float e = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  vec3 p = mix(from, to, e);
  float arcWave = sin(t * 3.14159265);
  float arc = arcWave * arcWave;
  float travel = min(length(to - from), 1.0);
  p += vec3(
    sin(aSeed.y * 31.4) * 0.22,
    cos(aSeed.z * 25.1) * 0.26,
    sin(aSeed.x * 19.3) * 0.48
  ) * arc * travel;
  // Keep the database layers and synaptic paths intact while resting.
  p += vec3(
    sin(uTime * 0.65 + aSeed.x * 28.0),
    cos(uTime * 0.55 + aSeed.y * 23.0),
    sin(uTime * 0.4 + aSeed.z * 17.0)
  ) * 0.004 * uMovement;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vec3 style = mix(appearance(uFrom), appearance(uTo), e);
  float volume = mix(step(0.5, uFrom), step(0.5, uTo), e);
  float depthAlpha = mix(1.12, 0.55, smoothstep(5.7, 8.3, -mv.z));
  float databaseWeight = mix(
    step(0.5, uFrom) * (1.0 - step(1.5, uFrom)),
    step(0.5, uTo) * (1.0 - step(1.5, uTo)), e);
  // Database surfaces already encode lighting and physical occlusion. A second
  // aggressive depth fade would erase the lid and make the drums look hollow.
  depthAlpha = mix(depthAlpha, mix(1.04, 0.76, smoothstep(5.2, 8.8, -mv.z)), databaseWeight);
  vAccent = max(style.x, arc * 0.35);
  vAlpha = style.y * (0.85 + aSeed.z * 0.15) * mix(1.0, depthAlpha, volume);
  gl_PointSize = uSize * uPixelRatio * style.z * (0.85 + aSeed.z * 0.3)
    * (7.0 / max(-mv.z, 0.1));
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
varying float vAccent;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = clamp((1.0 - smoothstep(0.25, 0.5, d)) * vAlpha * uOpacity, 0.0, 1.0);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, vAccent), alpha);
  #include <colorspace_fragment>
}
`;
