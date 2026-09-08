import type { Localized } from "./types";

export type SkillLevel = "expert" | "advanced" | "proficient" | "familiar";

export type Skill = {
  name: string;
  /** Key into the simple-icons registry (see lib/icons.ts). */
  icon?: string;
  level: SkillLevel;
};

export type SkillCategory = {
  id: string;
  title: Localized;
  blurb: Localized;
  skills: Skill[];
};

export const levelValue: Record<SkillLevel, number> = {
  expert: 0.95,
  advanced: 0.8,
  proficient: 0.62,
  familiar: 0.42,
};

export const skillCategories: SkillCategory[] = [
  {
    id: "ai",
    title: { en: "AI Engineering", zh: "AI 工程" },
    blurb: {
      en: "I build RAG applications and agent workflows with model APIs.",
      zh: "把模型 API 接进应用，做 RAG 和智能体工作流。",
    },
    skills: [
      { name: "LangGraph", icon: "langgraph", level: "expert" },
      { name: "LangChain", icon: "langchain", level: "advanced" },
      { name: "RAG Systems", level: "expert" },
      { name: "Agentic Workflows", level: "expert" },
      { name: "OpenAI API", icon: "openai", level: "expert" },
      { name: "Anthropic API", icon: "anthropic", level: "advanced" },
      { name: "Gemini", icon: "googlegemini", level: "proficient" },
      { name: "PyTorch", icon: "pytorch", level: "proficient" },
      { name: "Hugging Face", icon: "huggingface", level: "advanced" },
      { name: "Fine-tuning", level: "proficient" },
      { name: "Ollama", icon: "ollama", level: "proficient" },
    ],
  },
  {
    id: "frontend",
    title: { en: "Frontend", zh: "前端" },
    blurb: {
      en: "I care about how a page looks and how it feels to use, including keyboard navigation.",
      zh: "页面好不好看、操作顺不顺手，我都在意。键盘能不能用也会留意。",
    },
    skills: [
      { name: "React", icon: "react", level: "expert" },
      { name: "Next.js", icon: "nextdotjs", level: "expert" },
      { name: "TypeScript", icon: "typescript", level: "expert" },
      { name: "Tailwind CSS", icon: "tailwindcss", level: "expert" },
      { name: "Three.js / R3F", icon: "threedotjs", level: "advanced" },
      { name: "Motion", icon: "framer", level: "advanced" },
      { name: "WebGL / Shaders", icon: "webgl", level: "proficient" },
      { name: "Vite", icon: "vite", level: "advanced" },
      { name: "Storybook", icon: "storybook", level: "proficient" },
      { name: "Playwright", level: "proficient" },
    ],
  },
  {
    id: "backend",
    title: { en: "Backend & APIs", zh: "后端与 API" },
    blurb: {
      en: "I work on APIs, databases and streaming responses. I prefer a structure that is easy to change.",
      zh: "处理接口和数据库，也会做流式响应。我偏好方便后续修改的结构。",
    },
    skills: [
      { name: "Node.js", icon: "nodedotjs", level: "expert" },
      { name: "Python", icon: "python", level: "expert" },
      { name: "FastAPI", icon: "fastapi", level: "expert" },
      { name: "PostgreSQL", icon: "postgresql", level: "advanced" },
      { name: "Redis", icon: "redis", level: "advanced" },
      { name: "Prisma", icon: "prisma", level: "advanced" },
      { name: "Drizzle", icon: "drizzle", level: "proficient" },
      { name: "GraphQL", icon: "graphql", level: "proficient" },
      { name: "tRPC", icon: "trpc", level: "proficient" },
      { name: "Zod", icon: "zod", level: "expert" },
      { name: "Supabase", icon: "supabase", level: "advanced" },
    ],
  },
  {
    id: "data",
    title: { en: "Data & Analytics", zh: "数据与分析" },
    blurb: {
      en: "I study analytics at USC and use SQL and Python to work with data.",
      zh: "在 USC 读分析学，也在做项目时用 SQL 和 Python 处理数据。",
    },
    skills: [
      { name: "SQL", icon: "postgresql", level: "expert" },
      { name: "pandas", icon: "pandas", level: "advanced" },
      { name: "NumPy", icon: "numpy", level: "advanced" },
      { name: "scikit-learn", icon: "scikitlearn", level: "advanced" },
      { name: "dbt", level: "proficient" },
      { name: "Apache Spark", icon: "apachespark", level: "proficient" },
      { name: "Airflow", icon: "apacheairflow", level: "proficient" },
      { name: "DuckDB", icon: "duckdb", level: "proficient" },
      { name: "Plotly", icon: "plotly", level: "advanced" },
      { name: "Tableau", level: "proficient" },
      { name: "Jupyter", icon: "jupyter", level: "expert" },
      { name: "R", icon: "r", level: "familiar" },
    ],
  },
  {
    id: "cloud",
    title: { en: "Cloud & DevOps", zh: "云与 DevOps" },
    blurb: {
      en: "Deployment includes the less visible work: configuration, logs and keeping services running.",
      zh: "把应用部署起来，再处理配置、日志和运行中的问题。",
    },
    skills: [
      { name: "AWS", level: "advanced" },
      { name: "Google Cloud", icon: "googlecloud", level: "proficient" },
      { name: "Vercel", icon: "vercel", level: "expert" },
      { name: "Docker", icon: "docker", level: "advanced" },
      { name: "Kubernetes", icon: "kubernetes", level: "proficient" },
      { name: "GitHub Actions", icon: "githubactions", level: "advanced" },
      { name: "Terraform", icon: "terraform", level: "proficient" },
      { name: "Cloudflare", icon: "cloudflare", level: "proficient" },
      { name: "Linux", icon: "linux", level: "advanced" },
      { name: "OpenTelemetry", level: "advanced" },
      { name: "Grafana", icon: "grafana", level: "proficient" },
      { name: "Sentry", icon: "sentry", level: "advanced" },
    ],
  },
  {
    id: "fde",
    title: { en: "Forward Deployed", zh: "前沿部署" },
    blurb: {
      en: "I start by clarifying the need, then discuss the approach and how it connects to existing systems.",
      zh: "先把需求问清楚，再讨论方案和怎么接入现有系统。",
    },
    skills: [
      { name: "Customer Discovery", level: "advanced" },
      { name: "Solution Architecture", level: "advanced" },
      { name: "Systems Integration", level: "expert" },
      { name: "Security Reviews", level: "proficient" },
      { name: "Technical Writing", level: "advanced" },
      { name: "Stakeholder Comms", level: "advanced" },
      { name: "Bilingual EN / 中文", level: "expert" },
      { name: "Enablement & Training", level: "advanced" },
    ],
  },
];

/** Flattened list for the 3D sphere: unique names, weighted by level. */
export const sphereSkills = Array.from(
  new Map(
    skillCategories
      .flatMap((c) => c.skills.map((s) => ({ ...s, category: c.id })))
      .map((s) => [s.name, s] as const),
  ).values(),
);

export const toolbelt: { name: string; icon?: string; note: Localized }[] = [
  { name: "Cursor", note: { en: "Editor", zh: "编辑器" } },
  { name: "TypeScript", icon: "typescript", note: { en: "Default language", zh: "默认语言" } },
  { name: "Next.js", icon: "nextdotjs", note: { en: "Web framework", zh: "Web 框架" } },
  { name: "FastAPI", icon: "fastapi", note: { en: "Python services", zh: "Python 服务" } },
  { name: "PostgreSQL", icon: "postgresql", note: { en: "System of record", zh: "主数据库" } },
  { name: "LangGraph", icon: "langgraph", note: { en: "Agent runtime", zh: "智能体运行时" } },
  { name: "Docker", icon: "docker", note: { en: "Packaging", zh: "打包与交付" } },
  { name: "Vercel", icon: "vercel", note: { en: "Deploy target", zh: "部署平台" } },
  { name: "Linear", icon: "linear", note: { en: "Planning", zh: "项目规划" } },
  { name: "Figma", icon: "figma", note: { en: "Design", zh: "设计" } },
];
