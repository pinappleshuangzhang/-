# 用规则驱动 AI 建站：从 0 到 1 实操教程

用 AI 写网站，最常见的失败不是「写不出代码」，而是「每次写出来的都不一样」：颜色、目录、动画库各写一套，项目变成几种风格的拼贴。

解决办法是**先写规则，再写代码**。把架构、令牌、性能、兼容写成 `.mdc`，AI 每次对话都会读取，相当于一份不会忘的项目手册。下面 9 份规则经过完整项目验证，全文可直接复制。技术栈以 Next.js App Router + TypeScript + Tailwind + GSAP 为例，思路可迁移。

## 一、规则文件怎么生效

**位置**：项目根目录 `.cursor/rules/`，每份一个 `.mdc`。

**格式**：

```
---
description: 这份规则管什么，一句话说清
alwaysApply: true
---

# 规则标题

- 具体条款一
- 具体条款二
```

- `alwaysApply: true`：每次对话都加载，适合架构、令牌、性能。
- `alwaysApply: false` + `globs: **/*.tsx`：只在相关文件时加载，规则多时省上下文。

**写规则的三个要点**：

1. 写「禁止什么」，不要写「建议什么」。「禁止 `any`」比「尽量用具体类型」有效。
2. 禁止的同时给出替代，例如「禁止动 width，尺寸变化用 `scale` 或 clip-path」。
3. 能自动化的不要只写在文档里。风格类约束同时配 ESLint。

## 二、三阶段总览

| 阶段 | 目标 | 本阶段落地的规则 |
| --- | --- | --- |
| 前期（开工前） | 打地基 | AI 工作流、项目架构、代码质量、设计令牌、响应式布局 |
| 中期（页面开发） | 按规范产出、边写边防坑 | GSAP + Lenis、性能、无障碍、浏览器兼容（降级预留） |
| 后期（收敛上线） | 多端、性能、验收 | 浏览器兼容（提测）、性能（内存收敛）、分辨率与无障碍验收 |

前期那五份必须在写第一行业务代码之前定好。最容易犯的错是把响应式推迟到「以后再说」，超宽屏上会大规模返工。

## 三、前期：开工前必须落地的五份规则

### 规则 1：AI 工作流（ai-workflow.mdc）

AI 两个典型毛病：不问就动手、改完不验证。这份规则把协作锁成「编码前—编码中—编码后」。

```
---
description: AI 工作流程规范（编码前分析、编码中约束、编码后验证）
alwaysApply: true
---

# AI 工作流程规范

## 编码前

1. 先分析现有代码结构和相关文件，理解上下文再动手。
2. 复杂任务先给出实现方案（涉及哪些文件、怎么拆分），再开始编码。
3. 重大架构变更（目录结构调整、核心依赖替换、Provider 层改动）必须先征得同意。

## 编码中

- 小范围修改：每次改动聚焦单一目标，不顺手重构无关代码。
- 未经同意不安装新依赖；需要新包时先说明用途和理由。
- 新建组件、hook、工具函数前，先检查 `components/`、`sections/`、`hooks/`、`lib/` 是否已有可复用实现。

## 编码后

- 运行 `npm run lint`，零错误。
- 运行 `npm run build`，构建通过（Google Fonts 网络超时导致的失败可重试一次）。
- 总结本次改动：列出变更的文件及各自改了什么。
- 每次大的修改完成并验证通过后，执行一次本地 git 提交，提交信息用简短中文描述本次改动（如「还原第二屏并抽取公共组件」）。
```

### 规则 2：项目架构（project-architecture.mdc）

没有目录约定时，AI 会把所有东西堆进 `page.tsx`。这份规则规定每种代码放哪、什么时候必须拆。

```
---
description: 项目架构与代码组织规范（目录职责、拆分规则）
alwaysApply: true
---

# 项目架构规范

框架：Next.js App Router，源码统一放在 `src/` 下。

## 目录职责

src/
  app/          # 路由与页面：page.tsx / layout.tsx，只做组合
  sections/     # 页面区块：首屏、档案列表等成块的页面内容
  components/   # 可复用组件
    ui/         # 通用 UI 组件（按钮、卡片、标签等）
    providers/  # 全局 Provider（如 SmoothScrollProvider）
  animations/   # 动画逻辑：GSAP 时间轴、ScrollTrigger 配置、动画工具
  hooks/        # 自定义 React hooks
  lib/          # 工具函数、常量、类型

## 组织规则

- `page.tsx` 只负责组合 sections，不写具体布局和动画逻辑，严禁巨型 page 文件。
- 页面区块放 `sections/`，一个区块一个文件。
- 动画逻辑（时间轴编排、ScrollTrigger 配置）抽离到 `animations/`，组件内只做绑定。
- 可复用 UI 放 `components/ui/`，不在 sections 里重复实现。
- 单个组件超过 250 行必须拆分。
- 导入一律使用 `@/` 别名（如 `@/sections/hero`），不用相对路径跨目录。
```

### 规则 3：代码质量（code-quality.mdc）

`any`、残留 `console.log`、未使用导入，单看都小，积累后代码库难维护。前四条必须由 ESLint 锁死：AI 遇到报错的第一反应往往是加 `eslint-disable`。

```
---
description: 代码质量规范（TypeScript 严格模式、命名、去重）
alwaysApply: true
---

# 代码质量规范

- TypeScript 严格模式（`tsconfig.json` 已开启 `strict: true`，不得关闭）。
- 禁止 `any`（含隐式 any）；类型未知时用 `unknown` 收窄。
- 禁止 `console.log`；调试代码提交前必须删除（`console.warn` / `console.error` 允许用于真实错误处理）。
- 禁止未使用的导入和变量。
- 提交前 `npm run lint` 必须零错误通过。
- 组件命名必须有意义、见名知义（如 `ArchiveCard`、`HeroIntro`），禁止 `Comp1`、`Test`、`Temp` 之类名称。
- 新建组件前先检查 `components/` 与 `sections/` 是否已有同功能实现，避免重复组件；相似度高的组件应抽象合并。

以上前四条已由 ESLint 强制（见 `eslint.config.mjs`），报错必须修复，不允许用 `eslint-disable` 绕过。
```

### 规则 4：设计令牌（design-tokens.mdc）

没有令牌时，AI 会写 `#3ECA57`、`gap-[13px]`、`text-[17px]`，和稿永远差一点点。核心是**把可用值收成有限几档**。色值与刻度换成你自己项目的设计系统。

```
---
description: 网站设计令牌（颜色、字体、字号、行高、间距、圆角）使用规范
alwaysApply: true
---

# 设计令牌规范

令牌源文件：`design/tokens/*.tokens.json`（Figma 变量导出，为唯一事实来源）。
CSS 变量定义在 `src/app/globals.css` 的 `@theme` 块中，样式一律使用令牌值，不要使用刻度外的任意值。

例外：桌面态尺寸需随视口等比缩放时，写成 `calc(var(--su) * N)`，其中 `N` 仍必须取自下列刻度——倍率只放大稿面尺寸，不新增刻度值。缩放机制见 `responsive-layout` 的「内容缩放」一节。

当前集合：`color`、`font-family`、`font-size`、`font-weight`、`line-height`、`radius`、`spacing`。

## 颜色（Color）

- Grey（中性灰）：`grey-50` ~ `grey-400` + `white`
  - 50 #F4F4F4 / 100 #DEDEDE / 200 #999999 / 300 #666666 / 400 #131313 / White #FFFFFF
- Tailwind 用法：`text-grey-300`、`bg-grey-400`、`border-grey-100` 等。
- 只使用以上色板，不使用 Tailwind 默认调色板或任意 hex 值。

## 字体（Typography）

- 字体族（FontFamily）：`Noto Serif SC`（中文衬线，主字体）、`Libre Bodoni`（西文衬线、标题/装饰）。
  - Tailwind：`font-serif-sc`、`font-bodoni`。
- 字号刻度（FontSize，px）：10 / 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 / 36 / 40 / 44 / 48 / 52 / 56 / 60 / 100。
  - Tailwind：`text-10` ~ `text-60`、`text-100`；桌面态随视口缩放时用 `text-[length:calc(var(--su)*N)]`。
- 行高刻度（LineHeight，px）：14 / 18 / 20 / 24 / 26 / 28 / 32 / 36 / 40 / 44 / 48 / 52 / 56 / 60 / 64 / 68，用 `leading-[Npx]` 或与字号配对；随视口缩放时用 `leading-[calc(var(--su)*N)]`。
- 字重（FontWeight）：Regular 400、Medium 500、SemiBold 600。
  - Noto Serif SC：仅 Light 300、Regular 400、Medium 500 三档，禁止 SemiBold / 其他字重。
  - Libre Bodoni：Regular 400、Medium 500、SemiBold 600 三档（如 `font-semibold`）。
  - 斜体不是字重：需要斜体时对 Libre Bodoni 用 CSS `italic`；Noto Serif SC 无斜体变体，不对中文使用 `italic`。

## 间距（Spacing）

扁平刻度，单位 px，用于 gap、padding、margin、段落间距：

0 / 2 / 4 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 28 / 32 / 36 / 40 / 44 / 48 / 52 / 56 / 60 / 64 / 68 / 72 / 76 / 80

Tailwind 默认 4px 基数刻度可直接映射（如 `gap-5` = 20px、`p-10` = 40px）；6px 用 `p-1.5`、10px 用 `p-2.5`。不使用刻度以外的间距值；桌面态随视口缩放时写 `gap-[calc(var(--su)*20)]` 这类形式，括号内仍取本刻度。

## 圆角（Radius）

- RS（小）：2 / 4 / 8 → `rounded-rs-2` / `rounded-rs-4` / `rounded-rs-8`
- RM（中）：12 / 16 / 20 → `rounded-rm-12` / `rounded-rm-16` / `rounded-rm-20`
- RL（大）：24 / 28 / 32 → `rounded-rl-24` / `rounded-rl-28` / `rounded-rl-32`

## 更新流程

设计令牌变更时：先替换 `design/tokens/` 下对应 JSON，再同步 `globals.css` 的 `@theme` 变量与本规则，保持三处一致。
```

### 规则 5：响应式布局（responsive-layout.mdc）

设计稿通常只给一个宽度（如 1440），用户屏幕从 1280 到 3840 都有。这份规则回答两件事：**框怎么变**（边距、栅格），**框里的内容怎么变**（字号、间距、元素尺寸）。

这是最容易被前期忽略、后期代价最大的一份。真实教训：首版把边距写成「所有分辨率固定 30px」，又没定内容缩放，2560 / 3440 上内容挤在中间、四周大片空白；边距后来整段推翻，缩放是后期临时补的，单日调倍率十余次。

**开工前对着最大目标分辨率想清楚：超宽屏上，内容是跟着放大，还是维持原尺寸留白？**

两套倍率不能并成一套：`--su` 封顶 1680（约 1.17 倍）够正文；大标题和主图要用 `--su-hero` 封顶 1920（约 1.33 倍）。不封顶的话 3840 上字号会到 2.67 倍。`--su-hero` 只给视觉主角，禁止蔓延到全站。

```
---
description: 响应式布局与测试规范（边距、栅格、内容缩放、测试分辨率）
alwaysApply: true
---

# 响应式布局规范

## 布局基线

- 页面四周边距随视口增宽：`--page-margin: clamp(20px, calc(100vw / 72), 40px)`（1440 及以下 20px，1920≈26.7px，2560≈35.6px，2880 起封顶 40px）。
- 边缘锚定的 UI（导航、语言切换、滚动提示、页角信息等）一律用 `var(--page-margin)` 定位，禁止写死 20px。
- 推荐容器写法：`width: calc(100% - var(--page-margin) * 2)`，居中；上下用 `top/bottom: var(--page-margin)`。
- CSS 变量定义见 `globals.css`。
- 正文内容块（段落、卡片栅格）如需限宽提升可读性，可另行设置 `max-width` 并居中，但不影响边缘 UI 的边距定位。
- 全屏媒体（背景图、视频）边到边铺满，不受页边距约束。

## 栅格系统

- 8 列栅格（Columns = 8）。
- 列间距（Gutter）：20px，恒定，不随分辨率变化。
- 版心宽度：`100% - 2 × var(--page-margin)`。
- 单列宽计算：`(版心宽度 - 7 × 20px) / 8`。
- 内容对齐优先落在列线或跨列；新增区块先按 8 列规划，再落到具体像素。

## 内容缩放（--su / --su-hero）

桌面设计稿基准 1440 宽。边距和栅格管的是「框」，框里的字号、行高、间距、元素尺寸由两个缩放倍率控制，定义见 `globals.css`：

--su:      calc(min(100vw, 1680px) / 1440);   /* 1680 封顶，最大约 1.17 倍 */
--su-hero: calc(min(100vw, 1920px) / 1440);   /* 1920 封顶，最大约 1.33 倍 */

### 适用范围

- `--su`（默认）：桌面态一切按稿面走的尺寸——正文与标签字号、行高、gap/padding、图标与方块尺寸、导航 tab 间距等。拿不准用哪个时一律用 `--su`。
- `--su-hero`（例外，仅视觉主角）：首屏大标题，以及主图媒体块。除此之外不得扩大 `--su-hero` 的使用面。
- 右列宽 507：导航右栏、联系页服务范围、组织记录铭牌、作品圆环行都以 `calc(var(--su-hero) * 507)` 推导左缘或宽度，保持全站右列同一条竖线。改动其中任何一处都要同步其余几处。

### 写法

- 稿面像素一律写成 `calc(var(--su) * N)`，其中 `N` 取设计稿上的原始像素值，不要预先算好结果再写死。
- 字号用 `text-[length:calc(var(--su)*N)]`，行高用 `leading-[calc(var(--su)*N)]`。
- 倍率只缩放尺寸，不改变令牌刻度：`N` 必须仍取自 `design-tokens` 的字号 / 行高 / 间距刻度。例外：对稿实测的装饰性对位值（如旋转文字的行高、贴图内的坐标尺寸）按稿面原值书写，不强行归到刻度。
- 边距用 `var(--page-margin)`，不要用 `--su` 推导页边距；gutter 恒定 20px，同样不缩放。

### 边界

- 倍率是桌面态（≥768px）机制。移动端有独立设计稿与布局，禁止在移动端样式里使用 `--su` / `--su-hero`（小视口会把倍率压到 0.3 以下，文字将不可读）。
- JS 里需要同等换算时（如实测文字宽度后定位），必须与 CSS 用同一封顶值：`Math.min(window.innerWidth, 1680) / 1440`、`Math.min(window.innerWidth, 1920) / 1440`。
- 调整封顶值会整体改变大屏观感，属于全站级变更，须先确认再改，并同步更新本节数值与注释。

## 测试分辨率

- 桌面端：1280×800、1440×900、1920×1080、2560×1440、3440×1440、3840×2160
- 平板：768×1024
- 移动端：375×812、390×844、412×915

当前阶段桌面端为默认适配；平板与移动端在提供对应设计稿后实现。不要自行推断未提供的断点布局。

## 动画响应式规则

- 避免固定像素动画距离，优先百分比、视口单位、`clamp()`；位移需与稿面尺寸挂钩时，乘上同一套 `--su` 倍率，不要写死像素。
- 大屏使用 `gsap.matchMedia()` 调整 GSAP 时间轴。
- 在不同视口高度下检查 ScrollTrigger 的 pin 时长与触发点。
```

## 四、中期：开发过程中持续生效的三份规则

### 规则 6：GSAP + Lenis 动画集成（gsap-lenis-integration.mdc）

接线不统一会出现：多个平滑滚动实例打架、滚动动画错位、刷新时元素闪一下再归位。

两条链路：GSAP 管「元素怎么动」，Lenis 管「页面怎么滚」。输入 → Lenis 算位置 → ScrollTrigger 感知 → GSAP 驱动元素。两个库必须共用 `gsap.ticker`，Lenis 的 `scroll` 必须同步 `ScrollTrigger.update`。

平滑滚动会接管最核心的交互。如果主体是整屏分页或移动端占比大，先评估是否真的需要它。页面内弹窗、抽屉、内部列表必须挂 `data-lenis-prevent`，否则 iOS 上滚不动。

```
---
description: GSAP + Lenis 动画集成约定（Next.js App Router）
globs: **/*.tsx
alwaysApply: false
---

# GSAP + Lenis 集成约定

技术栈：Next.js App Router + `gsap` + `@gsap/react` + `lenis`（`lenis/react`）。

## 平滑滚动（Lenis）

- 全局唯一 Lenis 实例：由 `src/components/providers/smooth-scroll-provider.tsx` 中的 `SmoothScrollProvider` 提供，在 `layout.tsx` 包裹全站。不要在页面或组件中再创建 Lenis 实例。
- 使用 `lenis/react` 的 `ReactLenis`（root 模式）与 `useLenis`；不要安装已归档的 `react-lenis` 包。
- 全局样式必须引入 `lenis/dist/lenis.css`（已在 `globals.css` 中）。
- Lenis 配置 `autoRaf: false`，由 `gsap.ticker` 驱动 `lenis.raf(time * 1000)`，并调用 `gsap.ticker.lagSmoothing(0)`。
- Lenis 的 `scroll` 事件必须同步 `ScrollTrigger.update`，否则滚动触发动画会抖动或错位。
- 滚动缓动保持克制：`lerp: 0.1`，`syncTouch: false`。

## 动画组件（GSAP）

- 所有使用 GSAP/Lenis 的组件必须标注 `"use client"`。
- 一律使用 `@gsap/react` 的 `useGSAP({ scope: container })` 编写动画，不要手写 `useEffect` + 手动清理。
- 插件在模块顶层注册：`gsap.registerPlugin(useGSAP, ScrollTrigger)`。
- 动画目标用 `data-*` 属性选择（如 `data-reveal-card`），并限定在 `scope` 容器内，不用全局类名选择器。
- 入场元素的初始隐藏状态用 CSS 类预设（如 `opacity-0`），避免 SSR 后闪现（FOUC），再由 GSAP `fromTo` 接管。

## 无障碍（必须）

- 所有动画通过 `gsap.matchMedia()` 区分 `prefers-reduced-motion`：
  - `no-preference`：正常播放动画；
  - `reduce`：用 `gsap.set` 直接呈现最终状态。
- `SmoothScrollProvider` 在 reduce 模式下已自动关闭平滑滚动（`lerp: 1`、`smoothWheel: false`），不要绕过。

## 响应式动画

- 避免固定像素位移，优先 `yPercent`、`%`、`vw/vh`、`clamp()`。
- 大屏差异化动画用 `gsap.matchMedia()` 分段处理。
- ScrollTrigger 的 pin/scrub 需在不同视口高度下检查 `start`、`end` 表现。
```

### 规则 7：性能（performance.mdc）

卡顿通常来自三处：动画触发重排、动画值走 React state 导致每帧重渲染、图片视频没优化。三条红线从第一支动画就要守。

```
---
description: 性能规范（动画性能、图片优化、客户端组件控制）
alwaysApply: true
---

# 性能规范

## 动画性能

- 只对 `transform`（x/y/scale/rotate）和 `opacity` 做动画，它们不触发重排且可由 GPU 合成。
- 禁止对布局属性做动画：`width`、`height`、`top`、`left`、`margin`、`padding`、`font-size` 等。
  - 需要尺寸变化效果时用 `scale` 或 clip-path 替代。
- 动画值不放 React state：不要用 `useState` + 重渲染驱动动画（如鼠标坐标、滚动进度）。
  - 一律用 GSAP 直接操作 DOM（`gsap.quickTo`、`gsap.quickSetter`），或存 `useRef`。

## 图片与媒体

- 图片一律使用 `next/image`，禁止裸 `<img>` 标签。
- 首屏关键图片加 `priority`；首屏以下的图片和视频懒加载（`next/image` 默认懒加载，视频用 `preload="none"` + 进入视口再播放）。
- 提供合理的 `sizes` 属性，避免大屏下载超尺寸图片。
- 素材入库前压缩：照片用 AVIF/WebP，矢量用 SVG。

## 客户端组件

- 默认 Server Component；只有需要动画、事件或浏览器 API 的组件才加 `"use client"`。
- `"use client"` 尽量下沉到叶子组件，不要放在整页或布局层（`SmoothScrollProvider` 除外）。
- 纯展示的静态区块（页脚、文字段落）保持服务端渲染。
```

### 规则 8：无障碍（accessibility.mdc）

无障碍散布在每一个交互上，**后期补的成本是前期的十倍以上**。公共按钮、导航、卡片先把焦点和键盘做完，后面复用才自动合规。

```
---
description: 无障碍规范（减少动态效果、键盘导航、语义化、焦点状态）
alwaysApply: true
---

# 无障碍规范

- 减少动态效果：所有动画必须响应 `prefers-reduced-motion`（GSAP 用 `gsap.matchMedia()` 区分，reduce 时直接呈现最终状态；平滑滚动由 `SmoothScrollProvider` 自动降级）。
- 键盘导航：所有交互元素（链接、按钮、卡片）必须可 Tab 到达、可 Enter/Space 触发；自定义交互组件补 `tabIndex` 和键盘事件；禁止 `outline: none` 而不提供替代焦点样式。
- 焦点状态：交互元素必须有可见焦点样式，用 `focus-visible:` 实现（如 `focus-visible:ring-2`），风格与设计系统一致。
- 图片 alt：内容图片必须写有意义的 `alt`；纯装饰图片用 `alt=""`。
- 语义化标签：可点击行为用 `<button>`，页面跳转用 `<a>`（Next.js 用 `<Link>`）；禁止给 `<div>` 加 onClick 充当按钮。
- 鼠标跟随/悬停类效果只作为增强，核心信息和操作不得只能通过 hover 获取。
```

## 五、后期：收敛与上线前必须执行的规则

### 规则 9：浏览器兼容与分端（browser-compat.mdc）

Chrome 上好用的网站，到 Safari 和手机上经常出问题。真实项目里，上线前两周几乎都在修 Safari；雾玻璃修了五天，最后在 Safari 上整段关掉。

**完整提测在后期，降级思路必须在中期写效果时就贯彻。** 每做完一个视觉效果，顺手在 Safari 里看一眼。

必须记住：iPhone 上的 Chrome / Firefox / Edge 内核全是 WebKit，判「要不要走 Safari 方案」的条件是 `iOS 或 Safari`，不是只判 Safari。症状明确修不动时，按分支关掉效果，**不要无限调参**。

```
---
description: 浏览器兼容与分端规范（Safari/WebKit、移动端、重效果降级）
alwaysApply: true
---

# 浏览器兼容与分端规范

支持基线（`package.json` 的 browserslist）：Chrome ≥ 100、Safari ≥ 15、Firefox ≥ 100、Edge ≥ 100。不要收窄；输出语法必须兼容 Safari 15（曾因新语法导致 Safari 15 整页无法滑动）。

## 判端与分包

- 判断桌面/移动一律用 `@/hooks/use-desktop-media`（`min-width: 768px`，SSR 按移动端返回 false），不要另写 `matchMedia` 或 UA 嗅探判端。
- 重资源（WebGL 效果、桌面视频、大图）按端拆分加载：移动端不得下载桌面分包，反之亦然。
- 判 WebKit（选视频编码等）：iOS 上所有浏览器（含 iPhone Chrome）都是 WebKit，按 Safari 处理。

## 视频

- 透明（alpha）视频必须双源：VP9 WebM（Chrome/Firefox/Edge）+ HEVC alpha MP4（Safari 与全部 iOS 浏览器）。WebKit 不支持 VP9 alpha，只给 WebM 会黑底。
- 需要真实下载进度的预载用 XHR + blob，不要依赖 `<video>` 的 `progress` 事件——Safari 下不稳定，曾导致加载卡死在 0%。
- 首屏以下视频 `preload="none"`，进入视口再加载；手机端提供更低码率的独立文件。

## Safari 重效果降级（必须）

新增或改动以下类型的效果时，必须在 Safari 实测，且预留降级路径：

- backdrop-filter + mask：Safari 每次换 mask / 改 transform 会整层重采样闪烁。对策：限制 mask 更新频率、mask 用 1× 分辨率、用 `left/top` 而非 `transform` 定位、位置取整、用 blob URL 而非 data:URL。仍不可接受时整段降级。
- WebGL：Safari 下关 MSAA、压像素比；画布输出与合成层保持预乘 alpha 一致，否则光斑/边缘出现外框。渲染循环必须"静止即停帧"，禁止空转 rAF——Safari 曾因此持续 GPU 满载。
- Canvas 2D 大批量绘制：Safari 无法像 Chrome（Skia）那样合批上万次 drawImage，整屏字形/粒子类绘制要预构建 + 分帧（按时间预算切片）。
- 图片 mask 换帧：Safari 异步解码，帧未就绪就换会闪一帧全遮，先解码完成再切。

降级原则：症状明确修不动时，果断按 `isSafari` 分支关掉效果、退化为静态或 hover 触发，不要无限调参。

## 移动端布局与滚动

- iOS Safari 页面内可滚区域会被平滑滚动库 / 全局触控拦截吃掉事件：移动端区块需要原生滚动时，必须放开拦截（Lenis 用 `data-lenis-prevent`，并检查 `touch-action`）。
- 高度不定的手机视口里，"大图自适应收缩"和"弹性间隔"都验证失败过；采用固定间距 + 正文区内部滚动 + 操作按钮固定在底部工具条的确定性布局。
- 移动端禁止使用 `--su` / `--su-hero`（见 responsive-layout 规则），按对应设计稿画板实现。

## 提测要求

涉及视频、WebGL、backdrop-filter、Canvas、滚动交互的改动，合入前至少在 macOS Safari 与 iOS Safari（真机或模拟器）各过一遍；只在 Chrome 验证不算通过。
```

## 六、三阶段执行清单

**前期（开工前，约占 5% 时间，决定 80% 的后续顺畅度）**

1. 建 `.cursor/rules/`，写下 AI 工作流规则
2. 建目录骨架，写下架构规则
3. 锁死 `tsconfig` strict 与 ESLint，写下代码质量规则
4. 从设计稿导出令牌，同步到 CSS 变量，写下令牌规则
5. 定边距、栅格、缩放倍率与封顶值，写下响应式规则
6. 定 browserslist 与分端加载，先写判端 hook
7. 搭好动画库 Provider 与接线

**中期（页面开发）**

1. 一屏一文件，动画抽离，组件超 250 行就拆
2. 颜色、字号、间距只取令牌刻度
3. 稿面尺寸用 `calc(var(--su)*N)`，不写死像素
4. 素材压缩后入库，透明视频准备双源
5. 动画只碰 transform / opacity，动画值不进 state
6. 交互组件自带键盘支持与焦点样式
7. 重效果同步写降级分支，可滚区域挂 `data-lenis-prevent`
8. 每次改动 lint 零错误，做一次说得清的中文提交

**后期（收敛上线）**

1. 按分辨率清单过桌面、平板、手机
2. macOS Safari + iOS Safari 实测重效果与滚动
3. 卸载退场组件、静止停帧、按端拆包、删除未引用素材
4. 打开「减少动态效果」过一遍，再用纯键盘走完核心流程
5. 全量 lint + build 通过
6. 复查令牌三处（JSON、CSS 变量、规则文档）是否仍一致

## 七、两条还要记住

1. **能执行才叫规则。**「代码要优雅」不是规则，「单组件超 250 行必须拆」才是。规则和代码冲突时，改代码或改规则，不能各说各话——规则一失真，AI 会按错的继续写。
2. **降级不丢人。** 用户感知不到「这里本来有个很酷的效果」，但一定感知得到卡顿。
