import { browserSupabase } from "@/lib/supabase/browser";

export type UploadedImage = {
  url: string;
  width: number;
  height: number;
  /** Set when the file was re-encoded to fit the size limit. */
  compressed?: { from: number; to: number };
};

const TYPES: Record<string, string> = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg", "image/avif": "avif", "image/gif": "gif" };
/** The `media` bucket rejects anything over 5 MB; aim a little under it. */
const LIMIT_BYTES = 5 * 1024 * 1024;
const TARGET_BYTES = 4.8 * 1024 * 1024;
const QUALITIES = [0.9, 0.82, 0.74, 0.66];

export const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export const isImageFile = (file: File) => file.type in TYPES;

function encode(bitmap: ImageBitmap, width: number, height: number, quality: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

/**
 * Returns an image that fits the upload limit. Files already under it are left untouched. Larger
 * ones are re-encoded as WebP, lowering quality first and then the pixel size, until they fit.
 */
async function fit(file: File): Promise<{ file: File; width: number; height: number; compressed: boolean }> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("这个文件无法作为图片读取。");
  try {
    if (file.size <= TARGET_BYTES) return { file, width: bitmap.width, height: bitmap.height, compressed: false };
    // Re-encoding a GIF through a canvas would drop its animation.
    if (file.type === "image/gif") throw new Error(`GIF 动图超过 ${formatBytes(LIMIT_BYTES)}，无法自动压缩，请先在别处压缩。`);

    let scale = 1;
    for (let round = 0; round < 8; round++) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      for (const quality of QUALITIES) {
        const blob = await encode(bitmap, width, height, quality);
        if (blob && blob.size <= TARGET_BYTES) {
          const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
          return { file: new File([blob], name, { type: "image/webp" }), width, height, compressed: true };
        }
      }
      scale *= 0.8;
    }
    throw new Error("图片太大，压缩后仍然超过 5 MB。");
  } finally {
    bitmap.close();
  }
}

/**
 * Uploads an image to the public `media` bucket, compressing it first when it is over the size
 * limit, and reports its final pixel size. Throws a readable message.
 */
export async function uploadImage(source: File, folder: "blog" | "projects", name: string): Promise<UploadedImage> {
  if (!isImageFile(source)) throw new Error("只支持 WebP、PNG、JPG、AVIF 和 GIF 图片。");
  const { file, width, height, compressed } = await fit(source);

  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const path = `${folder}/${base}-${suffix}.${TYPES[file.type]}`;
  const supabase = browserSupabase();
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(`上传失败：${error.message}`);
  return {
    url: supabase.storage.from("media").getPublicUrl(path).data.publicUrl,
    width,
    height,
    compressed: compressed ? { from: source.size, to: file.size } : undefined,
  };
}
