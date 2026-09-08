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
      en: "Make short videos through conversation, with scripts and source material kept in the same workspace.",
      zh: "用对话做短视频，文案和素材也留在这里。",
    },
    description: {
      en: "MultiMix is a workspace I built for short video creation. Users can describe what they want to make, organize references, and save generated scripts, images, and videos in separate libraries. They can find that material again when they want to revise or reuse it.",
      zh: "MultiMix 是我做的短视频创作工作台。用户可以提出创作需求、整理参考资料，再把生成的文案、图片和视频存进各自的资源库。需要时找回来，继续修改或复用。",
    },
    problem: {
      en: "When a brief, its references, and later revisions are scattered across tools, continuing the work means gathering the context again. MultiMix keeps them in one workspace alongside the generated material.",
      zh: "创作需求、参考资料和修改记录散在不同工具里，继续做时就要重新整理上下文。MultiMix 把这些内容放到同一个工作区，生成的产物也一起保存。",
    },
    approach: {
      en: "The Next.js interface uses the same conversation for creating content and organizing references. FastAPI handles assets and video tasks. PostgreSQL stores the data; Redis and RQ handle queued work. Generated files can be stored locally, in S3, or in Supabase.",
      zh: "界面使用 Next.js，内容生成和资料整理共用一个对话入口。FastAPI 后端处理资产和视频任务，PostgreSQL 存储数据，Redis 和 RQ 处理排队执行的任务。生成的文件可以保存在本地、S3 或 Supabase。",
    },
    impact: {
      en: "The deployed frontend includes scripts, images, and video projects. The backend API, task workers, and scheduler can run separately. Offline tests cover the main product flows and security constraints.",
      zh: "前端已部署，包含文案、图片和视频项目的操作流程。后端 API、任务 Worker 和调度器可以分别运行，离线测试覆盖主要产品流程和安全约束。",
    },
    highlights: [
      {
        en: "Create content and organize references in the same conversation",
        zh: "在同一个对话里创作内容、整理参考资料",
      },
      {
        en: "Separate libraries for source assets, scripts, images, and videos",
        zh: "来源资产、文案、图片和视频分库管理",
      },
      {
        en: "Run video tasks through a queue, with separate API, worker, and scheduler processes",
        zh: "视频任务排队执行，API、Worker 与调度器分别运行",
      },
      {
        en: "Check source compliance when searching public media and save the material used in a project",
        zh: "搜索公共素材时检查来源合规性，并保存项目采用的素材",
      },
    ],
    role: { en: "Product and full-stack development", zh: "产品与全栈开发" },
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
      { value: "Web", label: { en: "conversation workspace", zh: "对话工作台" } },
      { value: "RQ", label: { en: "video task queue", zh: "视频任务队列" } },
    ],
  },
  {
    slug: "opc-workspace",
    index: "02",
    title: { en: "opc-workspace", zh: "opc-workspace" },
    tagline: {
      en: "A desktop workspace for a one-person company, with data kept on your own computer.",
      zh: "给一人公司用的桌面工作台，数据留在自己的电脑上。",
    },
    description: {
      en: "opc-workspace is a desktop application for tasks, projects, client records, an inbox, and focus sessions. It works offline. Core business data is stored in SQLite and controlled file directories on the user's computer.",
      zh: "opc-workspace 是一个桌面应用，里面有任务、项目、客户记录、收件箱和专注计时。离线也能用，核心业务数据保存在用户电脑上的 SQLite 数据库和受控文件目录里。",
    },
    problem: {
      en: "For an independent developer, freelancer, creator, or consultant, daily work can involve separate task tools, project sheets, client records, and timers. Here, those modules use the same local data so the work can stay in one application.",
      zh: "独立开发者、自由职业者、内容创作者或顾问，日常工作可能要用到任务工具、项目表格、客户记录和计时器。这里让这些模块共用一套本地数据，减少在几个独立工具之间切换。",
    },
    approach: {
      en: "The React and TypeScript interface calls a Go sidecar through a versioned local API. Tauri handles the desktop shell and starts and stops the sidecar. Data handling includes SQLite migrations, controlled file storage, and backup and restore. Runtime dependencies are included in the installer.",
      zh: "React 与 TypeScript 界面通过版本化的本地 API 调用 Go Sidecar，Tauri 负责桌面外壳和 Sidecar 的启停。数据部分包含 SQLite 迁移、受控文件存储，以及备份和恢复。运行依赖随安装包一起提供。",
    },
    impact: {
      en: "Version 0.1.1 can produce unsigned Windows test installers in EXE and MSI formats. It supports task acceptance and rework, project and client records, focus tracking, search across modules, and data backup. These core workflows can run offline.",
      zh: "v0.1.1 可以生成 EXE 和 MSI 格式的 Windows 测试安装包，尚未签名。这个版本支持任务验收与返工、项目和客户记录、专注计时、跨模块搜索，以及数据备份。这些核心流程可以离线运行。",
    },
    highlights: [
      {
        en: "Tasks have six states and support subtasks, deliverables, acceptance, and rework",
        zh: "任务分为六种状态，支持子任务、提交产出、验收和返工",
      },
      {
        en: "Versioned SQLite migrations, backup and restore, and controlled file storage",
        zh: "SQLite 迁移有版本记录，数据支持备份恢复，文件保存在受控目录",
      },
      {
        en: "Tauri desktop package with an embedded Go sidecar",
        zh: "Tauri 桌面安装包内置 Go Sidecar",
      },
      {
        en: "Search tasks, projects, clients, and inbox items locally or open them from the command palette",
        zh: "通过本地搜索和命令面板查找任务、项目、客户与收件箱事项",
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
      { value: "Windows", label: { en: "test installers", zh: "测试安装包" } },
      { value: "SQLite", label: { en: "local data storage", zh: "本地数据存储" } },
    ],
  },
  {
    slug: "omnigate",
    index: "03",
    title: { en: "Omnigate", zh: "Omnigate" },
    tagline: {
      en: "An AI API gateway based on new-api, with my branding, configuration, and deployment work.",
      zh: "基于 new-api 二次开发的 AI API 网关，我做了品牌定制、配置和部署。",
    },
    description: {
      en: "Omnigate is based on the open-source new-api project. Protocol adapters, usage tracking, billing, and user management come from upstream. I customized the branding, reviewed the defaults for safer operation, and put together the deployment and operations setup for a single server.",
      zh: "Omnigate 基于开源项目 new-api。多协议适配、用量统计、计费和用户管理来自上游。我做的是品牌定制、默认配置与安全设置整理，以及单机环境的部署和运维方案。",
    },
    problem: {
      en: "Self-hosting the gateway means handling HTTPS, streamed responses through the proxy, the database, and the cache. Secret configuration and backups also need a defined place in the deployment process so it can be repeated when the service is updated.",
      zh: "把网关部署到自己的服务器上，需要处理 HTTPS、代理的流式响应、数据库和缓存。密钥怎么配置、数据怎么备份，也要写进部署流程，更新时才能照着执行。",
    },
    approach: {
      en: "Docker Compose builds the application from source and runs it alongside Caddy, PostgreSQL, and Redis. Caddy handles HTTPS with response buffering turned off for streaming. I also included environment variable templates, a database backup script with retention settings, and deployment notes in the repository.",
      zh: "Docker Compose 从源码构建应用，并运行 Caddy、PostgreSQL 和 Redis。Caddy 处理 HTTPS，为流式输出关闭响应缓冲。仓库里还放了环境变量模板、可按保留期清理旧备份的数据库备份脚本，以及部署记录。",
    },
    impact: {
      en: "The service is deployed at omnigate.cc. OpenAI-compatible clients can use its base URL and an issued token to call different models. The repository records how the service is configured, backed up, and updated.",
      zh: "服务部署在 omnigate.cc。兼容 OpenAI 格式的客户端可以配置这个地址和系统签发的令牌，调用不同模型。服务的配置、备份和更新方式都记录在仓库里。",
    },
    learning: {
      en: "I learned to read the Go and TypeScript code before deciding what to change, and to keep the custom work small enough to maintain. Deployment made several details concrete for me: why a reverse proxy can buffer streamed output, how HTTPS, PostgreSQL, and Redis are configured together, and how backups fit into an upgrade. I also had to read the license and separate my changes from the features supplied by new-api.",
      zh: "这次二次开发让我学会先读清 Go 和 TypeScript 代码，再决定改哪里，尽量把定制范围控制在自己能维护的程度。部署时，一些细节也变得具体了：反向代理为什么会缓冲流式输出，HTTPS、PostgreSQL 和 Redis 怎样配合，升级前怎样备份。许可证和上游归属也需要认真处理，哪些是 new-api 已经做好的，哪些是我的修改，要分开说明。",
    },
    highlights: [
      {
        en: "Build from source and deploy with Caddy, PostgreSQL, and Redis using Docker Compose",
        zh: "用 Docker Compose 从源码构建应用，配套 Caddy、PostgreSQL 和 Redis",
      },
      {
        en: "Automatic HTTPS and unbuffered streamed responses",
        zh: "自动配置 HTTPS，关闭流式响应缓冲",
      },
      {
        en: "Back up the database and remove old backups according to the retention setting",
        zh: "备份数据库，按设置的保留期清理旧备份",
      },
      {
        en: "Document which features come from new-api and which parts I customized",
        zh: "文档分别说明 new-api 的功能和我的定制工作",
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
      { value: "new-api", label: { en: "upstream project", zh: "二次开发基础" } },
      { value: "Compose", label: { en: "single-server deployment", zh: "单机部署" } },
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
