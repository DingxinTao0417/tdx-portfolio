import {
  ArrowUpToLine,
  CodeXml,
  Copy,
  Cpu,
  FileDown,
  FileText,
  FolderKanban,
  GraduationCap,
  House,
  Keyboard,
  Languages,
  Mail,
  Moon,
  PartyPopper,
  PenLine,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useMemo, type ComponentType } from "react";
import { usePrefersReducedMotion } from "@/components/fx/hooks";
import { INTRO_STORAGE_KEY } from "@/components/fx/intro-store";
import { scrollToTarget } from "@/components/fx/lenis";
import { startThemeReveal } from "@/components/fx/theme-reveal";
import type { NavKey } from "@/data/nav";
import { resumeUrlFor, site } from "@/data/site";
import { getPathname, usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, routing, type Locale } from "@/i18n/routing";
import { rank, tokenize, type Ranked } from "./fuzzy";
import { CELEBRATE_EVENT, GO_KEY_OF, KONAMI_GLYPHS } from "./keys";
import { toast } from "./toast";
import type { CommandData } from "./types";

export type Group = "pages" | "projects" | "posts" | "actions" | "shortcuts";
export type Point = { x: number; y: number };
export type RunContext = { origin: Point; newTab: boolean };

export type Command = {
  id: string;
  group: Group;
  label: string;
  sub?: string;
  hint?: string;
  keywords?: readonly string[];
  detail?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Mono glyph shown instead of an icon (project index). */
  badge?: string;
  keys?: readonly string[];
  href?: string;
  current?: boolean;
  /** Listed only when the query clearly asks for it. */
  hidden?: boolean;
  /** Navigation and theme swaps take over the screen, so the palette leaves without an exit. */
  instant?: boolean;
  /** Runs inside the key/click gesture itself: clipboard, pop-ups and downloads need it (Safari). */
  sync?: boolean;
  /** Stay open and swap the query instead of running (rows of the shortcut sheet). */
  query?: string;
  run?: (context: RunContext) => void;
};

/** `index` is the position in the flattened listbox (drives `aria-activedescendant`). */
export type Result = Command & { match?: Ranked; index: number };
export type Section = { group: Group; items: Result[] };

const GROUPS: Group[] = ["pages", "projects", "posts", "actions", "shortcuts"];
/** Per-token score a hidden command needs (roughly a 3-letter prefix of one of its aliases). */
const HIDDEN_MIN = 40;

const PAGE_ICONS: Record<NavKey, LucideIcon> = {
  home: House,
  projects: FolderKanban,
  skills: Cpu,
  blog: PenLine,
  learn: GraduationCap,
  about: UserRound,
  contact: Mail,
};

// Search aliases in both languages, so either locale finds every command.
const ALIASES = {
  theme: ["theme", "dark", "light", "mode", "appearance", "主题", "暗色", "亮色", "深色", "浅色"],
  locale: ["language", "locale", "english", "chinese", "中文", "英文", "语言"],
  email: ["email", "mail", "copy", "contact", "邮箱", "邮件", "复制"],
  github: ["github", "profile", "主页"],
  source: ["source", "repo", "code", "github", "源码", "仓库", "代码"],
  resume: ["resume", "cv", "pdf", "download", "简历", "下载"],
  top: ["top", "scroll", "up", "顶部"],
  intro: ["intro", "preloader", "replay", "animation", "开场", "动画", "重播"],
  fireworks: ["konami", "fireworks", "party", "celebrate", "secret", "easter egg", "烟花", "彩蛋", "秘籍"],
};

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function openExternal(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

/** Every palette entry for the current locale, route and theme. */
export function useCommands(data: CommandData, apple: boolean) {
  const t = useTranslations("FX.command");
  const tNav = useTranslations("Nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const reduced = usePrefersReducedMotion();

  return useMemo(() => {
    const go = (href: string) => ({ newTab }: RunContext) => {
      if (newTab) window.open(getPathname({ href, locale }), "_blank", "noopener");
      else router.push(href);
    };
    const here = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
    const celebrate = () => document.dispatchEvent(new Event(CELEBRATE_EVENT));
    const other = routing.locales.find((code) => code !== locale) ?? routing.defaultLocale;
    const dark = resolvedTheme === "dark";
    const github = site.socials.find((social) => social.id === "github");

    const pages = data.pages.map(
      (page): Command => ({
        id: `page:${page.key}`,
        group: "pages",
        label: page.label,
        hint: page.href,
        keywords: [page.key, page.href, page.alias],
        icon: PAGE_ICONS[page.key],
        keys: ["G", GO_KEY_OF[page.key]],
        href: page.href,
        current: here(page.href),
        instant: true,
        run: go(page.href),
      }),
    );

    const projects = data.projects.map((project): Command => {
      const href = `/projects/${project.slug}`;
      return {
        id: `project:${project.slug}`,
        group: "projects",
        label: project.title,
        sub: project.tagline,
        detail: project.tagline,
        hint: project.kind,
        keywords: [project.slug, project.kind, ...project.stack],
        badge: project.index,
        href,
        current: pathname === href,
        instant: true,
        run: go(href),
      };
    });

    const posts = data.posts.map((post): Command => {
      const href = `/blog/${post.slug}`;
      return {
        id: `post:${post.slug}`,
        group: "posts",
        label: post.title,
        sub: post.tags.join(" · "),
        hint: post.date,
        keywords: [post.slug, ...post.tags],
        icon: FileText,
        href,
        current: pathname === href,
        instant: true,
        run: go(href),
      };
    });

    const actions: Command[] = [
      {
        id: "action:theme",
        group: "actions",
        label: t(dark ? "actions.themeLight" : "actions.themeDark"),
        hint: `${tNav(dark ? "dark" : "light")} → ${tNav(dark ? "light" : "dark")}`,
        keywords: ALIASES.theme,
        icon: dark ? Sun : Moon,
        instant: true,
        run: ({ origin }) => {
          const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
          startThemeReveal(origin.x, origin.y, next, setTheme);
        },
      },
      {
        id: "action:locale",
        group: "actions",
        label: t("actions.language"),
        hint: `${localeLabels[locale].short} → ${localeLabels[other].short}`,
        keywords: ALIASES.locale,
        icon: Languages,
        instant: true,
        run: () => {
          const query = Object.fromEntries(new URLSearchParams(window.location.search));
          router.push({ pathname, query }, { locale: other });
        },
      },
      {
        id: "action:email",
        group: "actions",
        label: t("actions.copyEmail"),
        hint: site.email,
        keywords: ALIASES.email,
        icon: Copy,
        sync: true,
        run: () => {
          (navigator.clipboard?.writeText(site.email) ?? Promise.reject(new Error("Clipboard unavailable"))).then(
            () => toast({ title: t("toast.copied"), description: site.email }),
            () => toast({ title: t("toast.copyFailed"), description: site.email, icon: "alert", duration: 6000 }),
          );
        },
      },
      ...(github
        ? [
            {
              id: "action:github",
              group: "actions",
              label: t("actions.github"),
              hint: github.handle,
              keywords: ALIASES.github,
              icon: GithubMark,
              sync: true,
              run: () => openExternal(github.href),
            } satisfies Command,
          ]
        : []),
      {
        id: "action:source",
        group: "actions",
        label: t("actions.source"),
        hint: "tdx-portfolio ↗",
        keywords: ALIASES.source,
        icon: CodeXml,
        sync: true,
        run: () => openExternal(site.repo),
      },
      {
        id: "action:resume",
        group: "actions",
        label: t("actions.resume"),
        hint: "PDF",
        keywords: ALIASES.resume,
        icon: FileDown,
        sync: true,
        run: () => {
          const link = document.createElement("a");
          link.href = resumeUrlFor(locale);
          link.download = "";
          document.body.append(link);
          link.click();
          link.remove();
          toast({ title: t("toast.resume"), description: "PDF", icon: "download" });
        },
      },
      {
        id: "action:top",
        group: "actions",
        label: t("actions.top"),
        keywords: ALIASES.top,
        icon: ArrowUpToLine,
        run: () => scrollToTarget(0),
      },
      // The intro never plays under reduced motion, so there is nothing to replay.
      ...(reduced
        ? []
        : [
            {
              id: "action:intro",
              group: "actions",
              label: t("actions.intro"),
              keywords: ALIASES.intro,
              icon: RotateCcw,
              instant: true,
              run: () => {
                try {
                  sessionStorage.removeItem(INTRO_STORAGE_KEY);
                } catch {}
                window.location.reload();
              },
            } satisfies Command,
          ]),
      {
        id: "action:fireworks",
        group: "actions",
        label: t("actions.fireworks"),
        hint: KONAMI_GLYPHS,
        keywords: ALIASES.fireworks,
        icon: PartyPopper,
        hidden: true,
        run: celebrate,
      },
    ];

    const shortcuts: Command[] = [
      { id: "key:palette", group: "shortcuts", label: t("shortcuts.palette"), keys: [apple ? "⌘" : "Ctrl", "K"], icon: Keyboard, query: "" },
      { id: "key:search", group: "shortcuts", label: t("shortcuts.search"), keys: ["/"], icon: Search, query: "" },
      { id: "key:help", group: "shortcuts", label: t("shortcuts.help"), keys: ["?"], icon: Keyboard, query: "?" },
      ...data.pages.map(
        (page): Command => ({
          id: `key:${page.key}`,
          group: "shortcuts",
          label: t("shortcuts.goto", { page: page.label }),
          keywords: [page.key, page.alias],
          keys: ["G", GO_KEY_OF[page.key]],
          icon: PAGE_ICONS[page.key],
          href: page.href,
          instant: true,
          run: go(page.href),
        }),
      ),
      {
        id: "key:konami",
        group: "shortcuts",
        label: t("shortcuts.secret"),
        keys: Array.from(KONAMI_GLYPHS),
        keywords: ALIASES.fireworks,
        icon: Sparkles,
        run: celebrate,
      },
    ];

    return [...pages, ...projects, ...posts, ...actions, ...shortcuts];
  }, [data, apple, t, tNav, locale, pathname, router, resolvedTheme, setTheme, reduced]);
}

/**
 * A leading "?" switches to the shortcut sheet. Without a query, groups keep their order;
 * with one, each group follows its best hit and items their score.
 */
export function search(commands: Command[], query: string): Section[] {
  const help = query.trimStart().startsWith("?");
  const tokens = tokenize(help ? query.trimStart().slice(1) : query);
  const pool = commands.filter((command) => (command.group === "shortcuts") === help);
  const groups = new Map<Group, Result[]>();
  const add = (command: Command, match?: Ranked) =>
    groups.set(command.group, [...(groups.get(command.group) ?? []), { ...command, match, index: 0 }]);

  if (!tokens.length) {
    for (const group of GROUPS) {
      for (const command of pool) if (command.group === group && !command.hidden) add(command);
    }
  } else {
    pool
      // Hidden commands answer to their aliases only, never to words in their label.
      .map((command, order) => ({ command, order, match: rank(tokens, command.hidden ? { label: "", keywords: command.keywords } : command) }))
      .filter(
        (entry): entry is { command: Command; order: number; match: Ranked } =>
          entry.match !== null && (!entry.command.hidden || entry.match.score >= tokens.length * HIDDEN_MIN),
      )
      .sort((a, b) => b.match.score - a.match.score || a.order - b.order)
      .forEach(({ command, match }) => add(command, match));
  }

  const sections = [...groups].map(([group, items]) => ({ group, items }));
  let next = 0;
  for (const section of sections) for (const item of section.items) item.index = next++;
  return sections;
}
