import type { Localized } from "./types";

/**
 * Project case studies.
 *
 * NOTE: These entries are representative of the kind of AI / full-stack / FDE
 * work described on this site. Replace titles, metrics and links with your own
 * real projects — the UI adapts automatically.
 */

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
  highlights: Localized[];
  role: Localized;
  year: string;
  category: ProjectCategory;
  stack: string[];
  links: { github?: string; demo?: string };
  featured?: boolean;
  /** Hue (0–360) used to tint the generative cover artwork. */
  hue: number;
  /** Visual motif for the generative cover. */
  motif: "orbit" | "grid" | "wave" | "stack" | "graph" | "prism";
  metrics: { value: string; label: Localized }[];
};

export const projects: Project[] = [
  {
    slug: "atlas-enterprise-rag",
    index: "01",
    title: { en: "Atlas — Enterprise RAG Platform", zh: "Atlas — 企业级 RAG 平台" },
    tagline: {
      en: "Grounded answers over 40k internal documents, deployed inside a customer's VPC.",
      zh: "覆盖 4 万份内部文档的有据可依问答系统，部署在客户自己的 VPC 内。",
    },
    description: {
      en: "A retrieval-augmented generation platform that lets operations teams ask natural-language questions over policies, runbooks and tickets — with citations, access control and an evaluation loop that keeps quality honest.",
      zh: "一个检索增强生成（RAG）平台，让运营团队可以用自然语言查询政策、运维手册与工单——带引用、权限控制，以及一套让质量保持诚实的评测回路。",
    },
    problem: {
      en: "Knowledge was scattered across wikis, PDFs and a ticketing system. Search returned documents, not answers, and a first LLM prototype hallucinated on edge cases nobody had tested.",
      zh: "知识散落在 wiki、PDF 和工单系统里。搜索返回的是文档而不是答案，而第一个 LLM 原型在没人测过的边缘场景上会产生幻觉。",
    },
    approach: {
      en: "Hybrid retrieval (BM25 + pgvector) with document-level ACLs, a re-ranking stage, structured citations, and a 300-question golden set scored nightly. Streaming UI in Next.js; ingestion and orchestration in FastAPI workers.",
      zh: "混合检索（BM25 + pgvector）叠加文档级权限控制、重排序阶段、结构化引用，以及每晚自动评分的 300 题黄金测试集。前端为 Next.js 流式界面，摄取与编排由 FastAPI 工作进程完成。",
    },
    impact: {
      en: "Answer faithfulness rose from 71% to 94% on the golden set, median time-to-answer dropped from minutes of searching to ~6 seconds, and the system passed the customer's security review on the first attempt.",
      zh: "黄金测试集上的答案忠实度从 71% 提升到 94%，中位回答时间从数分钟的检索缩短到约 6 秒，并一次性通过客户的安全评审。",
    },
    highlights: [
      { en: "Hybrid BM25 + vector retrieval with per-document ACL filtering", zh: "BM25 + 向量混合检索，按文档级权限过滤" },
      { en: "Nightly eval harness with faithfulness / relevance / latency dashboards", zh: "每晚自动评测，含忠实度 / 相关性 / 延迟看板" },
      { en: "Token-streamed answers with inline, clickable citations", zh: "逐 token 流式回答，内联可点击引用" },
      { en: "Zero-egress deployment inside the customer's AWS VPC", zh: "零出口流量，部署在客户 AWS VPC 内" },
    ],
    role: { en: "Forward Deployed Engineer · end-to-end owner", zh: "前沿部署工程师 · 端到端负责" },
    year: "2025",
    category: "fde",
    stack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "pgvector", "LangGraph", "AWS", "Docker"],
    links: { github: "https://github.com/DingxinTao0417" },
    featured: true,
    hue: 22,
    motif: "graph",
    metrics: [
      { value: "94%", label: { en: "faithfulness", zh: "答案忠实度" } },
      { value: "~6s", label: { en: "median answer", zh: "中位回答时间" } },
      { value: "40k", label: { en: "documents indexed", zh: "已索引文档" } },
    ],
  },
  {
    slug: "forge-agent-workflows",
    index: "02",
    title: { en: "Forge — Agentic Workflow Builder", zh: "Forge — 智能体工作流构建器" },
    tagline: {
      en: "Visual builder for tool-calling agents with typed contracts and replayable runs.",
      zh: "面向工具调用型智能体的可视化构建器，带类型化契约与可回放的运行记录。",
    },
    description: {
      en: "A node-based editor where teams compose agents from typed tools, approval gates and memory, then run them with full tracing. Every run is replayable, diffable and testable.",
      zh: "一个基于节点的编辑器，团队可以用类型化工具、审批节点与记忆模块组合智能体，并在完整链路追踪下运行。每一次运行都可回放、可对比、可测试。",
    },
    problem: {
      en: "Agent prototypes lived in notebooks. Nobody could tell why a run failed, prompts drifted silently, and every integration was a bespoke script.",
      zh: "智能体原型都活在 notebook 里。没人说得清一次运行为什么失败，prompt 悄悄漂移，每个集成都是一次性脚本。",
    },
    approach: {
      en: "Zod-typed tool schemas shared across the editor and runtime, a LangGraph-based executor with checkpointing, an OpenTelemetry trace viewer, and a regression suite that replays recorded runs against new prompts.",
      zh: "编辑器与运行时共享 Zod 类型化工具 schema，基于 LangGraph 的带检查点执行器，OpenTelemetry 链路查看器，以及可用新 prompt 回放历史运行的回归测试套件。",
    },
    impact: {
      en: "Cut time to build a new internal agent from days to hours; regression suite caught 3 prompt regressions before they reached users.",
      zh: "新建一个内部智能体的时间从数天缩短到数小时；回归套件在 3 次 prompt 回退触达用户之前就将其拦截。",
    },
    highlights: [
      { en: "Shared Zod schemas: one source of truth for editor, runtime and docs", zh: "共享 Zod schema：编辑器、运行时与文档的唯一真相来源" },
      { en: "Checkpointed execution with human-in-the-loop approval gates", zh: "带检查点的执行，支持人在回路的审批节点" },
      { en: "Trace viewer with token/cost attribution per step", zh: "链路查看器，按步骤归因 token 与成本" },
      { en: "Record-and-replay regression testing for prompts and tools", zh: "针对 prompt 与工具的录制回放式回归测试" },
    ],
    role: { en: "AI Full-Stack Engineer · architecture & frontend lead", zh: "AI 全栈工程师 · 架构与前端负责人" },
    year: "2025",
    category: "ai",
    stack: ["React", "TypeScript", "Zod", "LangGraph", "Node.js", "PostgreSQL", "OpenTelemetry", "Vercel"],
    links: { github: "https://github.com/DingxinTao0417" },
    featured: true,
    hue: 36,
    motif: "orbit",
    metrics: [
      { value: "days → hrs", label: { en: "build time", zh: "构建时间" } },
      { value: "100%", label: { en: "runs replayable", zh: "运行可回放" } },
      { value: "3", label: { en: "regressions caught", zh: "拦截的回退" } },
    ],
  },
  {
    slug: "lens-llm-observability",
    index: "03",
    title: { en: "Lens — LLM Observability", zh: "Lens — LLM 可观测性平台" },
    tagline: {
      en: "Real-time quality, cost and latency for every model call in production.",
      zh: "生产环境中每一次模型调用的实时质量、成本与延迟。",
    },
    description: {
      en: "An observability layer that ingests LLM traces, scores outputs with model-graded rubrics, and surfaces regressions on a live dashboard with alerting.",
      zh: "一个可观测性层：摄取 LLM 链路数据，用模型评分量规打分，并在带告警的实时看板上暴露回退。",
    },
    problem: {
      en: "Teams shipped model changes blind. Cost spikes and quality dips were discovered by customers first.",
      zh: "团队在盲飞中发布模型改动。成本飙升与质量下滑都是客户先发现的。",
    },
    approach: {
      en: "OpenTelemetry-compatible ingestion into ClickHouse, async model-graded evals sampled by traffic, and a Next.js dashboard with server-streamed charts. Alerts route to Slack with a diff of the offending prompt.",
      zh: "兼容 OpenTelemetry 的数据摄取写入 ClickHouse，按流量采样的异步模型评分，以及服务端流式图表的 Next.js 看板。告警推送到 Slack，并附带问题 prompt 的差异对比。",
    },
    impact: {
      en: "Detected a 3× cost regression within 12 minutes of deploy; became the default pre-release gate for prompt changes.",
      zh: "在部署后 12 分钟内发现一次 3 倍成本回退；成为 prompt 变更的默认发布前门禁。",
    },
    highlights: [
      { en: "OTel-native ingestion, 50k spans/min on a single node", zh: "OTel 原生摄取，单节点 5 万 span/分钟" },
      { en: "Model-graded rubrics with sampled human calibration", zh: "模型评分量规 + 抽样人工校准" },
      { en: "Server-streamed dashboards with sub-second refresh", zh: "服务端流式看板，亚秒级刷新" },
    ],
    role: { en: "Full-Stack Engineer · data pipeline & dashboard", zh: "全栈工程师 · 数据管线与看板" },
    year: "2024",
    category: "ai",
    stack: ["Next.js", "TypeScript", "ClickHouse", "Python", "OpenTelemetry", "Redis", "Docker"],
    links: { github: "https://github.com/DingxinTao0417" },
    featured: true,
    hue: 14,
    motif: "wave",
    metrics: [
      { value: "12 min", label: { en: "to detect regression", zh: "发现回退用时" } },
      { value: "50k/min", label: { en: "spans ingested", zh: "span 摄取速率" } },
    ],
  },
  {
    slug: "pulse-ops-analytics",
    index: "04",
    title: { en: "Pulse — Operations Analytics", zh: "Pulse — 运营分析平台" },
    tagline: {
      en: "From raw event streams to decisions: dbt models, forecasts and a self-serve BI layer.",
      zh: "从原始事件流到决策：dbt 模型、预测与自助式 BI 层。",
    },
    description: {
      en: "An analytics stack that turns operational event data into forecastable metrics, with a semantic layer so non-analysts can ask questions safely.",
      zh: "一个把运营事件数据转化为可预测指标的分析技术栈，并通过语义层让非分析师也能安全提问。",
    },
    problem: {
      en: "Reporting was a weekly spreadsheet exercise. Definitions of 'active' and 'churned' differed by team.",
      zh: "报表是每周一次的手工表格。「活跃」和「流失」的定义因团队而异。",
    },
    approach: {
      en: "Event contracts validated at ingestion, dbt models with tests and documentation, Prophet-based forecasts, and a natural-language-to-SQL interface constrained by the semantic layer.",
      zh: "在摄取时校验事件契约，带测试与文档的 dbt 模型，基于 Prophet 的预测，以及受语义层约束的自然语言转 SQL 接口。",
    },
    impact: {
      en: "One definition per metric across the org; forecast MAPE under 8% on weekly volume; analysts reclaimed roughly a day per week.",
      zh: "全组织每个指标只有一个定义；周度业务量预测 MAPE 低于 8%；分析师每周节省约一天时间。",
    },
    highlights: [
      { en: "Semantic layer guards NL→SQL from hallucinated joins", zh: "语义层防止自然语言转 SQL 时的错误关联" },
      { en: "Tested, documented dbt models as the metric source of truth", zh: "经测试与文档化的 dbt 模型作为指标唯一真相来源" },
      { en: "Weekly forecasts with confidence bands in the dashboard", zh: "看板内含置信区间的周度预测" },
    ],
    role: { en: "Analytics Engineer · modeling & interface", zh: "分析工程师 · 数据建模与界面" },
    year: "2024",
    category: "data",
    stack: ["Python", "SQL", "dbt", "PostgreSQL", "Prophet", "Next.js", "Plotly"],
    links: { github: "https://github.com/DingxinTao0417" },
    hue: 44,
    motif: "grid",
    metrics: [
      { value: "<8%", label: { en: "forecast MAPE", zh: "预测 MAPE" } },
      { value: "1", label: { en: "definition per metric", zh: "每个指标一个定义" } },
    ],
  },
  {
    slug: "courier-document-intake",
    index: "05",
    title: { en: "Courier — Multimodal Document Intake", zh: "Courier — 多模态文档处理" },
    tagline: {
      en: "Vision-language extraction that turns messy PDFs and scans into validated records.",
      zh: "用视觉语言模型把杂乱的 PDF 与扫描件转化为经校验的结构化记录。",
    },
    description: {
      en: "A document pipeline that classifies, extracts and validates structured data from invoices, forms and contracts — with human review only where confidence is low.",
      zh: "一条文档处理管线：对发票、表单与合同进行分类、抽取并校验结构化数据——只在置信度低时才进入人工审核。",
    },
    problem: {
      en: "Manual data entry from thousands of monthly documents, with error rates that leaked into downstream finance systems.",
      zh: "每月数千份文档依赖人工录入，错误率一路泄漏进下游财务系统。",
    },
    approach: {
      en: "Layout-aware chunking, a VLM extraction step with JSON-schema-constrained outputs, field-level confidence scoring, and a review queue UI that learns from corrections.",
      zh: "版面感知的切分、受 JSON schema 约束输出的 VLM 抽取、字段级置信度评分，以及能从人工修正中学习的审核队列界面。",
    },
    impact: {
      en: "Straight-through processing for 82% of documents; field accuracy above 98% on the reviewed set.",
      zh: "82% 的文档实现直通处理；抽样审核集上的字段准确率超过 98%。",
    },
    highlights: [
      { en: "Schema-constrained VLM outputs — no free-text parsing", zh: "受 schema 约束的 VLM 输出，不做自由文本解析" },
      { en: "Confidence-routed human review queue", zh: "按置信度路由的人工审核队列" },
      { en: "Corrections feed back into few-shot exemplars", zh: "人工修正回流为 few-shot 示例" },
    ],
    role: { en: "AI Engineer · extraction & review UI", zh: "AI 工程师 · 抽取与审核界面" },
    year: "2024",
    category: "ai",
    stack: ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "AWS", "Docker"],
    links: { github: "https://github.com/DingxinTao0417" },
    hue: 28,
    motif: "stack",
    metrics: [
      { value: "82%", label: { en: "straight-through", zh: "直通处理率" } },
      { value: "98%+", label: { en: "field accuracy", zh: "字段准确率" } },
    ],
  },
  {
    slug: "tdx-portfolio",
    index: "06",
    title: { en: "This Portfolio", zh: "本作品集网站" },
    tagline: {
      en: "Bilingual, multi-page Next.js 16 site with WebGL scenes, MDX blog and typed API routes.",
      zh: "中英双语、多页面的 Next.js 16 网站，含 WebGL 场景、MDX 博客与类型化 API 路由。",
    },
    description: {
      en: "The site you're reading. React Server Components for content, React Three Fiber for the 3D hero and skill sphere, Motion for choreography, and Next.js route handlers as the backend for contact, GitHub data and OG images.",
      zh: "你正在浏览的这个网站。内容层使用 React Server Components，3D 首屏与技能球体使用 React Three Fiber，动效编排使用 Motion，联系表单、GitHub 数据与 OG 图片则由 Next.js 路由处理器提供后端支持。",
    },
    problem: {
      en: "Most portfolios are either a static template or a single scrolling page. I wanted a real multi-page app with a backend, bilingual routing and a distinctive visual identity.",
      zh: "大多数作品集要么是静态模板，要么是单页滚动。我想要一个真正的多页面应用：有后端、有双语路由、有独特的视觉识别。",
    },
    approach: {
      en: "next-intl with `[locale]` routing, next-themes for light/dark, Tailwind v4 design tokens, dynamic-imported R3F scenes with reduced-motion fallbacks, and MDX rendered on the server with Shiki.",
      zh: "next-intl 的 `[locale]` 路由、next-themes 亮暗切换、Tailwind v4 设计令牌、按需动态加载并支持减少动效回退的 R3F 场景，以及服务端渲染的 MDX（Shiki 高亮）。",
    },
    impact: {
      en: "Statically rendered pages, streaming where data is live, and a Lighthouse-friendly 3D experience on both desktop and mobile.",
      zh: "静态渲染的页面、在实时数据处使用流式输出，以及在桌面与移动端都对 Lighthouse 友好的 3D 体验。",
    },
    highlights: [
      { en: "Locale-prefixed routing with static generation for both languages", zh: "带语言前缀的路由，两种语言均静态生成" },
      { en: "R3F hero reacts to pointer and theme in real time", zh: "R3F 首屏实时响应指针与主题切换" },
      { en: "Rate-limited contact API with optional Resend delivery", zh: "带限流的联系 API，可选 Resend 邮件投递" },
    ],
    role: { en: "Design & engineering", zh: "设计与开发" },
    year: "2026",
    category: "fullstack",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "Motion", "MDX", "Vercel"],
    links: { github: "https://github.com/DingxinTao0417/tdx-portfolio" },
    hue: 20,
    motif: "prism",
    metrics: [
      { value: "2", label: { en: "languages", zh: "种语言" } },
      { value: "6", label: { en: "pages + API", zh: "页面 + API" } },
    ],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProject(slug: string) {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return undefined;
  return projects[(idx + 1) % projects.length];
}
