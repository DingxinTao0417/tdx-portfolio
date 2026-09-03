import Image from "next/image";
import { site } from "@/data/site";

/** Avatar pulled from GitHub, framed like an instrument dial. */
export function Portrait({ caption }: { caption: string }) {
  return (
    <figure className="relative mx-auto w-full max-w-sm">
      <div className="relative aspect-square">
        {/* Rotating tick ring */}
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full animate-spin-slow text-accent"
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="4"
              x2="100"
              y2={i % 5 === 0 ? "14" : "9"}
              stroke="currentColor"
              strokeWidth={i % 5 === 0 ? 1.6 : 0.8}
              strokeOpacity={i % 5 === 0 ? 0.9 : 0.4}
              transform={`rotate(${i * 6} 100 100)`}
            />
          ))}
        </svg>
        <div className="absolute inset-[9%] rounded-full border border-line" />
        <div className="hud-corners absolute inset-[16%] overflow-hidden rounded-[2rem] border border-line bg-bg-elevated shadow-glow">
          <Image
            src={`https://github.com/${site.handle}.png?size=512`}
            alt={site.name}
            fill
            sizes="(max-width: 640px) 70vw, 320px"
            className="object-cover"
            priority
          />
          <div className="noise absolute inset-0" />
        </div>
        <span className="absolute -right-2 bottom-[14%] rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg backdrop-blur">
          {site.nameZh}
        </span>
        <span className="absolute -left-2 top-[14%] grid h-11 w-11 place-items-center rounded-2xl bg-accent font-display text-sm font-bold text-white shadow-glow">
          {site.initials}
        </span>
      </div>
      <figcaption className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
