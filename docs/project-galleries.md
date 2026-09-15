# 项目截图与内容依据

## 截图轮播

项目数据在 `src/data/projects.ts`，`cover` 仍用于项目卡片；详情页把封面与 `gallery` 合并后传给 `ProjectGallery`。单张截图项目保留原来的静态图片样式。

- MultiMix：原有新建项目界面，加上用户提供的对话创作、图片库和文案库截图，共 4 张。保留对话截图中的失败状态，没有将其改成成功结果。
- opc-workspace：使用用户提供的 2026-09-09 今日工作台截图替换原封面，再加入新建任务、AI 任务助手和任务列表，共 4 张。原有封面文件保留在仓库中，未删除或改写。
- Omnigate：使用用户提供的控制台概览替换原封面，再加入服务状态、公开首页和 AI 使用心得，共 4 张。原有封面文件保留在仓库中，未删除或改写。
- As-a：用户提供的首页、服务目录、服务详情、交付说明、服务商后台、消息与订单，共 6 张，均为 1920 × 911。
- 图片原样复制到 `public/projects/`，源文件与目标文件 SHA-256 一致，没有改动或删除用户原图。
- 手动轮播，不自动打断阅读。支持按钮、缩略图、方向键、Home / End、原生横向滑动和原图链接。保留带修饰键的浏览器快捷键；系统减少动效时直接切换。
- 主图完整缩放，使用统一画框比例、小圆角和内边距。手机上的 6 张缩略图分为两排，4 张保持一排。
- 首页和列表按项目数量排版：偶数时两列等宽，奇数时首张通栏；手机单列。

## As-a 的说明依据

2026-09-09 只读检查了 `D:/workspace/As-a`，Git remote 为用户指定的 `https://github.com/DingxinTao0417/As-a.git`。本地提交为 `8b5cf22`。GitHub CLI 查询确认仓库为私有，详情链接因此标注为私有仓库。未修改源项目、远端可见性或在线环境。

| 内容 | 仓库依据 |
| --- | --- |
| 专业服务平台、阿拉伯语与英语、入驻及管理流程 | `README.md`、`app/services/`、`app/my-services/`、`app/admin/` |
| RTL / LTR 切换 | `components/language-provider.tsx` 的文档方向设置 |
| Next.js、TypeScript、Supabase、测试工具 | `package.json`、`lib/supabase/` |
| 消息与订单实时订阅 | `app/messages/page.tsx` 的 Supabase `postgres_changes` 订阅 |
| 会话订单、直接下单、交付与确认、服务端支付回查 | `app/actions/orders.ts` |
| 支付重复处理与事务保护 | `supabase/migrations/20260908020000_payment_transactions.sql`、`tests/payments/` |
| 权限与管理员记录 | `supabase/migrations/20260908010000_security.sql`、`20260908030000_admin_transactions.sql`、`app/actions/admin.ts` |
| 测试与当前验收边界 | `docs/readiness.md`、`docs/functional-review.md` |
| 截图中演示目录、评分与认证展示的边界 | `docs/demo-data.md`、`docs/functional-review.md` |

详情使用用户指定名称 **As-a**，截图中的 As'a / As'aa 为原项目界面名称。文案区分代码已实现、本地测试与正式交易验收；不把截图里的金额、评级和徽标当成真实营收、认证或交易成绩。不展示未经验证的用户规模、性能指标或上线承诺。

“我学到了什么”依据订单与权限代码撰写，侧重支付重复回调、服务端价格校验和角色权限。通过 humanizer 检查语气，使用具体实现描述，避免宣传性结论；不把可选 AI 客服和实验训练文件描述为已投入使用的核心能力。

这次只验证作品集，不重跑 As-a 的支付或云服务联调，也不操作其数据库。

## 作品集验证

- 完整 ESLint 和最终生产构建通过，构建生成 37 个页面；项目数据检查确认 4 个项目、4 个首页入口，全部截图文件存在且中英文标签完整。
- MultiMix 验证 4 张截图、缩略图、方向键与 Home / End、首尾循环、原图链接、中英文页面及 390px 布局。
- As-a 验证 6 张原图加载、缩略图切换、首尾循环、调整视口后保持当前截图、中英文文案和私有仓库标注；1440px 与 390px 布局没有横向溢出，控制台未见错误。
- 首页与项目列表均显示 4 张等宽卡片；全栈筛选显示 opc-workspace 和 As-a。
- 未测试实体手机触摸；横向手势使用浏览器原生滚动，桌面水平滚动已经检查。
- 临时浏览器验证标签页已关闭。开发服务保留在 3000 端口；修改仅在本地，未提交、推送或部署。

## 2026-09-15：Conuo 与 DSH Session Conductor

两项均接入现有项目数据，出现在首页精选、项目列表、中英文详情页和站点地图中。沿用现有完整图片展示与手动轮播。

### Conuo

- 内容依据：本地 `D:/workspace/conuo/README.md`、`docs/IMPLEMENTATION_STATUS.md`、`apps/web/package.json`，以及实际登录后的工作台。GitHub 查询确认仓库为私有且没有公开演示地址，因此不添加源码或在线演示按钮。
- 定位为开发中的 AI 学习工作台。介绍资料导入、PDF 阅读、原文问答、引用定位、知识页审核与云端保存；不把区域视觉称为 OCR，也不声称语义检索、生产调度或公开部署已完成。
- 本次通过浏览器采集 `127.0.0.1:3000` 的学习概览、PDF 阅读与已有问答、书封式资料库、已接受知识页。内容是项目已有的自编 QA 材料，没有新增模型请求或学习资料。
- 文件为 `public/projects/conuo-{overview,reader,library,knowledge}.jpg`，均为 1280 × 720。保留浏览器截图原始 JPEG 字节，不拼接、不改写内容。阅读器截图使用应用内 80% 缩放，采集后恢复 100%。

### DSH Session Conductor

- 内容依据：[公开仓库](https://github.com/DingxinTao0417/dsh-session-conductor) 的 `README.md`、`package.json`、`docs/IMPLEMENTATION.md`、`docs/ACCEPTANCE.md` 和 `src/service/completion-return.ts`。检查时版本为 0.1.6，本地提交为 `2b96b0d`。
- 定位为 DeepSeek Harness Desktop 原生多会话协调插件。区分创建任务、消息投递、轮次结束与成果验收；明确完整桌面验证尚未结束，没有 npm 发布。没有将规划性能指标、测试数量或截图中的状态用作生产可靠性指标。
- 图片原样复制自本地 `.verification/navigation-2026-09-15T10-01-35-586Z/parent-1.png` 与 `child-1.png`，目标为 `public/projects/dsh-session-conductor-{parent,child}.png`，均为 1200 × 820。
- 这两张是 v0.1.5 的真实本地验证界面，使用独立测试数据，展示创建卡片、历史读取与返回发起会话。图注不将它们当作 v0.1.6 首轮结果回传的实机验证证明。未使用已停用的管理面板截图。

### 本次验证与环境

- TypeScript 检查、项目数据文件 ESLint、5 项站点本地化测试和 `git diff --check` 通过。
- 浏览器确认首页精选、项目列表均有 6 个项目，两项新增详情可正常进入；中英文内容、6 张新增主图加载、缩略图与箭头切换、原图链接均已检查。
- 1280px 桌面与 390px 手机布局无页面横向溢出，手机轮播按钮与缩略图可用；未测试实体手机触摸。测试视口已恢复。
- 语言切换时可复现已有的 React 内联 script 告警；未改动的 MultiMix 详情也出现同一告警。项目详情 JSON-LD script 与本次之前的 HEAD 相同，未在本任务中修改。
- 网站预览保留在 `http://localhost:3001`。Conuo 的 3000 端口临时服务仅用于截图，采集结束后停止。不修改两个源项目的代码、不新增模型调用；作品集改动仅在本地，未提交、推送或部署。
