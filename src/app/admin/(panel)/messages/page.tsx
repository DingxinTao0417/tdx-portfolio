import { Archive, Inbox, MailOpen, Trash2, Undo2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireAdmin } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import { deleteMessage, setMessageStatus } from "./actions";

export const metadata: Metadata = { title: "留言" };

const tabs = [
  { key: "new", label: "未读" },
  { key: "read", label: "已读" },
  { key: "archived", label: "已归档" },
  { key: "all", label: "全部" },
] as const;
type Tab = (typeof tabs)[number]["key"];

const topics: Record<string, string> = { fde: "FDE 岗位", ai: "AI 工程岗位", contract: "项目外包", collab: "合作", other: "其他" };
const action = "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:border-accent hover:text-accent";

type Message = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  topic: string;
  message: string;
  locale: string;
  status: "new" | "read" | "archived";
  delivered: boolean;
};

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireAdmin();
  const requested = (await searchParams).status;
  const tab: Tab = tabs.some((t) => t.key === requested) ? (requested as Tab) : "new";

  let query = supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
  if (tab !== "all") query = query.eq("status", tab);
  const { data, error } = await query;
  const messages = (data ?? []) as Message[];
  const time = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <AdminPageTitle eyebrow="Messages" title="留言" body="访客通过联系表单发来的消息。最多显示最近 200 条。" />
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="留言状态">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "new" ? "/admin/messages" : `/admin/messages?status=${t.key}`}
            role="tab"
            aria-selected={tab === t.key}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 text-sm transition-colors",
              tab === t.key ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-fg",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {error && <p role="alert" className="surface-panel p-5 text-sm text-accent">读取留言失败：{error.message}</p>}

      {!error && messages.length === 0 && (
        <div className="surface-panel flex flex-col items-center gap-3 p-12 text-center text-sm text-muted">
          <Inbox className="h-8 w-8 text-accent/60" strokeWidth={1.25} aria-hidden />
          这里还没有留言。
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {messages.map((m) => (
          <li key={m.id} className={cn("surface-panel bg-bg-elevated p-5 sm:p-6", m.status === "new" && "border-l-2 border-l-accent")}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-display text-lg font-semibold">
                {m.name}
                {m.company && <span className="ml-2 text-sm font-normal text-muted">· {m.company}</span>}
              </p>
              <time dateTime={m.created_at} className="font-mono text-xs text-muted">{time.format(new Date(m.created_at))}</time>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <a href={`mailto:${m.email}`} className="font-mono text-accent hover:underline">{m.email}</a>
              <span>{topics[m.topic] ?? m.topic}</span>
              <span className="font-mono uppercase">{m.locale}</span>
              <span>{m.delivered ? "已同时发送邮件" : "未发送邮件"}</span>
            </p>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-fg/90">{m.message}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: 来自 TDX 网站的留言")}`} className={action}>回复邮件</a>
              {m.status !== "read" && (
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value="read" />
                  <button type="submit" className={action}><MailOpen className="h-3.5 w-3.5" aria-hidden />标为已读</button>
                </form>
              )}
              {m.status !== "new" && (
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value="new" />
                  <button type="submit" className={action}><Undo2 className="h-3.5 w-3.5" aria-hidden />标为未读</button>
                </form>
              )}
              {m.status !== "archived" && (
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button type="submit" className={action}><Archive className="h-3.5 w-3.5" aria-hidden />归档</button>
                </form>
              )}
              <form action={deleteMessage} className="ml-auto">
                <input type="hidden" name="id" value={m.id} />
                <ConfirmButton message={`永久删除 ${m.name} 的这条留言？此操作无法撤销。`} className={action}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />删除
                </ConfirmButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
