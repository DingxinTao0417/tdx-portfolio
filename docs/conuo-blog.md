# Conuo 博客交付记录

核对日期：2026-09-15。仅本地内容与网站实现，未提交、推送或部署。

## 内容依据与边界

- 项目来源：`D:/workspace/conuo` 当前工作树。README、`docs/IMPLEMENTATION_STATUS.md`、`docs/WEB_CLOUD_STORAGE.md`、`docs/REGION_STUDY.md`、文件版本与问答范围记录为依据；未修改 Conuo 源码、运行新的模型请求或操作其云端资料。
- 当前 Web 的正式存储以最新云端存储策略为准：必须登录，数据库与私有文件存储为正式存储，浏览器编辑和未应用的审核修改只是临时内存。未沿用旧版 IndexedDB 日常存储或离线能力的描述。
- 阅读示例与真实截图使用自编的导数、割线和切线 QA 资料，不包含真实用户学习内容。示例数值可在该测试材料中核对，不描述为模型普遍准确率证据。
- 引用身份校验不等于语义正确性；AI 生成草稿、用户接受内容、流式预览与云端确认分开说明。
- 区域视觉学习是显式发送当前 PDF 局部截图的一次性请求，不是整页 OCR、全扫描文档检索或永久区域学习档案。
- 私有仓库、未公开部署及真实全链路待验收状态保留；不添加不可访问的源码或演示链接，不写未经测量的效率数字。
- humanizer 检查用于避免宣传式表达、夸大收益和虚构个人经历。

## 页面与内链

- 中文：`content/blog/zh/conuo.mdx`，网址 `/blog/conuo`。
- 英文：`content/blog/en/conuo.mdx`，网址 `/en/blog/conuo`。
- 两篇文章链接对应语言的 Conuo 项目页、结构化任务说明和上下文与验证文章。
- Conuo 项目页、结构化任务说明和上下文与验证文章补充回链。
- 沿用现有自动内容发现、博客搜索、排序、分页和首页最新文章机制，不另建目录或路由。

## 图片与 Logo

- 内置 image_gen 生成一张无文字封面，以及中英文独立流程图；后按用户要求加入 **Conuo 产品自身的紫色 Logo**，不使用个人网站的桃子猫头像，不改动 DSH 配图。
- Logo 来源为 Conuo 工作台实际使用的 `apps/web/public/conuo-logo.png`。字节相同的工作区副本为 `public/projects/conuo-logo.png`；SHA-256 见图片清单。
- 网站使用 `conuo-cover-v2.webp` 和 `conuo-workflow-{zh,en}-v2.webp`。原无 Logo 的三张 WebP 保留作回滚素材，不删除原始生成产物。
- 封面共用，中英文流程图分别使用本语言标签。已人工核对 Logo 形状、颜色、箭头方向、文字和人工审核步骤。
- 两张真实截图只重新编码为 WebP，没有翻译或伪造界面；英文图注明确界面仍为中文。
- 最终素材均已进入 `public/images/blog`。原始生成路径、每轮完整提示词、Logo 来源和导入参数见 `docs/conuo-blog-visual-assets.json`。
- 重新导入命令：`node scripts/import-blog-art.mjs <generatedSourceDirectory> docs/conuo-blog-visual-assets.json`。

## 验证与运行

- 初次完整内容与语言回归：21 项通过；TypeScript、相关文件 ESLint 与差异检查通过。
- 浏览器已核对中英文正文、各自流程图、两张真实截图、英文项目页回链、博客最新排序和 Conuo 搜索结果。
- 390 × 844 下，中英文页面均无页面级横向溢出，中文图片宽度 340 像素，位于正文范围内。临时 viewport 已复原，最终核对默认宽度 987 像素、页面宽度 977 像素。
- 后续脚本报错已定位为 `next-themes` 的主题初始化脚本，并非 JSON-LD。SSR 保留可执行类型，客户端标记为 `text/plain`；18 项回归、TypeScript 与相关 ESLint 通过，浏览器刷新、明暗切换及中英文导航无新增警告。
- 本地预览使用既有 `http://localhost:3001` 服务，保留运行。未干扰其他项目占用的 3000 端口。
- Logo 更新后，6 项内容测试通过，涵盖图片尺寸、文件存在与双语 MDX 编译；浏览器已确认新版封面和中英文流程图正常加载，英文流程图截图可见 Conuo 产品 Logo。
