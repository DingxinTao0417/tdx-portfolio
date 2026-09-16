import course from "../../content/courses/fde/course.json";

export const fdeCourse = course;
export const fdeModules = course.modules;
export const fdeLessons = fdeModules.flatMap((module) =>
  module.lessons.map((lesson) => ({
    ...lesson,
    slug: lesson.content_path.replace("lessons/", "").replace(".md", ""),
    moduleId: module.id,
    moduleTitle: module.title,
    moduleOrder: module.order,
  })),
);
export type FdeLesson = (typeof fdeLessons)[number];

export function findFdeLesson(slug: string) {
  return fdeLessons.find((lesson) => lesson.slug === slug);
}

export const fdeCopy = {
  zh: {
    learning: "学习", title: "FDE 实战", subtitle: "把 AI 应用交付给客户",
    intro: "从理解业务需求开始，练习系统集成、知识检索、可靠执行和交接。用同一个模拟项目，把每个环节连接起来。",
    start: "从第 1 课开始", directory: "课程目录", open: "查看课程", overview: "课程介绍", allCourses: "全部课程",
    free: "免费阅读 · 无需登录", edition: "讲义 v0.1", contentLanguage: "中文讲义",
    languageNotice: "", lessons: "课节", objective: "道自测题", cases: "个模块案例",
    syllabus: "沿着交付过程学习", syllabusBody: "每课先读讲义，再做两道选择题。模块结束后，用案例练习检查自己的方案。",
    audience: "适合谁", audienceBody: "有 Python 或 TypeScript 基础，了解 HTTP 和 JSON，想把 AI 应用从演示推进到可验证交付的开发者。",
    project: "贯穿项目", projectBody: "为虚构服务企业设计员工知识与工单助手：按权限查制度、附上引用、收集报修字段，经用户确认后模拟建单，并核对最终状态。",
    boundary: "学习边界", boundaryBody: "本专题是个人编写的学习材料，不是官方培训或职业认证。使用合成资料与模拟接口，不连接真实客户系统。完整项目脚手架仍在整理。",
    read: "阅读", practice: "练习", review: "复盘",
    readBody: "概念、例子与操作步骤", practiceBody: "选择题、提示与答案解析", reviewBody: "对照案例评分清单检查产物",
    quiz: "本课自测", quizBody: "用于检查理解，可以反复练习。答案在浏览器中可见，不作为正式考试或专业能力认证。",
    single: "单选", multiple: "多选", exact: "多选题需选中全部正确选项，且不多选。",
    submit: "检查答案", hint: "看提示", explanation: "查看解析", reset: "重新作答",
    empty: "请先选择答案。", correct: "回答正确", incorrect: "这次还没有答对。可以先看提示，再试一次。",
    answer: "参考答案", caseTitle: "模块案例练习", caseBody: "先写下自己的方案，再对照参考思路自评。网站不自动判断开放题，也不接收你的项目文件。",
    caseDraft: "你的方案（仅本页暂存，离开或刷新后清空）", casePlaceholder: "写下任务边界、证据、执行步骤和异常处理。不要填写真实姓名、账号、密钥或客户数据。",
    showReference: "对照参考思路", rubric: "自评清单", critical: "出现以下问题，需要整改",
    caseScore: "自评", caseScoreNote: "勾选表示你认为已满足该项，不是系统审核结果。",
    marked: "已标记读完", mark: "标记本课读完", undo: "取消读完标记",
    progress: "本机学习记录", progressBody: "只保存在当前浏览器，不上传，不跨设备同步。阅读和自测分开记录。",
    readingProgress: "已读", quizProgress: "自测做对", clear: "清空本机记录", confirmClear: "确认清空", cancel: "取消",
    storageUnavailable: "浏览器未允许保存记录；未保存的更改仅在本次页面会话中有效，刷新后可能丢失。",
    previous: "上一课", next: "下一课", back: "返回课程", optional: "选修扩展",
    related: "结合项目阅读", enlarge: "打开原图", illustration: "教学示意图",
    homeEyebrow: "学习资源", homeTitle: "把方法拆成", homeAccent: "可以练习的课节。",
    homeBody: "FDE 实战学习专题：从需求、知识与工具，到评测和交接。每课有例子，也有可在线作答的自测。",
    moduleCase: "练习本模块案例", continue: "继续学习",
  },
  en: {
    learning: "Learn", title: "FDE practice", subtitle: "Delivering AI applications to customers",
    intro: "Work through discovery, system integration, retrieval, reliable execution and handoff. One fictional project connects the lessons.",
    start: "Start with lesson 1", directory: "Curriculum", open: "Explore the course", overview: "Course overview", allCourses: "All courses",
    free: "Free to read · No sign-in", edition: "Notes v0.1", contentLanguage: "Lessons in Chinese",
    languageNotice: "The lesson text and question bank are currently in Chinese. Navigation and explanatory illustrations are available in English.",
    lessons: "lessons", objective: "self-test questions", cases: "module cases",
    syllabus: "Follow the delivery process", syllabusBody: "Read a lesson and try its two questions. At the end of each module, review your design using a case exercise.",
    audience: "Who it is for", audienceBody: "Developers with basic Python or TypeScript, HTTP and JSON knowledge who want to move beyond a demo to verifiable delivery.",
    project: "The course project", projectBody: "Design an employee knowledge and ticket assistant for a fictional company: authorized retrieval, citations, field collection, human confirmation, mock creation and verified state.",
    boundary: "Scope", boundaryBody: "Independent learning material, not official training or professional certification. Exercises use synthetic data and mock services. A complete project scaffold is still being prepared.",
    read: "Read", practice: "Practice", review: "Review",
    readBody: "Concepts, examples and steps", practiceBody: "Questions, hints and explanations", reviewBody: "Check your artifacts against a case rubric",
    quiz: "Lesson self-test", quizBody: "You can retry. Answers are visible in the browser. This is a learning exercise, not a secure exam or certification.",
    single: "Single choice", multiple: "Multiple choice", exact: "Select every correct option and no incorrect ones.",
    submit: "Check answer", hint: "Show hint", explanation: "Show explanation", reset: "Try again",
    empty: "Choose an answer first.", correct: "Correct", incorrect: "Not quite. Try the hint, then check your answer again.",
    answer: "Reference answer", caseTitle: "Module case exercise", caseBody: "Write your design before reviewing the reference. Open responses are self-assessed, not automatically graded or uploaded.",
    caseDraft: "Your design (this page only; cleared on navigation or refresh)", casePlaceholder: "Describe scope, evidence, steps and failure handling. Do not enter real names, credentials or customer data.",
    showReference: "Review the reference", rubric: "Self-assessment checklist", critical: "These issues require correction",
    caseScore: "Self-assessment", caseScoreNote: "A checked item records your judgment, not an automated review.",
    marked: "Marked as read", mark: "Mark lesson as read", undo: "Unmark as read",
    progress: "This browser's learning record", progressBody: "Stored only in this browser, not uploaded or synced. Reading and self-tests are recorded separately.",
    readingProgress: "Read", quizProgress: "Questions answered correctly", clear: "Clear local record", confirmClear: "Confirm clear", cancel: "Cancel",
    storageUnavailable: "This browser did not allow saving. Unsaved changes last for this page session and may be lost on refresh.",
    previous: "Previous lesson", next: "Next lesson", back: "Back to course", optional: "Optional extension",
    related: "Related projects and reading", enlarge: "Open full image", illustration: "Teaching illustration",
    homeEyebrow: "Learning resources", homeTitle: "Methods you can", homeAccent: "put into practice.",
    homeBody: "FDE practice: discovery, knowledge, tools, evaluation and handoff. Each lesson includes examples and an interactive self-test.",
    moduleCase: "Try the module case", continue: "Continue learning",
  },
} as const;

export function getFdeCopy(locale: string) {
  return fdeCopy[locale === "en" ? "en" : "zh"];
}

export const fdeModuleOutputs = [
  "项目卡与架构选择",
  "访谈记录、基线与方案画布",
  "架构图、权限矩阵与接口契约",
  "资料清单、引用规则与更新记录",
  "工单流程、异常路径与固定测试",
  "工具边界与受控协作设计",
  "评测集、错误分析与改动对比",
  "运行清单、模拟发布与交接包",
];
