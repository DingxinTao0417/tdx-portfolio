import Image from "next/image";

/** Local editorial artwork; the original remains available without cropping. */
export function BlogImage({ src, alt, caption, width, height }: {
  src: string;
  alt: string;
  caption?: string;
  width: number | string;
  height: number | string;
}) {
  // Quoted MDX attributes survive next-mdx-remote's default blockJS protection.
  const intrinsicWidth = Number(width);
  const intrinsicHeight = Number(height);
  if (!Number.isInteger(intrinsicWidth) || intrinsicWidth <= 0 || !Number.isInteger(intrinsicHeight) || intrinsicHeight <= 0) {
    throw new Error(`BlogImage requires positive width and height: ${src}`);
  }
  return (
    <figure className="my-8">
      <a href={src} target="_blank" rel="noopener noreferrer" className="block rounded-xl">
        <Image
          src={src}
          alt={alt}
          width={intrinsicWidth}
          height={intrinsicHeight}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 90vw, 736px"
          className="h-auto w-full bg-[#f6f3ed]"
        />
      </a>
      {caption && <figcaption className="mt-3 text-sm leading-6 text-muted">{caption}</figcaption>}
    </figure>
  );
}
