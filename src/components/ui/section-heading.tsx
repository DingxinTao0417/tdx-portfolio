import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type Props = {
  eyebrow?: string;
  title: string;
  accent?: string;
  body?: string;
  align?: "left" | "center";
  size?: "md" | "lg" | "xl";
  className?: string;
  children?: ReactNode;
};

const sizes = {
  md: "text-3xl sm:text-4xl lg:text-5xl",
  lg: "text-4xl sm:text-5xl lg:text-6xl",
  xl: "text-5xl sm:text-6xl lg:text-7xl xl:text-8xl",
};

/**
 * Display heading with an italic serif accent phrase — the site's typographic signature.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  align = "left",
  size = "lg",
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="inline-block h-px w-6 bg-accent" />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className={cn("font-display font-semibold leading-[1.02]", sizes[size])}>
          {title}{" "}
          {accent && (
            <span className="font-serif font-normal italic tracking-normal text-accent">
              {accent}
            </span>
          )}
        </h2>
      </Reveal>
      {body && (
        <Reveal delay={0.1}>
          <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{body}</p>
        </Reveal>
      )}
      {children}
    </div>
  );
}
