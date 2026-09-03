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
      en: "Retrieval, agents, evals and the plumbing that keeps them honest in production.",
      zh: "检索、智能体、评测，以及让它们在生产环境中保持诚实的底层管线。",
    },
    skills: [
      { name: "LangGraph", icon: "langgraph", level: "expert" },
      { name: "LangChain", icon: "langchain", level: "advanced" },
      { name: "RAG Systems", level: "expert" },
      { name: "Agentic Workflows", level: "expert" },
      { name: "LLM Evals", level: "advanced" },
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
      en: "Interfaces that feel fast, look considered and stay accessible.",
      zh: "快、讲究、且始终无障碍的界面。",
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
      en: "Typed contracts, streaming responses, and data models that age well.",
      zh: "类型化契约、流式响应，以及经得起时间考验的数据模型。",
    },
    skills: [
      { name: "Node.js", icon: "nodedotjs", level: "expert" },
      { name: "Python", icon: "python", level: "expert" },
      { name: "FastAPI", icon: "fastapi", level: "expert" },
      { name: "PostgreSQL", icon: "postgresql", level: "advanced" },
      { name: "pgvector", level: "advanced" },
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
      en: "From event contracts to forecasts — the analytics side of my USC degree, applied.",
      zh: "从事件契约到预测——把 USC 分析学所学用到实处。",
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
      en: "Shipping into customer environments means being comfortable in all of them.",
      zh: "部署到客户环境里，意味着要熟悉每一种环境。",
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
      en: "The non-code half of the job: discovery, integration, enablement and trust.",
      zh: "这份工作里非代码的另一半：需求发现、系统集成、客户赋能与信任。",
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
