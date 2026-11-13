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
- 共享视觉变量在 src/tokens.css，由 src/styles.css 加载；每个 feature 的样式限定在自身根类。
- src/features/motion 的时间函数是视频与交互预览的单一画面来源。
- docs/research 记录来源和证据等级。不得将简介或源代码阅读写成完整观看视频。
- 不提交视频原件、完整字幕、凭据、个人信息、临时录屏或 node_modules。
- 并行任务必须声明文件所有权；独立验收只提供 skill 路径、任务和原始输入，不透露预期答案。
- 本项目 demo 和原始作品是原创；借鉴的作者方法在 THIRD_PARTY_NOTICES.md 标明来源。
- 所有运行结果按实际状态报告，GitHub CI、部署、视频渲染不得预报成功。
