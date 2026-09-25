import { Clock3 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowSwap } from "@/components/home/data/arrow-swap";
import { PostCardFrame } from "@/components/home/data/post-card-frame";
import styles from "@/components/home/data/post-card.module.css";
import type { PostMeta } from "@/lib/blog";
import { cn, formatDate } from "@/lib/utils";

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
  const cursor = useTranslations("FX.common.cursor");

  return (
    <PostCardFrame
      href={`/blog/${post.slug}`}
      cursorText={cursor("read")}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line hover:border-accent/40 hover:shadow-soft",
        featured ? "bg-fg text-bg" : "bg-bg-elevated",
      )}
    >
      {post.cover && (
        <div className="relative aspect-[3/2] shrink-0 overflow-hidden border-b border-line bg-[#f6f3ed]">
          <Image
            src={post.cover}
            alt={post.coverAlt ?? ""}
            width={1536}
            height={1024}
            sizes={featured ? "(max-width: 768px) 100vw, 1200px" : "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"}
            className={cn("h-full w-full object-contain", styles.cover)}
          />
          <span aria-hidden="true" className={styles.glare} />
          <span
            aria-hidden="true"
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/85 px-2.5 py-1 font-mono text-[10px] text-fg backdrop-blur-md"
          >
            <Clock3 className="h-3 w-3 text-accent transition-[rotate] duration-700 ease-(--fx-ease) motion-safe:group-hover:rotate-[360deg]" />
            {minRead}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-xs", featured ? "text-bg/65" : "text-muted")}>
          {post.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold leading-[1.45] tracking-tight">
          <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat [box-decoration-break:clone] transition-[background-size] duration-700 ease-(--fx-ease) group-hover:bg-[length:100%_1.5px] group-focus-visible:bg-[length:100%_1.5px]">
            {post.title}
          </span>
        </h3>
        <p className={cn("mb-6 mt-3 line-clamp-3 text-sm leading-7", featured ? "text-bg/70" : "text-muted")}>
          {post.description}
        </p>
        <div className={cn("mt-auto flex items-center justify-between gap-3 border-t pt-4 font-mono text-[11px]", featured ? "border-bg/20 text-bg/65" : "border-line text-muted")}>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            {post.cover ? (
              <span className="sr-only">{minRead}</span>
            ) : (
              <>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
                {minRead}
              </>
            )}
            {post.fallback && <span>{post.locale.toUpperCase()}</span>}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300 group-hover:bg-accent group-hover:text-(--fx-on-accent) group-focus-visible:bg-accent group-focus-visible:text-(--fx-on-accent)",
              featured ? "bg-bg/10 text-bg" : "bg-bg text-fg",
            )}
          >
            <ArrowSwap />
          </span>
        </div>
      </div>
    </PostCardFrame>
  );
}
