# 首页粒子系统 · 2026-09-25

## 概览

- 首页粒子从“着色器插值”升级为 GPU 物理模拟：每个粒子有位置、速度和惯性，受弹簧、curl 噪声流场、阻尼、指针力场与冲击波共同作用。
- 轮播顺序保持 `神经网络 → 数据库 → 层叠`（着色器 ID 2 → 1 → 3）。TDX 字母（ID 0）仍然保留编号，但不参与播放；没有星球、光环，也没有画布下方的大标签。
- 颜色只使用现有主题色：`palette.ts` 中的点色、`accentStrong`、`amber`，以及包装组件传入的强调色（浅色 `#c94720`、暗色 `#ee805a`）。浅色主题用正常混合与墨色粒子；暗色主题用叠加混合，让密集处自然发光。
- 桌面 65,536 个粒子（256²），手机、粗指针、低核心或低内存设备 14,400 个（120²），挂载时决定一次。DPR 仍在挂载时固定，上限 1.5。

## 文件结构

- `hero-shapes.ts`：形状注册表。每个形状包含 `id`、`key`（`Home.particles.*` 文案键）、`effect`（专属着色效果）、`motion`（静止时的摆动/起伏/呼吸）和 `build(count)`。同时负责把需要播放的形状打包成浮点纹理图集。
- `hero-network.ts`、`hero-database.ts`、`hero-lattice.ts`、`hero-monogram.ts`：各形状的几何生成，数据库与网络几何未改。`hero-math.ts` 提供确定性哈希与 Hilbert 曲线排序。
- `hero-sampler.ts`：通用采样器，把文字、SVG 或图片（经离屏 2D canvas）转成带轻微厚度的粒子目标。
- `hero-cycle.ts`：确定性状态机。播放节奏、点击排队、离屏冻结与减少动效沿用原逻辑；新增首次入场状态机与 HUD 进度函数。
- `hero-simulation.ts`：GPGPU 模拟。两张乒乓 MRT 浮点渲染目标（位置 + 交互热度、速度），每帧一次全屏 pass 完成半隐式欧拉积分；挂载时自检。
- `hero-shaders.ts`：全部 GLSL 与调参常量 `HERO_TUNING`。模拟、渲染和无状态降级共用同一套“引导位置”函数，编舞在所有路径上一致。
- `hero-engine.ts`：不依赖 React 的引擎类，持有全部 GPU 资源与每帧逻辑（入场、轮播、拖拽、悬停、指针、冲击波、滚动、遥测）。每帧不分配对象。
- `hero-scene.tsx`：薄 React 层，负责画质选择、异步构建、滚动监听、`useFrame` 驱动与卸载释放。
- `hero-interaction.ts`：指针输入类型、遥测类型、拖拽惯性与滚动分散的纯函数。

## 动效编排

- 入场：首次进入视口时，粒子从一团宽阔的景深尘埃中旋转内爆，由外向内依次归位，约 2.5 秒；落定瞬间发出一圈轻冲击波。包装组件可传 `holdEntrance` 让粒子停在尘埃状态，等站点开场动画结束再释放。
- 形状切换：粒子按空间扫掠顺序依次离开（自动播放沿一个方向扫过；点击时从点击处径向扩散），在 curl 噪声流里成群飞行，最后以轻微过冲落位。约 2.8% 的粒子作为火花，在飞行中拖出强调色/琥珀色细尾。形变窗口 3.0 秒，停留 6.4 秒。
- 指针（仅鼠标/触控笔）：光标附近的粒子被推开并旋转，离开后带着阻尼回弹，形成尾迹；光标下有柔和的强调色光晕。悬停网络节点时保留原有的节点高亮与信号传播，且力场减弱到 35%，节点保持可读。
- 点击 / Enter：从指针（键盘为中心）扩散一圈冲击波，把粒子向外推开，同时切换形状；形变中的点击仍只排队一次。
- 拖拽（仅鼠标）：拖动旋转模型，松手后带惯性并阻尼回到自动姿态。移动超过 8px 不触发切换；超出角度后逐渐变硬（形状只为正面视角烘焙，过大角度会露出被剔除的背面）。触摸保持原生纵向滚动，不拖拽。
- 滚动：模型中心越过视口 40% 高度后，粒子随滚动逐渐散成漂浮的景深尘埃，只保留约 42% 的可见粒子；滚回时重新聚合。滚动进度由被动 scroll 监听写入 ref，每帧平滑，不触发 React 渲染。
- 渲染：柔和圆点精灵，按深度控制大小与柔焦（近远处成为散景）；深度雾、轻微闪烁；暗色主题中强调色与火花粒子带低成本光晕。没有使用后期 Bloom：UnrealBloom 需要多次全屏模糊 pass，在浅色主题上会发灰，叠加混合下的光晕精灵已达到相近效果。

## 降级与稳健性

- 能力检测：需要 WebGL2、至少 6 个顶点纹理单元、MRT，以及 `EXT_color_buffer_float`（首选 Float32）或 `EXT_color_buffer_half_float`（Half Float）。软件渲染器直接降级并使用小画质。
- 自检：模拟着色器链接失败、帧缓冲不完整或读回数值异常时，丢弃模拟，改用无状态着色器路径（同一编舞，按解析公式计算，指针与冲击波改为位移）。粒子着色器本身失败时抛给包装组件的 `SceneBoundary`，显示原有图标降级。检测期间屏蔽 three 的着色器错误日志，不刷控制台。
- 减少动效：不跑模拟、流场、指针力场、滚动分散和冲击波，显示清晰的静态数据库；手动切换立即生效。
- 暂停、离屏与后台标签：`frameloop` 改为按需渲染，状态机、入场与模拟时间全部冻结；恢复后的第一帧不计时间，没有跳变。单帧最多计 0.05 秒，物理步长最多 1/30 秒。
- WebGL 上下文恢复后重新播种模拟纹理。卸载时释放全部渲染目标、纹理、几何体与材质。形状图集按粒子数缓存在模块内（桌面约 7.8 MB 内存），返回首页时不再重算。

## 对外接口

- `HeroScene` 原有属性不变：`palette`、`reduced`、`active`、`nextRequest`、`interaction`、`onInvalidateReady`、`onPhaseChange`、`fallback`。`onPhaseChange` 仍报告着色器 ID（1 数据库、2 网络、3 层叠），入场期间报告即将出现的网络（2）。
- 新增可选属性：
  - `holdEntrance?: boolean`：为 true 时粒子停在漂浮尘埃状态，变为 false 后开始内爆。默认 false，单独使用即自动入场。
  - `telemetry?: RefObject<HeroTelemetry | null>`：每个渲染帧写入 `{ phase, morphProgress, holdProgress, particleCount, fps, pointer: { x, y, inside }, mode, entrance, scatter, running }`。`mode` 为 `gpgpu`、`shader` 或 `static`。暂停时写入一次 `running: false, fps: 0`。HUD 应在自己的 rAF 中读取，不要用 React state 同步。
- `HeroInteraction` 新增可选字段（向后兼容）：`dragging`、`dragX`/`dragY`（未消费的拖拽量，场景读取后清零）、`clickX`/`clickY`（切换请求的起点，键盘为 0,0）。未提供时，拖拽不生效，冲击波从悬停指针或中心发出。

## 调参

- 节奏在 `hero-cycle.ts`：`HOLD`（停留）、`RELEASE_ORDER_SPAN` 与 `RELEASE_JITTER`（出发扫掠与抖动）、`FLIGHT_DURATION`（单个粒子飞行）、`SETTLE_DURATION`（落位余量）；`MORPH_DURATION` 由它们相加得到。入场同理：`ENTRANCE_ORDER_SPAN`、`ENTRANCE_JITTER`、`ENTRANCE_FLIGHT`。
- 物理与画面在 `hero-shaders.ts` 的 `HERO_TUNING`：
  - 弹簧：`restStiffness`/`restDamping`（静止时的锐利度与回弹），`looseStiffness`/`looseDamping`（飞行中），`landingStiffness`/`landingDamping` 与 `lockAt`（落位阶段）。
  - 流场：`restFlow`、`looseFlow`、`flowScale`、`flowSpeed`、`maxSpeed`。
  - 指针：`pointerRadius`、`pointerPush`、`pointerSwirl`、`pointerStir`；冲击波：`shockSpeed`、`shockWidth`、`shockLife`、`shockPush`、`shockLift`；`heatDecay` 控制受扰粒子的余热。
  - 画面：`sparkFraction`、`streakTime`、`streakMax`、`focus`、`dofRange`、`dofGain`、`bokehSize`、`dustKeep`、`dustAlpha`、`maxPointSize`。
- 粒子数在 `hero-scene.tsx` 的 `HIGH_SIDE`（256）与 `LOW_SIDE`（120）；粒子数等于边长平方。点径随画布宽度与粒子数自动换算，改数量不需要另调点径。

## 新增形状（例如社区 Logo）

1. 在 `hero-shapes.ts` 的 `HERO_SHAPES` 中追加定义，或在启动代码里调用 `registerHeroShape`。ID 一经使用不再更改；0–3 已占用。
2. `build(count)` 必须返回恰好 `count` 个粒子：`positions`（xyz）与 `styles`（强调色 0–1、不透明度、点径倍数）必填；`groups`、`details` 可选。模型坐标宽约 ±2.3、高约 ±1.8。用 `hero-math.ts` 的 `localityOrder` 与 `reorder` 排序，形变才会成束流动。
3. 文字或 Logo 可以直接用采样器：

   ```ts
   import { defineSampledShape, loadImageMask, rasterizeText } from "./hero-sampler";
   import { registerHeroShape } from "./hero-shapes";

   // 文字：字体串里不能写 CSS 变量，先取出实际字体族，并等字体加载完成，否则会采到后备字体。
   const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif";
   const font = `700 160px ${family}`;
   await document.fonts.load(font);
   const mask = rasterizeText("TDX Lab", { font });
   // 或 SVG/PNG：const mask = await loadImageMask("/community-logo.svg", 360);
   registerHeroShape(defineSampledShape({
     id: 4, key: "community", mask,
     sample: { width: 3.6, height: 2.2, depth: 0.16, edgeWeight: 1.5, accent: "color" },
   }));
   ```

   `accent: "color"` 会把源图中饱和的颜色映射为主题强调色，其余为主题中性色，不引入新色相。
4. 需要自动播放时，把 ID 加入 `hero-cycle.ts` 的 `PLAYBACK_ORDER`，在 `src/messages/zh.json` 与 `en.json` 的 `Home.particles` 下加同名文案，并把 `hero-canvas.tsx` 的 `phaseNames` 扩到新 ID。仅注册而不加入播放顺序时，形状不会上传到 GPU，也不会出现。
5. 模拟与渲染不需要改动。只有需要像数据库扫描线、网络信号那样的专属动态效果时，才在 `hero-shaders.ts` 的 `appearance()` 中新增一个 `effect` 分支。异步字体或图片请在挂载 `HeroScene` 前准备好；图集按挂载时的播放列表构建一次。

## 验证记录

- `node --test tests/*.test.mjs`：122 项，121 通过，1 项既有的在线 GitHub 测试跳过。`hero-cycle.test.mjs` 中 9 项因仍期待已移除的 TDX 阶段而失败的旧断言，已按当前播放顺序更新；新增注册表、图集、Hilbert 排序、采样器、拖拽、滚动分散、入场与 20,000 帧混合事件测试。
- `npx tsc --noEmit --incremental false` 与 `npx eslint src/components/three tests` 无错误。
- 浏览器（Intel UHD 770 核显，DPR 1.5，1366×860）实测 GPU 时间（timer query）：65,536 粒子静止 1.3–1.5 ms，形变 1.3 ms，尘埃 1.2 ms，入场 1.3 ms，指针 1.7 ms，指针加冲击波约 2.2 ms（p95 约 3 ms）；CPU 每帧约 0.03–0.05 ms。形状图集构建约 160 ms，拆成三个任务执行。
- 实际检查浅色与暗色、1366×860 桌面与 390×844 手机、入场、三种形变、悬停、节点高亮、拖拽惯性、超过 8px 不切换、点击与触摸冲击波、滚动分散与聚合、离屏停止渲染与无跳变恢复、减少动效静态数据库与即时切换、无状态降级路径，以及强制初始化失败时的图标降级。控制台只有既有的 `THREE.Clock` 弃用提示。
- 未在实体手机与低端设备上测帧率；低画质档位按粒子数和点径推算。
