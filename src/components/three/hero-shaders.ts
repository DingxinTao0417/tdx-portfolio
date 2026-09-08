import { DATABASE_PITCH, DATABASE_RADIUS } from "./hero-targets";

/** One draw call: TDX, code, and a three-dimensional stack of database layers. */
export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uElapsed;
uniform float uFrom;
uniform float uTo;
uniform float uMorphDur;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMovement;
attribute vec3 aCode;
attribute vec3 aDatabase;
attribute vec3 aSeed;
varying float vAccent;
varying float vAlpha;

vec3 target(float phase) {
  return mix(mix(position, aCode, step(0.5, phase)), aDatabase, step(1.5, phase));
}

float accentAt(vec3 p, float phase) {
  if (phase < 0.5) return step(0.85, p.x);
  if (phase < 1.5) return (1.0 - step(1.4, abs(p.x))) * (1.0 - step(0.68, abs(p.y + 0.12)));
  // Undo the baked pitch to find the circular rims in cylinder coordinates.
  float localZ = -p.y * ${Math.sin(DATABASE_PITCH).toFixed(8)} + p.z * ${Math.cos(DATABASE_PITCH).toFixed(8)};
  float radius = length(vec2(p.x, localZ));
  return smoothstep(${(DATABASE_RADIUS - 0.06).toFixed(3)}, ${DATABASE_RADIUS.toFixed(3)}, radius);
}

void main() {
  vec3 from = target(uFrom);
  vec3 to = target(uTo);
  float delay = aSeed.x * 0.4;
  float t = clamp((uElapsed - delay) / uMorphDur, 0.0, 1.0);
  // Quintic easing gives zero velocity and acceleration at both ends.
  float e = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  vec3 p = mix(from, to, e);
  float arcWave = sin(t * 3.14159265);
  float arc = arcWave * arcWave;
  float travel = min(length(to - from), 1.0);
  // A loose weave between shapes, without an expanding sphere or radial burst.
  p += vec3(
    sin(aSeed.y * 31.4) * 0.26,
    cos(aSeed.z * 25.1) * 0.32,
    sin(aSeed.x * 19.3) * 0.6
  ) * arc * travel;
  p += vec3(
    sin(uTime * 0.65 + aSeed.x * 28.0),
    cos(uTime * 0.55 + aSeed.y * 23.0),
    sin(uTime * 0.4 + aSeed.z * 17.0)
  ) * 0.012 * uMovement;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float emphasis = mix(accentAt(from, uFrom), accentAt(to, uTo), e);
  vAccent = max(emphasis, max(step(0.9, aSeed.y), arc * 0.55));
  float databaseWeight = mix(step(1.5, uFrom), step(1.5, uTo), e);
  float depthAlpha = mix(1.0, 0.3, smoothstep(5.2, 8.8, -mv.z));
  float databaseAlpha = depthAlpha * mix(0.8, 1.65, emphasis);
  vAlpha = (0.6 + aSeed.z * 0.4) * mix(1.0, databaseAlpha, databaseWeight);
  gl_PointSize = uSize * uPixelRatio * (0.7 + aSeed.z * 0.6)
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
  float alpha = clamp((1.0 - smoothstep(0.22, 0.5, d)) * vAlpha * uOpacity, 0.0, 1.0);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, vAccent), alpha);
  #include <colorspace_fragment>
}
`;
