import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GitHubSignIn, SignOut } from "@/components/admin/auth-buttons";
import { getAdminState } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "登录" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const state = await getAdminState();
  if (state.status === "admin") redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="relative grid min-h-screen place-items-center px-5 py-16">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="surface-panel relative w-full max-w-sm bg-bg-elevated p-8 shadow-soft">
        <p className="eyebrow flex items-center gap-3">
          <span className="inline-block h-px w-6 bg-accent" />
          TDX / ADMIN
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">后台管理</h1>

        {state.status === "unconfigured" && (
          <p className="mt-4 text-sm leading-7 text-muted">
            还没有配置 Supabase。请设置 <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> 和{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> 两个环境变量。
          </p>
        )}

        {state.status === "anonymous" && (
          <>
            <p className="mt-3 mb-7 text-sm leading-7 text-muted">仅站长的 GitHub 账号可以进入。</p>
            <GitHubSignIn />
            {error && <p role="alert" className="mt-4 text-sm text-accent">登录没有完成，请重试。</p>}
          </>
        )}

        {state.status === "forbidden" && (
          <>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前登录的账号 <span className="font-mono text-fg">{state.user.login}</span> 不在管理员名单里，无法进入后台。
            </p>
            <SignOut className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent" />
          </>
        )}
      </div>
    </main>
  );
}
