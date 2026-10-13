import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOut } from "@/components/admin/auth-buttons";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("status", "new");

  return (
    <div className="mx-auto grid min-h-screen max-w-[88rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 border-b border-line p-4 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="font-display text-2xl font-semibold tracking-tight text-gradient-accent">
            TDX
            <span className="ml-2 font-mono text-[10px] tracking-[0.18em] text-muted">ADMIN</span>
          </Link>
          <ThemeToggle label="切换明暗" />
        </div>
        <AdminNav unread={count ?? 0} />
        <div className="mt-auto hidden flex-col gap-3 border-t border-line pt-5 lg:flex">
          <div className="flex items-center gap-3">
            {user.avatar && <Image src={user.avatar} alt="" width={32} height={32} className="rounded-full" />}
            <span className="min-w-0 truncate font-mono text-xs text-muted">{user.login}</span>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 text-sm text-muted hover:text-accent">
            查看网站 <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
          <SignOut className="inline-flex min-h-9 items-center gap-2 text-left text-sm text-muted hover:text-accent" />
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
