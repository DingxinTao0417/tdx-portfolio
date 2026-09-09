/** A single particle field morphs between lettering, cortex, and a neural network. */
export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uElapsed;
uniform float uFrom;
uniform float uTo;
uniform float uMorphDur;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMovement;
attribute vec3 aBrain;
attribute vec3 aBrainStyle;
attribute vec3 aBrainNormal;
attribute vec3 aNetwork;
attribute vec3 aNetworkStyle;
attribute vec3 aSeed;
varying float vAccent;
varying float vAlpha;

vec3 turn(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

float angleAt(float phase) {
  if (phase < 0.5) return 0.0;
  return sin(uTime * 0.26) * (phase < 1.5 ? 0.24 : 0.02) * uMovement;
}

vec3 target(float phase) {
  vec3 p = mix(mix(position, aBrain, step(0.5, phase)), aNetwork, step(1.5, phase));
  if (phase > 0.5 && phase < 1.5) p *= 1.1;
  if (phase > 1.5) p *= 1.12;
  return turn(p, angleAt(phase));
}

// x: accent, y: opacity, z: size. Distinct weights keep folds and synapses readable.
vec3 appearance(float phase) {
  if (phase < 0.5) return vec3(1.0 - step(-0.8, position.x), 0.9, 0.82);
  if (phase < 1.5) {
    vec3 normal = normalMatrix * turn(aBrainNormal, angleAt(phase));
    float surface = step(0.1, length(normal));
    normal /= max(length(normal), 0.001);
    float facing = smoothstep(-0.12, 0.65, normal.z);
    float light = max(dot(normal, normalize(vec3(-0.35, 0.6, 1.0))), 0.0);
    float shading = mix(1.0, mix(0.13, 1.0, facing) * mix(0.65, 1.0, light), surface);
    float signal = pow(0.5 + 0.5 * sin(aBrain.y * 3.5 - aBrain.x * 2.0 - uTime * 1.6), 8.0)
      * step(0.25, aBrainStyle.x) * uMovement;
    return vec3(aBrainStyle.x, aBrainStyle.y * shading * (1.0 + signal * 0.3), aBrainStyle.z);
  }
  float waveX = mod(uTime * 0.85, 5.6) - 2.8;
  float signal = (1.0 - smoothstep(0.08, 0.38, abs(aNetwork.x - waveX))) * uMovement;
  return vec3(
    mix(aNetworkStyle.x, 1.0, signal * 0.9),
    mix(aNetworkStyle.y, max(aNetworkStyle.y, 0.85), signal),
    aNetworkStyle.z * (1.0 + signal * 0.15)
  );
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
  // Keep the fine cortical lines and synaptic paths intact while resting.
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
