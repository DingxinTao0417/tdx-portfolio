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
        "group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-2xl border border-line p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-soft sm:p-7",
        featured ? "bg-fg text-bg sm:p-9 lg:p-10" : "bg-bg-elevated",
      )}
    >
      <span aria-hidden className="absolute left-0 top-8 h-10 w-0.5 bg-accent" />
      <div className={cn("relative flex flex-col gap-5", featured && "max-w-3xl")}>
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} className={cn("rounded-md border-transparent px-0 py-0 tracking-normal", featured ? "text-bg/65" : "text-muted")}>{tag}</Tag>
          ))}
        </div>
        <h3
          className={cn(
            "font-display font-semibold leading-[1.35] tracking-tight",
            featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl",
          )}
        >
          {post.title}
        </h3>
        <p className={cn("leading-7", featured ? "text-base text-bg/70" : "text-sm text-muted")}>
          {post.description}
        </p>
      </div>
      <div className={cn("relative flex items-center justify-between gap-3 border-t pt-5 font-mono text-[11px]", featured ? "border-bg/20 text-bg/65" : "border-line text-muted")}>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300 group-hover:bg-accent group-hover:text-white", featured ? "bg-bg/10 text-bg" : "bg-bg text-fg")}>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
