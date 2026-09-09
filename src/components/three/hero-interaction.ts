/** Mutable pointer input avoids React renders on every mouse movement. */
export type HeroInteraction = {
  x: number;
  y: number;
  inside: boolean;
  activityVersion: number;
};
