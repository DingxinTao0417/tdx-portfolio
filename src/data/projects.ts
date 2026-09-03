import type { Localized } from "./types";

/** Project case studies backed by Dingxin Tao's actual repositories and deployments. */

export type ProjectCategory = "ai" | "fullstack" | "data" | "fde";

export type Project = {
  slug: string;
  index: string;
  title: Localized;
  tagline: Localized;
  description: Localized;
  problem: Localized;
  approach: Localized;
  impact: Localized;
  learning?: Localized;
  highlights: Localized[];
  role: Localized;
  year: string;
  category: ProjectCategory;
  stack: string[];
  links: { github?: string; demo?: string };
  cover?: { src: string; alt: Localized; width: number; height: number };
  featured?: boolean;
  /** Hue (0-360) used to tint the generative cover artwork. */
  hue: number;
  /** Visual motif for the generative cover. */
  motif: "orbit" | "grid" | "wave" | "stack" | "graph" | "prism";
  metrics: { value: string; label: Localized }[];
};

export const projects: Project[] = [
  {
    slug: "multimix",
    index: "01",
    title: { en: "MultiMix", zh: "MultiMix" },
    tagline: {
      en: "A conversational workspace for creating and organizing scripts, images, and videos.",
      zh: "把文案、图片和视频创作放进同一个对话工作台。",
    },
    description: {
      en: "MultiMix is a conversational workspace for short-form video production. Users can describe what they want to make, organize reference material, and save generated scripts, images, and videos into separate libraries for later search and reuse.",
      zh: "MultiMix 是一个面向短视频内容生产的对话式工作台。用户可以直接提出创作需求、整理参考资料，并把生成的文案、图片和视频保存到对应资源库，方便之后检索、复用和继续生成。",
    },
    problem: {
      en: "The project was built to keep creative requests, source material, generated assets, and later revisions in one workspace instead of scattering that context across separate tools.",
      zh: "这个项目把创作需求、参考资料、生成结果和后续修改放在同一个工作区里，减少在不同工具之间反复整理上下文的过程。",
    },
    approach: {
      en: "The Next.js frontend uses one conversation entry for both creation and knowledge capture. A FastAPI backend handles assets and video orchestration, with PostgreSQL, Redis, and RQ for persistent and asynchronous work. Artifact storage can run locally or use S3 and Supabase.",
      zh: "前端使用 Next.js，把内容生成和资料整理统一到一个对话入口。FastAPI 后端负责资产管理与视频编排，PostgreSQL、Redis 和 RQ 分别承载持久化数据与异步任务，产物可以存到本地、S3 或 Supabase。",
    },
    impact: {
      en: "The deployed frontend covers the workflow for scripts, images, and video projects. The backend can run as separate API, worker, and scheduler services, while offline tests cover the main product flows and security contracts.",
      zh: "目前上线的前端已经覆盖文案、图片和视频工程流程。后端可以拆分为 API、不同任务 Worker 和调度器独立运行，离线测试覆盖主要产品流程与安全约束。",
    },
    highlights: [
      {
        en: "One conversation entry for both content creation and knowledge capture",
        zh: "用同一个对话入口处理内容创作与资料沉淀",
      },
      {
        en: "Separate libraries for source assets, scripts, images, and videos",
        zh: "来源资产、文案、图片和视频分库管理",
      },
      {
        en: "Queued video orchestration with independent API, worker, and scheduler roles",
        zh: "视频编排采用任务队列，API、Worker 与调度器可独立运行",
      },
      {
        en: "Public media search with source compliance checks and persistent artifact storage",
        zh: "公共素材搜索包含来源合规检查，并将采用的素材持久化保存",
      },
    ],
    role: { en: "AI product and full-stack development", zh: "AI 产品与全栈开发" },
    year: "2026",
    category: "ai",
    stack: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "Python",
      "PostgreSQL",
      "Redis",
      "RQ",
      "Supabase",
      "Remotion",
      "Railway",
    ],
    links: {
      github: "https://github.com/DingxinTao0417/MultiMix-Frontend",
      demo: "https://multimix-frontend.vercel.app/",
    },
    cover: {
      src: "/projects/multimix.png",
      width: 1920,
      height: 945,
      alt: {
        en: "MultiMix new video project workspace",
        zh: "MultiMix 新建视频项目界面",
      },
    },
    featured: true,
    hue: 22,
    motif: "graph",
    metrics: [
      { value: "3", label: { en: "content output types", zh: "类内容产物" } },
      { value: "4", label: { en: "content libraries", zh: "个内容资源库" } },
      { value: "5", label: { en: "backend runtime roles", zh: "个后端运行角色" } },
    ],
  },
  {
    slug: "opc-workspace",
    index: "02",
    title: { en: "opc-workspace", zh: "opc-workspace" },
    tagline: {
      en: "A local-first desktop workspace for the day-to-day work of a one-person company.",
      zh: "为一人公司的日常工作打造的本地优先桌面工作台。",
    },
    description: {
      en: "opc-workspace brings tasks, projects, clients, an inbox, focus sessions, and local business data into one offline-capable desktop application. Its core data stays in SQLite and controlled directories on the user's own computer.",
      zh: "opc-workspace 把任务、项目、客户、收件箱、专注时间和本地业务数据放进一个可离线使用的桌面应用。核心数据保存在用户自己电脑上的 SQLite 数据库与受控文件目录中。",
    },
    problem: {
      en: "Independent developers, freelancers, creators, and consultants often move between task tools, project sheets, client records, and timers. The project gives those workflows one shared set of local business facts.",
      zh: "独立开发者、自由职业者和内容创作者经常要在任务工具、项目表格、客户资料与计时器之间切换。这个项目用一套本地业务数据把这些工作串在一起。",
    },
    approach: {
      en: "A React and TypeScript interface talks to a Go sidecar over a versioned local API. Tauri manages the desktop shell and sidecar lifecycle, while SQLite migrations, controlled file storage, and backup and restore flows protect local data. The installed app bundles its runtime dependencies.",
      zh: "React 与 TypeScript 界面通过版本化本地 API 访问 Go Sidecar。Tauri 负责桌面外壳和 Sidecar 生命周期，SQLite 迁移、受控文件存储与备份恢复流程负责保护本地数据。安装包已经包含应用运行所需的依赖。",
    },
    impact: {
      en: "Version 0.1.1 can produce unsigned Windows test installers in both EXE and MSI formats. The current build supports the core offline workflow, including task acceptance and rework, project and client records, focus tracking, search, and data backup.",
      zh: "v0.1.1 已经可以生成 EXE 与 MSI 两种 Windows 测试安装包。当前版本支持任务验收与返工、项目和客户资料、专注计时、跨模块搜索以及数据备份等核心离线流程。",
    },
    highlights: [
      {
        en: "Six-state task lifecycle with subtasks, deliverables, acceptance, and rework",
        zh: "六状态任务生命周期，包含子任务、产出提交、验收与返工",
      },
      {
        en: "Versioned SQLite migrations with backup, restore, and controlled file storage",
        zh: "版本化 SQLite 迁移，配合备份恢复与受控文件存储",
      },
      {
        en: "Tauri desktop package with an embedded Go sidecar",
        zh: "Tauri 桌面安装包内置 Go Sidecar",
      },
      {
        en: "Local search and command palette across tasks, projects, clients, and inbox items",
        zh: "通过本地搜索和命令面板直达任务、项目、客户与收件箱事项",
      },
    ],
    role: { en: "Product design and full-stack development", zh: "产品设计与全栈开发" },
    year: "2026",
    category: "fullstack",
    stack: ["React", "TypeScript", "Go", "SQLite", "Tauri", "Rust", "Vite", "Tailwind CSS"],
    links: { github: "https://github.com/DingxinTao0417/opc-workspace" },
    cover: {
      src: "/projects/opc-workspace.png",
      width: 1920,
      height: 911,
      alt: {
        en: "opc-workspace today dashboard",
        zh: "opc-workspace 今日工作台界面",
      },
    },
    featured: true,
    hue: 36,
    motif: "stack",
    metrics: [
      { value: "v0.1.1", label: { en: "current prerelease", zh: "当前预发布版本" } },
      { value: "44", label: { en: "SQLite schema version", zh: "SQLite schema 版本" } },
      { value: "2", label: { en: "Windows installer formats", zh: "种 Windows 安装包" } },
    ],
  },
  {
    slug: "omnigate",
    index: "03",
    title: { en: "Omnigate", zh: "Omnigate" },
    tagline: {
      en: "Production deployment and brand customization for an open-source AI API gateway.",
      zh: "基于开源 AI API 网关完成的品牌定制与生产部署。",
    },
    description: {
      en: "Omnigate is a secondary development project based on the open-source new-api codebase. The upstream project provides the core protocol adapters, usage tracking, billing, and user management. My work focused on branding, safer defaults, and a production deployment and operations setup for a single server.",
      zh: "Omnigate 是基于开源项目 new-api 的二次开发。上游提供多协议适配、用量统计、计费和用户管理等核心能力；我完成了品牌定制、默认配置整理，以及面向单机环境的生产部署与运维方案。",
    },
    problem: {
      en: "A self-hosted model gateway needs more than application code. HTTPS, streaming proxy behavior, database and cache services, secret templates, backups, and a repeatable deployment process all need to work together.",
      zh: "自托管模型网关不只有应用代码。HTTPS、流式代理、数据库、缓存、密钥模板、备份和可重复执行的部署流程都需要一起处理。",
    },
    approach: {
      en: "The deployment builds the application from source and runs it with Caddy, PostgreSQL, and Redis through Docker Compose. Caddy terminates HTTPS without buffering streamed responses. The repository also includes environment templates, a database backup script with retention cleanup, and an operations log.",
      zh: "部署方案通过 Docker Compose 从源码构建应用，并配套运行 Caddy、PostgreSQL 和 Redis。Caddy 负责 HTTPS，同时关闭响应缓冲以保证流式输出。仓库还提供环境变量模板、带保留期清理的数据库备份脚本和实际部署记录。",
    },
    impact: {
      en: "The service is running at omnigate.cc. Clients can use one base URL and one issued token with OpenAI-compatible tools, while the deployment files document how the service is configured, backed up, and updated.",
      zh: "服务已运行在 omnigate.cc。客户端只需配置一个 Base URL 和系统签发的令牌，就能通过兼容 OpenAI 格式的工具调用不同模型；部署配置也记录了服务的配置、备份与更新方式。",
    },
    learning: {
      en: "This project taught me how to work through a mature open-source codebase before changing it, and how to keep custom work within a maintainable boundary. I also gained a more practical understanding of streamed responses behind a reverse proxy, and how HTTPS, PostgreSQL, Redis, database backups, and upgrades fit together in production. Handling the license and upstream attribution made me more careful about separating upstream capabilities from my own work.",
      zh: "这次二次开发让我完整走过了一套成熟开源系统的落地过程。我学会了先读清 Go 与 TypeScript 代码里的边界，再把自己的修改控制在可维护的范围内；也更具体地理解了流式响应为什么会被反向代理缓冲，以及 HTTPS、PostgreSQL、Redis、数据库备份和升级流程在生产环境里怎样配合。处理许可证与上游归属时，我也学会了明确区分上游能力和自己的工作。",
    },
    highlights: [
      {
        en: "Source-built Docker Compose deployment with Caddy, PostgreSQL, and Redis",
        zh: "从源码构建的 Docker Compose 部署，包含 Caddy、PostgreSQL 与 Redis",
      },
      {
        en: "Automatic HTTPS with response buffering disabled for streamed output",
        zh: "自动配置 HTTPS，并为流式输出关闭响应缓冲",
      },
      {
        en: "Database backup script with configurable retention cleanup",
        zh: "数据库备份脚本支持按保留期自动清理",
      },
      {
        en: "Project documentation clearly separates upstream features from custom work",
        zh: "项目文档明确区分上游能力与本仓库的定制工作",
      },
    ],
    role: { en: "Brand customization, deployment, and operations", zh: "品牌定制、部署与运维" },
    year: "2026",
    category: "fde",
    stack: ["Go", "TypeScript", "Docker", "PostgreSQL", "Redis", "Caddy", "Linux"],
    links: {
      github: "https://github.com/DingxinTao0417/omnigate",
      demo: "https://omnigate.cc/",
    },
    cover: {
      src: "/projects/omnigate.png",
      width: 1920,
      height: 911,
      alt: {
        en: "Omnigate API gateway homepage",
        zh: "Omnigate API 网关首页",
      },
    },
    featured: true,
    hue: 14,
    motif: "orbit",
    metrics: [
      { value: "7+", label: { en: "model families", zh: "个模型系列" } },
      { value: "4", label: { en: "production services", zh: "个生产服务" } },
      { value: "1", label: { en: "compatible API endpoint", zh: "个兼容 API 入口" } },
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getAdjacentProject(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return undefined;
  return projects[(index + 1) % projects.length];
}
