export type ScenePalette = {
  accent: string;
  accentStrong: string;
  amber: string;
  cool: string;
  core: string;
  coreEmissive: string;
  wire: string;
  shard: string;
  particle: string;
  envIntensity: number;
  emissiveIntensity: number;
};

export const palettes: Record<"light" | "dark", ScenePalette> = {
  light: {
    accent: "#ff5a1f",
    accentStrong: "#e24a12",
    amber: "#ffb020",
    cool: "#0ea5b7",
    core: "#ff7a3d",
    coreEmissive: "#ff5a1f",
    wire: "#e24a12",
    shard: "#ffffff",
    particle: "#ff5a1f",
    envIntensity: 1.1,
    emissiveIntensity: 0.25,
  },
  dark: {
    accent: "#ff6b2c",
    accentStrong: "#ff8a50",
    amber: "#ffc247",
    cool: "#38d3e8",
    core: "#ff6b2c",
    coreEmissive: "#ff4d00",
    wire: "#ff8a50",
    shard: "#1a1d27",
    particle: "#ffb27a",
    envIntensity: 0.7,
    emissiveIntensity: 0.9,
  },
};
