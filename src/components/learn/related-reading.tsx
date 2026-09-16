import { ArrowUpRight } from "lucide-react";
import { getFdeCopy } from "@/data/fde";
import { Link } from "@/i18n/navigation";

const links = {
  general: [{ href: "/blog/what-a-forward-deployed-engineer-actually-does", zh: "FDE 的工作具体包含什么", en: "What an FDE actually does" }],
  knowledge: [{ href: "/projects/conuo", zh: "Conuo：知识学习与证据整理", en: "Conuo: learning and evidence" }, { href: "/blog/conuo", zh: "Conuo 的设计与使用", en: "How Conuo is designed and used" }],
  integration: [{ href: "/projects/omnigate", zh: "Omnigate：API 接入与服务状态", en: "Omnigate: API access and service state" }],
  collaboration: [{ href: "/projects/dsh-session-conductor", zh: "DSH Session Conductor 项目", en: "DSH Session Conductor project" }, { href: "/blog/dsh-session-conductor", zh: "DSH：会话分工与交接方法", en: "DSH: roles and session handoff" }],
  workflow: [{ href: "/blog/structured-workflows", zh: "结构化与流程化：让任务可以检查", en: "Structured workflows and checkable tasks" }],
};

export function RelatedReading({ module, locale }: { module: number; locale: string }) {
  const copy = getFdeCopy(locale);
  const selected = module === 4 ? links.knowledge : module === 3 ? links.integration : module === 6 ? links.collaboration : module === 1 ? links.general : links.workflow;
  return <aside className="mt-10 border-t border-line pt-6">
    <h2 className="eyebrow">{copy.related}</h2>
    <ul className="mt-3 space-y-1">{selected.map((link) => <li key={link.href}><Link href={link.href} className="inline-flex min-h-11 items-center gap-2 text-sm leading-7 text-muted hover:text-accent">{link[locale === "en" ? "en" : "zh"]}<ArrowUpRight className="h-3.5 w-3.5 shrink-0" /></Link></li>)}</ul>
  </aside>;
}
