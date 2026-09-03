import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { PostMeta } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

export function PostCard({
  post,
  locale,
  minRead,
  featured = false,
}: {
  post: PostMeta;
  locale: string;
  minRead: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-line bg-bg-elevated p-7 transition-[border-color,box-shadow] duration-500 hover:border-accent/50 hover:shadow-glow",
        featured && "lg:p-10",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl transition-transform duration-700 group-hover:scale-125"
        style={{ background: `oklch(70% 0.18 ${post.hue})` }}
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <h3
          className={cn(
            "font-display font-semibold leading-tight tracking-tight",
            featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
          )}
        >
          {post.title}
        </h3>
        <p className={cn("leading-relaxed text-muted", featured ? "text-base sm:text-lg" : "text-sm")}>
          {post.description}
        </p>
      </div>
      <div className="relative flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        <span className="flex items-center gap-2">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          <span className="h-1 w-1 rounded-full bg-accent" />
          {minRead}
          {post.fallback && (
            <>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>EN</span>
            </>
          )}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-line transition-all duration-300 group-hover:bg-accent group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}
