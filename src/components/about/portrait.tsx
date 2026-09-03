import Image from "next/image";
import { site } from "@/data/site";

/** Local portrait framed like an instrument dial. */
export function Portrait() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
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
            src="/avatar.png"
            alt={site.name}
            fill
            sizes="(max-width: 640px) 70vw, 320px"
            className="object-cover"
            priority
          />
          <div className="noise absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
