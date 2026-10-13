"use client";

import { BarChart3, FileText, FolderKanban, Inbox, LayoutDashboard, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/messages", label: "留言", icon: Inbox },
  { href: "/admin/analytics", label: "访问数据", icon: BarChart3 },
  { href: "/admin/posts", label: "文章", icon: FileText },
  { href: "/admin/projects", label: "项目", icon: FolderKanban },
  { href: "/admin/data", label: "站点数据", icon: SlidersHorizontal },
] as const;

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="后台导航" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
              active ? "bg-accent-soft text-accent" : "text-muted hover:bg-fg/5 hover:text-fg",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
            {href === "/admin/messages" && unread > 0 && (
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] text-white dark:text-bg">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
