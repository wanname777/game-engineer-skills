# 项目上下文交接包

生成时间：2026-11-13T07:50:27.401410+00:00
生成器：recover-project-context/scripts/context_pack.py（当前文件与只读Git命令）
规则：以当前拥有源为准；未知状态必须保留未知。20KB约5000token只是近似，中文不按此精确计数。

## 当前Git事实
- 分支（git branch --show-current）：main
- HEAD（git rev-parse HEAD）：不可读取（非Git仓库、尚无提交或命令失败）
- 工作区（git status --porcelain=v1）：读取成功
```text
?? .agents/
?? .githooks/
?? .github/
?? .gitignore
?? AGENTS.md
?? LICENSE
?? README.md
?? THIRD_PARTY_NOTICES.md
?? demos/
?? docs/
?? index.html
?? package-lock.json
?? package.json
?? playwright.config.ts
?? research/
?? scripts/
?? src/
?? tsconfig.json
?? vite.config.ts
```

## 项目来源快照
### 来源：AGENTS.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# Game Engineer Skills

本项目交付六个项目内 skill 和「游造」交互 demo。先读 README.md、docs/project/brief.md，再按任务只加载一个相关 skill。

## Skill 路由
- 界面、视觉、设计系统：.agents/skills/design-game-interface/SKILL.md
- 分镜、动画、视频导出：.agents/skills/create-motion-showreel/SKILL.md
- 需求澄清、PRD：.agents/skills/discover-project/SKILL.md
- 技术选型、ADR：.agents/skills/choose-project-stack/SKILL.md
- 迭代、GitHub、测试、发布：.agents/skills/deliver-project/SKILL.md
- 上下文恢复、清理、交接：.agents/skills/recover-project-context/SKILL.md

## 工作约定
- 使用 Node >=22，npm ci；npm run dev 本地启动。
- 修改行为后运行 npm run check；动画修改后额外运行 npm run render:motion。
- 共享视觉变量在 src/styles.css；每个 feature 的样式限定在自身根类。
- src/features/motion 的时间函数是视频与交互预览的单一画面来源。
- docs/research 记录来源和证据等级。不得将简介或源代码阅读写成完整观看视频。
- 不提交视频原件、完整字幕、凭据、个人信息、临时录屏或 node_modules。
- 并行任务必须声明文件所有权；独立验收只提供 skill 路径、任务和原始输入，不透露预期答案。
- 本项目 demo 和原始作品是原创；借鉴的作者方法在 THIRD_PARTY_NOTICES.md 标明来源。
- 所有运行结果按实际状态报告，GitHub CI、部署、视频渲染不得预报成功。

### 来源：docs/project/brief.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# 游造 · 项目说明

本项目交付六个可复用的项目内 skill 和一个原创游戏创作工作台。示例世界是「星港快递 / Starport Courier」；它用于统一设计、动画和项目管理示例，不是已发行游戏。

## 用户与目标

目标用户是想把创意推进成可预览、可导出、可交接产物的独立创作者。第一版完整路径：进入工作台 → 修改设计或动画 → 预览 → 下载原创产物 → 澄清需求与技术约束 → 带着验收记录推进任务 → 下载独立交接包。

目标是让下一位创作者能在当前项目或其他项目中使用同一份 skill，而不是依赖原会话理解隐含方法。

## 首版范围

- 六个 skill：设计、动画、需求、技术选型、交付、上下文恢复；包含明确触发、步骤、模板、研究来源和必要脚本。
- 设计工作室：真实输入与画面联动，局部持久化、桌面与手机布局、可下载原创产物。
- 动画放映室：统一确定性时间函数驱动预览与视频输出，实际生成的媒体按文件状态记录。
- 项目工作台：有限高价值追问、可编辑PRD与决策、两三技术方案与ADR、依赖看板与人工验收、独立交接包和新会话提示词。
- 仓库交接脚本：只读当前Git和白名单项目文档，来源路径、状态、敏感模式遮盖、约20KB默认预算与遗漏说明。
- 文档与测试：研究证据等级、原创迁移说明、实际运行结果和公开交付状态。

## 边界

不接云端AI，不提供多人账号系统，不存服务端密钥，不把本机看板状态描述为GitHub任务状态。网页下载的PRD/ADR是本次输入的草稿；网页人工验收和实际测试/CI/部署分别记录。自由输入默认只留在本次页面；项目看板只持久化任务状态、人工记录类型/时间和里程碑，不持久化验收原文。

第一版不制作完整可发行游戏；不复制作者原视频、完整字幕或上游skill全文。项目源资产遵循原创资产策略，临时录屏和版权音轨不提交。

## 具体验收

| 项目 | 可执行步骤 | 可观察结果 | 证据位置 |
| --- | --- | --- | --- |
| 六个skill | 运行结构检查，读取模板与引用 | 元数据有效、无TODO、引用存在、源方法明确 | `.agents/skills/**`、`docs/validation.md` |
| 设计行为 | 修改场景输入，保存、刷新与导出 | 画面对应变化，刷新恢复声明的状态，真实下载文件 | `src/features/design/**`、浏览器验收 |
| 动画 | 拖动/播放时间轴，再执行视频渲染 | 同一时间输出一致，实际文件可播放 | `src/features/motion/**`、`demos/motion/**` |
| 需求 | 补未知成功标准与边界，生成并修改PRD | 最多3个当前追问，未知不伪补，下载有真实换行 | `src/features/project/**`、浏览器下载 |
| 选型 | 改地区、密钥、数据需求并生成ADR | 三种可解释方案，硬约束改变推荐，ADR记取舍 | `src/features/project/model.test.ts`、浏览器验收 |
| 看板 | 尝试关闭阻塞任务或空证据任务，再逐项验收 | 被阻塞动作不可完成；有依赖和人工证据才能登记 | 同上 |
| 看板恢复 | 登记首任务，刷新；再重开前置任务 | 状态恢复，验收原文未默认保存，下游重新打开 | 同上 |
| 交接 | 生成网页包；运行仓库脚本输出文件 | 网页包来源与限制明确，仓库包有真实Git状态与遗漏 | `scripts/context_pack.py`、脚本测试 |
| 适配与可访问 | 桌面/手机、键盘、控制台与可访问性检查 | 核心操作可达、无水平溢出或对应控制台错误 | 浏览器验收 |
| GitHub与发布 | 检查当前提交的CI和目标部署 | 仅报告实际检查与真实可访问结果 | `docs/validation.md` |

## 原始输入与来源

用户指定的视频与卡普迪姆S2系列用于学习方法；视频音轨、视觉关键帧、文章和原始代码的证据类型在 `docs/research` 中逐条记录。原始MIT仓库为 `https://github.com/nagi-studio/skills`，研究使用提交 `b7bb3ee09f502ffd68cee984b8344b2af3b616e6`；本项目四个项目管理skill是原创迁移。

## 下一步与状态

实现、结构验证、行为单测、真实浏览器检查、动画渲染及GitHub交付分别记录；不得因为某一项完成就预报其他项成功。当前状态见 `tasks.json` 与 `acceptance.md`；最新全项目运行证据见 `docs/validation.md`。

### 来源：docs/project/decisions.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# 游造 · 项目决策

| ID | 决策 | 理由 | 来源 | 状态 | 复议条件 |
| --- | --- | --- | --- | --- | --- |
| D-001 | 六个项目内skill + 三个工作区；项目工作区内含四个交互demo | 单一工作台让设计、动画、项目产物共享原创世界 | README、当前任务、AGENTS | 已采用 | 用户调整交付范围 |
| D-002 | 原创品牌游造，原创示例星港快递 | 学作者方法，避免复制原产品和作品 | 用户任务、THIRD_PARTY_NOTICES | 已采用 | 题材变更 |
| D-003 | React 19 + TypeScript 5.9 + Vite 7；Node ≥22，当前Node 24.10.0 | 当前仓库已建立此栈；浏览器创作demo无需引入完整游戏引擎 | package.json、锁文件；2026-11-13实际node --version | 已采用；运行时已读取 | 原生游戏运行时或大型3D出现 |
| D-004 | 先做本机交互与下载，不接云AI或多人持久化 | 控制密钥、维护与地区依赖，避免将演示伪装为云服务 | 当前任务、ProjectStudio实现 | 已采用 | 需要共享数据时另立ADR并验证权限/地区 |
| D-005 | 看板保存状态、类型与时间；自由输入不默认保存 | 维持刷新可继续体验并减少私人输入留存 | src/features/project/model.ts | 已实现；行为检查另记 | 用户明确要求保存文本且有适当范围 |
| D-006 | 依赖完成且有实际记录才能登记任务完成 | 里程碑必须来自可复核记录，重开前置会失效下游证据 | model.ts、model.test.ts | 单测已执行；浏览器另记 | 真实GitHub任务接入 |
| D-007 | 共享视觉变量在styles.css；feature根类限定局部样式 | 多个工作区保持一致并避免相互污染 | AGENTS、src/styles.css | 已采用 | 设计系统升级 |
| D-008 | 动画时间函数统一驱动预览与视频 | 降低交互与导出画面分叉风险 | AGENTS、src/features/motion | 已采用；实际渲染另记 | 渲染器变化 |
| D-009 | context_pack根入口调用skill内单一实现 | 保持可复用skill与项目脚本同规则，输出真实Git/来源和遗漏 | scripts/context_pack.py、recover skill脚本 | 已实现；脚本检查另记 | 来源目录发生变化 |
| D-010 | 研究按元数据、音轨转写、视觉、源码等证据类型记录 | 不能将简介/源码阅读写成完整视频观看 | docs/research、AGENTS | 已采用 | 新增原始证据 |

GitHub CI、部署、完整浏览器检查与视频渲染状态不在此预填。实际状态只在验收记录和验证文档中按观察更新。

### 来源：package.json
状态：读取当前工作区文件；内容陈述尚未独立复核。

{
  "name": "game-engineer-skills",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": "^22.12.0 || >=24.0.0"
  },
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check:skills": "python3 scripts/validate_skills.py",
    "check": "npm run check:skills && npm run build && npm test && npm run test:e2e",
    "render:motion": "node scripts/render-motion.mjs",
    "context:pack": "python3 scripts/context_pack.py",
    "install:skills": "python3 scripts/install_skills.py"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.11.0",
    "@ffmpeg-installer/ffmpeg": "1.1.0",
    "@playwright/test": "^1.56.1",
    "@types/node": "^24.10.0",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^5.1.0",
    "typescript": "~5.9.3",
    "vite": "^7.2.2",
    "vitest": "^5.1.0"
  }
}

### 来源：README.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# 游造 · 游戏创作工作台

把设计、动画和项目推进的方法，留成下一次能直接使用的 skill。本项目以原创游戏「星港快递 / Starport Courier」作为统一演示，提供六个项目内 skill、三个交互工作区，以及动画导出和交付验收工具。

## 开始使用

需要 Node.js **22.12+ 或 24+**、Python 3.9+。安装、启动：

```sh
npm ci
npx playwright install chromium
npm run dev
```

打开终端显示的本地网址。工作台支持桌面与手机尺寸；页面里的示例数据只保存在当前浏览器中。GitHub 仓库公开的是代码和原创演示产物。

## 六个 skill 与对应 demo

| Skill | 处理什么 | 在工作台哪里体验 |
|---|---|---|
| [design-game-interface](.agents/skills/design-game-interface/SKILL.md) | 信息结构、统一设计 token、场景与属性联动、作品复用 | 设计工作室 |
| [create-motion-showreel](.agents/skills/create-motion-showreel/SKILL.md) | 分镜、确定性渲染、音画共同时间轴、MP4 导出 | 动画放映室 |
| [discover-project](.agents/skills/discover-project/SKILL.md) | 需求追问、第一版范围、PRD 与决策记录 | 项目驾驶舱 → 需求 |
| [choose-project-stack](.agents/skills/choose-project-stack/SKILL.md) | 两三种方案、维护成本、技术决策记录 | 项目驾驶舱 → 技术方案 |
| [deliver-project](.agents/skills/deliver-project/SKILL.md) | 依赖、任务、验收证据、GitHub 交付 | 项目驾驶舱 → 交付 |
| [recover-project-context](.agents/skills/recover-project-context/SKILL.md) | 从真实代码与 Git 重建上下文、独立验收 | 项目驾驶舱 → 交接 |

在当前项目里直接说 `使用 $design-game-interface …`，或提供完整 skill 路径。项目根目录的 [AGENTS.md](AGENTS.md) 提供路由。`.agents/skills` 是规范来源；安装脚本可把同一份 skill 链接到其他 Agent 的发现目录，不必维护多份副本。

```sh
npm run install:skills -- --target trae
npm run install:skills -- --target claude
```

安装前可加 `--dry-run` 查看计划。脚本只配置当前项目，遇到已有不同目录会停止，避免覆盖。

## 验证与产物

```sh
npm run check          # skills 结构、编译、行为单测、真实浏览器验收
npm run render:motion  # 逐帧导出原创动画和合成音轨
npm run context:pack   # 从当前代码与 Git 生成交接包
```

行为验收覆盖保存后的刷新恢复、实际场景改动、需求与方案输出、依赖阻塞、时间轴回放和手机布局。CI 在每次 push / PR 上执行相同检查，并保存浏览器报告。

动画、风格帧和验证报告在 [demos/motion](demos/motion)。设计和项目管理的示例输入与导出样本分别在 [demos/design](demos/design) 和 [demos/project](demos/project)。实际测试记录见 [docs/validation.md](docs/validation.md)。

## 视频学习与原创边界

研究包括用户给出的两个独立视频，以及卡普迪姆 S2-0 到 S2-8 全部九集。采用公开元数据、作者原始 GitHub 规范、作者文章、视频关键帧和本地音轨转写；机器识别的术语会用原始仓库校正。每条结论的来源与证据等级见 [研究索引](docs/research/README.md)。

六个 skill 和游戏 demo 是本项目对这些方法的原创迁移；不会将作者的内容生产工具描述成现成游戏引擎，也不会把本地保存描述成多人在线存储。原始作者与许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。不提交原视频、完整版权字幕、个人登录数据或云服务密钥。

公开仓库：[wanname777/game-engineer-skills](https://github.com/wanname777/game-engineer-skills)。

## 遗漏与状态限制
- 仅收录约定或显式指定的项目文本来源；没有全量读取源代码或聊天历史。
- 排除.env、personal/private、凭据、二进制、大文件、视频原件、录屏、node_modules和输出文件。
- 不读取远程URL或密钥配置；个人联系方式和明显密钥模式仅作尽力脱敏，分享前仍需检查。
- 未运行构建、测试、CI、部署或渲染；文档内结果属于有来源的历史陈述，需在新会话复核。

## 新会话任务
读取当前README.md与AGENTS.md遵守仓库规则；本次项目来源为：`AGENTS.md`、`docs/project/brief.md`、`docs/project/decisions.md`、`package.json`、`README.md`。
以这些来源核对当前Git、项目目标、决策和任务；不要把其他子项目的默认文档混作拥有源。只加载一个最相关skill，指出仍有效的决策、阻塞与下一步；实施后记录真实验证结果。独立验收只接收skill路径、任务和原始输入，不沿用前一会话的预期答案。
