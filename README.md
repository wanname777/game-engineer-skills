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

当前项目已配置 `.trae/skills` 与 `.claude/skills` 的同源入口。提交检查保存在 `.githooks/pre-commit`；新 clone 后使用 `git config core.hooksPath .githooks` 启用。它检查 skill 结构和约 20KiB 的源文件体积，锁文件、研究长文和生成产物另行管理。

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
