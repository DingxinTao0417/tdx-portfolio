import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[0_10px_30px_-12px_var(--accent-glow)] hover:bg-accent-strong hover:shadow-[0_18px_40px_-14px_var(--accent-glow)]",
  secondary:
    "border border-line-strong bg-transparent text-fg hover:border-accent hover:text-accent",
  ghost: "text-fg hover:text-accent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

type StyleProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
};

export function buttonClasses({ variant = "primary", size = "md", className }: StyleProps) {
  return cn(base, variants[variant], sizes[size], className);
}

function Arrow() {
  return (
    <span className="relative inline-grid h-4 w-4 place-items-center overflow-hidden">
      <ArrowUpRight className="absolute h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-4 group-hover/btn:-translate-y-4" />
      <ArrowUpRight className="absolute h-4 w-4 -translate-x-4 translate-y-4 transition-transform duration-300 group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
    </span>
  );
}

type ButtonLinkProps = StyleProps & {
  href: string;
  children: ReactNode;
  "data-cursor-text"?: string;
};

/** Internal links go through next-intl's locale-aware Link; external ones open in a new tab. */
export function ButtonLink({ href, children, arrow, ...style }: ButtonLinkProps) {
  const classes = buttonClasses(style);
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
      >
        {children}
        {arrow && <Arrow />}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

type ButtonProps = StyleProps &
  Omit<ComponentProps<"button">, "className"> & { children: ReactNode };

export function Button({ children, arrow, variant, size, className, ...rest }: ButtonProps) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
