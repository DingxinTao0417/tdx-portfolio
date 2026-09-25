export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export type Box = { left: number; top: number; width: number; height: number };

/** Two-digit HUD index, e.g. `pad(3)` → "03". */
export function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Where an `object-fit: contain` image of `ratio` (w/h) actually paints inside `box`. */
export function containRect(box: Box, ratio: number): Box {
  const width = Math.min(box.width, box.height * ratio);
  const height = width / ratio;
  return {
    left: box.left + (box.width - width) / 2,
    top: box.top + (box.height - height) / 2,
    width,
    height,
  };
}
