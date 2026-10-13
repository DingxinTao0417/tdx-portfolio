"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TechIcon } from "@/components/ui/tech-icon";
import { buttonClasses } from "@/components/ui/button";
import { browserSupabase } from "@/lib/supabase/browser";

export function GitHubSignIn() {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setBusy(true);
    setFailed(false);
    const { error } = await browserSupabase().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    if (error) {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={signIn} disabled={busy} className={buttonClasses({ size: "lg", className: "w-full gap-3" })}>
        <TechIcon icon="github" name="GitHub" size={18} />
        {busy ? "正在跳转到 GitHub…" : "使用 GitHub 登录"}
      </button>
      {failed && <p role="alert" className="mt-3 text-sm text-accent">无法发起登录，请确认 Supabase 已启用 GitHub 登录。</p>}
    </div>
  );
}

export function SignOut({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await browserSupabase().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden />
      退出登录
    </button>
  );
}
