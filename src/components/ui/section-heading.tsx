import type { ReactNode } from "react";
import { DrawUnderline } from "@/components/fx/draw-underline";
import { ScrambleText } from "@/components/fx/scramble-text";
import { countUnits } from "@/components/fx/split";
import { SplitText } from "@/components/fx/split-text";
import { FxTrigger } from "@/components/fx/trigger";
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

const STAGGER = 0.05;
const TITLE_DELAY = 0.08;

/**
 * Display heading with an italic serif accent phrase — the site's typographic signature.
 * Plays as one group when scrolled into view: the eyebrow decodes, words rise, the accent
 * gets a hand-drawn underline.
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
  const accentDelay = TITLE_DELAY + countUnits(title) * STAGGER + 0.04;
  const underlineDelay = accentDelay + countUnits(accent) * STAGGER + 0.3;

  return (
    <FxTrigger
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="eyebrow flex items-center gap-3">
          <span className="fx-line inline-block h-px w-6 bg-accent" />
          <ScrambleText text={eyebrow} />
        </p>
      )}
      <Heading className={cn("max-w-4xl font-display font-semibold leading-[1.2] tracking-[-0.035em] [text-wrap:pretty]", sizes[size])}>
        <SplitText text={title} delay={TITLE_DELAY} stagger={STAGGER} />{" "}
        {accent && (
          <span className="relative inline-block font-serif font-normal italic tracking-normal text-accent">
            <SplitText text={accent} delay={accentDelay} stagger={STAGGER} />
            <DrawUnderline delay={underlineDelay} />
          </span>
        )}
      </Heading>
      {body && (
        <Reveal delay={0.1}>
          <p className="max-w-2xl text-[15px] leading-[1.85] text-muted sm:text-base">{body}</p>
        </Reveal>
      )}
      {children}
    </FxTrigger>
  );
}
