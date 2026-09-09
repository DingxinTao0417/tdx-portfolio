import type { Localized } from "./types";

/** Project case studies backed by Dingxin Tao's actual repositories and deployments. */

export type ProjectCategory = "ai" | "fullstack" | "data" | "fde";

export type ProjectImage = {
  src: string;
  alt: Localized;
  width: number;
  height: number;
  caption?: Localized;
};

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
  links: { github?: string; githubPrivate?: boolean; demo?: string };
  cover?: ProjectImage;
  gallery?: ProjectImage[];
  galleryNote?: Localized;
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
    gallery: [
      {
        src: "/projects/multimix-conversation.png",
        width: 1920,
        height: 911,
        alt: {
          en: "MultiMix conversation workspace with generation progress and a failed generation status",
          zh: "MultiMix 对话创作界面，显示生成进度与生成失败状态",
        },
        caption: {
          en: "Conversation and generation progress",
          zh: "对话创作与生成进度",
        },
      },
      {
        src: "/projects/multimix-image-library.png",
        width: 1920,
        height: 911,
        alt: {
          en: "MultiMix image library with image cards and category filters",
          zh: "MultiMix 图片库界面，展示图片卡片与分类筛选",
        },
        caption: { en: "Image library", zh: "图片库" },
      },
      {
        src: "/projects/multimix-script-library.png",
        width: 1920,
        height: 911,
        alt: {
          en: "MultiMix script library with saved content plans and category filters",
          zh: "MultiMix 文案库界面，展示已保存的内容方案与分类筛选",
        },
        caption: { en: "Script library", zh: "文案库" },
      },
    ],
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
      src: "/projects/opc-workspace-today.png",
      width: 1920,
      height: 911,
      alt: {
        en: "opc-workspace today dashboard with inbox, focus timer, and task overview",
        zh: "opc-workspace 今日工作台界面",
      },
      caption: { en: "Today workspace", zh: "今日工作台" },
    },
    gallery: [
      {
        src: "/projects/opc-workspace-new-task.png",
        width: 1920,
        height: 911,
        alt: {
          en: "opc-workspace new task dialog with project, deadline, priority, and acceptance settings",
          zh: "opc-workspace 新建任务窗口，包含项目、截止时间、优先级和验收设置",
        },
        caption: { en: "Create a task", zh: "新建任务" },
      },
      {
        src: "/projects/opc-workspace-ai-assistant.png",
        width: 1920,
        height: 911,
        alt: {
          en: "opc-workspace AI assistant proposing a website development task from a conversation",
          zh: "opc-workspace AI 助手根据对话建议创建网站开发任务",
        },
        caption: { en: "AI task assistant", zh: "AI 任务助手" },
      },
      {
        src: "/projects/opc-workspace-tasks.png",
        width: 1920,
        height: 911,
        alt: {
          en: "opc-workspace task list with search, filters, sorting, and a task row",
          zh: "opc-workspace 任务列表，包含搜索、筛选、排序和任务条目",
        },
        caption: { en: "Task list", zh: "任务列表" },
      },
    ],
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
      src: "/projects/omnigate-dashboard.png",
      width: 1920,
      height: 911,
      alt: {
        en: "Omnigate dashboard with setup guidance, API request examples, and usage panels",
        zh: "Omnigate 控制台概览，包含使用引导、API 请求示例和用量面板",
      },
      caption: { en: "Dashboard overview", zh: "控制台概览" },
    },
    gallery: [
      {
        src: "/projects/omnigate-service-status.png",
        width: 1920,
        height: 911,
        alt: {
          en: "Omnigate service status page with request history and infrastructure health panels",
          zh: "Omnigate 服务状态页，展示请求记录和基础设施健康面板",
        },
        caption: { en: "Service status", zh: "服务状态" },
      },
      {
        src: "/projects/omnigate-home.png",
        width: 1920,
        height: 911,
        alt: {
          en: "Omnigate public homepage with API gateway positioning and model routing illustration",
          zh: "Omnigate 公开首页，展示 API 网关定位和模型路由示意图",
        },
        caption: { en: "Public homepage", zh: "公开首页" },
      },
      {
        src: "/projects/omnigate-ai-usage-guide.png",
        width: 1920,
        height: 911,
        alt: {
          en: "Omnigate documentation article about personal practices for using AI coding tools",
          zh: "Omnigate 文档文章，记录个人使用 AI 编程工具的经验",
        },
        caption: { en: "AI usage guide", zh: "AI 使用心得" },
      },
    ],
    featured: true,
    hue: 14,
    motif: "orbit",
    metrics: [
      { value: "new-api", label: { en: "upstream project", zh: "二次开发基础" } },
      { value: "Compose", label: { en: "single-server deployment", zh: "单机部署" } },
    ],
  },
  {
    slug: "as-a",
    index: "04",
    title: { en: "As-a", zh: "As-a" },
    tagline: {
      en: "An Arabic and English marketplace for finding professionals, discussing work, and managing orders.",
      zh: "一个阿拉伯语与英语的服务平台，找人做事、沟通需求、跟进订单。",
    },
    description: {
      en: "As-a connects people looking for professional services with providers. Buyers can browse services, check what is included, and discuss a job before ordering. Providers have their own workspace for listings, orders, and earnings. The interface supports Arabic and English, including right-to-left layouts.",
      zh: "As-a 连接有需求的人和提供专业服务的人。买家可以按分类找服务，看清交付范围，再联系服务商、沟通和下单。服务商有自己的后台，管理上架内容、订单与收益。界面支持阿拉伯语和英语，也处理了从右向左的阅读布局。",
    },
    problem: {
      en: "A service listing only answers part of a buyer's questions. The scope, price, and delivery still need to be agreed on. As-a keeps the conversation and its orders together, so both sides can refer back to the work they discussed and see its status.",
      zh: "选中一个服务之后，事情还没结束：具体做什么、多少钱、什么时候算交付，都要讲清楚。As-a 把会话和订单放在一起，让双方能回头查看约定，知道工作进行到了哪一步。",
    },
    approach: {
      en: "The application uses Next.js and TypeScript, with Supabase for accounts, PostgreSQL data, file storage, and message subscriptions. Providers can create an order in a conversation; buyers can also order from a listing. The Tap checkout code checks payments on the server and handles repeated callbacks without settling an order twice. Database permissions and transactions govern who can read or change records.",
      zh: "应用使用 Next.js 和 TypeScript，账户、PostgreSQL 数据、文件存储与消息订阅交给 Supabase。服务商可以在会话里创建订单，买家也能从服务页直接下单。Tap 支付接入在服务端核对交易结果，并处理重复回调；哪些记录能看、哪些状态能改，由数据库权限和事务约束。",
    },
    impact: {
      en: "The current version includes a service directory, provider onboarding, conversations, order delivery confirmation, and administrator review. The repository has local tests for permissions and payment logic. It remains a product demo: live payment integration, migration of the existing database, and refund and dispute procedures still need acceptance before real transactions are opened.",
      zh: "目前已有服务目录、服务商入驻、站内会话、订单交付确认和管理员审核，仓库里也有针对权限与支付逻辑的本地测试。当前仍按产品演示来展示。真实支付联调、旧数据库迁移，以及退款和争议处理，还需要在开放交易前完成验收。",
    },
    learning: {
      en: "This project made me pay more attention to what happens after a click. A payment callback can arrive twice, a price sent by the browser cannot be trusted, and each side needs different permissions on the same order. I want those rules to live in server and database code, with tests that check what each person can actually do.",
      zh: "这个项目让我更在意点击按钮之后发生的事。支付回调可能来两次，浏览器传来的价格不能直接信，同一个订单对买家和服务商也有不同的操作权限。我更愿意把这些规则写进服务端和数据库，再用测试检查每种身份实际能做什么。",
    },
    highlights: [
      {
        en: "Arabic and English service content, search, category filters, and right-to-left layouts",
        zh: "阿拉伯语与英语服务内容、搜索和分类筛选，以及 RTL 布局",
      },
      {
        en: "Conversations with order cards and separate delivery and buyer-confirmation steps",
        zh: "会话中展示订单卡片，服务商交付与买家确认分开处理",
      },
      {
        en: "Server-side payment verification, checks against duplicate processing, and manual payout records",
        zh: "服务端核对支付、防止重复处理，并记录人工提现转账凭据",
      },
      {
        en: "Listing moderation, database access rules, and administrator audit records",
        zh: "服务上架审核、数据库访问权限与管理员操作记录",
      },
    ],
    role: { en: "Full-stack development", zh: "全栈开发" },
    year: "2026",
    category: "fullstack",
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS", "Tap Payments", "Vitest", "Playwright"],
    links: { github: "https://github.com/DingxinTao0417/As-a", githubPrivate: true },
    cover: {
      src: "/projects/as-a.png",
      width: 1920,
      height: 911,
      alt: { en: "As-a marketplace homepage with Arabic branding and English content", zh: "As-a 服务平台首页，展示阿拉伯语标识与英语内容" },
      caption: { en: "Marketplace homepage", zh: "平台首页" },
    },
    gallery: [
      {
        src: "/projects/as-a-services.png",
        width: 1920,
        height: 911,
        alt: { en: "As-a service directory with search, categories, and demo service cards", zh: "As-a 服务目录，包含搜索、分类筛选和演示服务卡片" },
        caption: { en: "Service directory", zh: "服务列表与筛选" },
      },
      {
        src: "/projects/as-a-service-detail.png",
        width: 1920,
        height: 911,
        alt: { en: "As-a demo service detail with a provider profile and pricing panel", zh: "As-a 演示服务详情，展示服务商资料与价格面板" },
        caption: { en: "Service details", zh: "服务详情" },
      },
      {
        src: "/projects/as-a-service-workflow.png",
        width: 1920,
        height: 911,
        alt: { en: "As-a service page showing included deliverables, workflow, and frequently asked questions", zh: "As-a 服务页的交付范围、工作步骤与常见问题" },
        caption: { en: "Scope and delivery steps", zh: "交付说明与常见问题" },
      },
      {
        src: "/projects/as-a-provider-dashboard.png",
        width: 1920,
        height: 911,
        alt: { en: "As-a provider dashboard with test orders, earnings panels, and a payment account connection notice", zh: "As-a 服务商后台，显示测试订单、收益面板和支付账户待连接提示" },
        caption: { en: "Provider dashboard", zh: "服务商后台" },
      },
      {
        src: "/projects/as-a-messages.png",
        width: 1920,
        height: 911,
        alt: { en: "As-a messages page with a conversation list and a pending order card", zh: "As-a 消息页面，展示会话列表与待付款订单卡片" },
        caption: { en: "Conversations and orders", zh: "消息与订单" },
      },
    ],
    galleryNote: {
      en: "Screenshots show the demo interface. Service data, ratings, badges, and amounts do not represent verified credentials or real trading results.",
      zh: "截图为演示界面，其中的服务数据、评分、认证标识和金额不代表真实资质或交易业绩。",
    },
    featured: true,
    hue: 145,
    motif: "grid",
    metrics: [
      { value: "AR / EN", label: { en: "bilingual interface", zh: "双语界面" } },
      { value: "RTL", label: { en: "right-to-left layout", zh: "从右向左布局" } },
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
