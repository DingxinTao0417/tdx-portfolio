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
  as?: "h1" | "h2";
  className?: string;
  children?: ReactNode;
};

const sizes = {
  md: "text-[1.75rem] sm:text-3xl lg:text-4xl",
  lg: "text-3xl sm:text-4xl lg:text-[2.75rem]",
  xl: "text-[2.5rem] sm:text-5xl lg:text-[4rem]",
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
  as: Heading = "h2",
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
        <Heading className={cn("max-w-4xl font-display font-semibold leading-[1.2] tracking-[-0.035em] [text-wrap:pretty]", sizes[size])}>
          {title}{" "}
          {accent && (
            <span className="font-serif font-normal italic tracking-normal text-accent">
              {accent}
            </span>
          )}
        </Heading>
      </Reveal>
      {body && (
        <Reveal delay={0.1}>
          <p className="max-w-2xl text-[15px] leading-[1.85] text-muted sm:text-base">{body}</p>
        </Reveal>
      )}
      {children}
    </div>
  );
}
