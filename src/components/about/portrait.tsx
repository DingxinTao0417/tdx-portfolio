import Image from "next/image";
import { site } from "@/data/site";

/** Keep the portrait itself as the focal point. */
export function Portrait() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem] lg:mr-0 lg:max-w-[22rem]">
      {/* Crop only the bottom attribution strip, keeping the full subject width. */}
      <div className="relative aspect-[10/9] overflow-hidden rounded-2xl border border-line bg-bg-elevated">
        <Image
          src="/peach-cat-avatar.png"
          alt={site.name}
          fill
          sizes="(max-width: 640px) 80vw, 352px"
          className="object-cover object-top"
          preload
        />
      </div>
      <span aria-hidden className="absolute -bottom-2 -left-2 h-5 w-5 rounded-full border-4 border-bg bg-accent" />
    </div>
  );
}
