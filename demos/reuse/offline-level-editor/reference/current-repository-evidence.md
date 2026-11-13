# 当前 game_engineer 仓库只读参考证据

身份：/Users/bytedance/Documents/coding/game_engineer，当前已有游造工作台。它不是 /tmp/youzao-fresh-project/ 新项目。读取日期2026-11-13，Git包精确生成时间为2026-11-13T07:50:27.401410+00:00。其他agents正在并行修改，以下仅代表本次各读取时点，不是冻结提交或完整实现审计。

## 后续状态漂移

主线程在本包收敛期间通知：已完成当前game_engineer的首次提交/推送及项目检查。本子任务没有独立读取这些后续结果；它们不属于新关卡工具的验收。本文件与reference/game-engineer-context-pack.md中main、不可解析HEAD、未跟踪清单是07:50起各读取时点的历史证据，不能当作最终当前仓库状态。续接需要当前Git时应重新只读核对，不覆盖历史快照。

## 实际Git与命令

- 只读 git status --porcelain=v1 --untracked-files=normal：退出0，列出 .agents/、.githooks/、.github/、AGENTS.md、README.md、docs/、src/、package.json、package-lock.json 等未跟踪文件。完整清单在 game-engineer-context-pack.md。
- 只读 git branch --show-current：恢复脚本读到 main。
- git rev-parse --is-inside-work-tree：退出0，true。
- git rev-parse --verify HEAD：退出128，fatal: Needed a single revision。没有可解析的当前HEAD，不能写出commit SHA或当前commit CI通过。
- node --version：退出0，v24.10.0。
- 未运行当前参考仓库的 npm ci/check、浏览器、CI、部署或视频；未向Git远端发送任何内容。

恢复脚本命令（本次退出0，输出15798 UTF-8 bytes）：

```sh
python3 /Users/bytedance/Documents/coding/game_engineer/.agents/skills/recover-project-context/scripts/context_pack.py --root /Users/bytedance/Documents/coding/game_engineer --output /tmp/youzao-fresh-project/reference/game-engineer-context-pack.md --source AGENTS.md --source docs/project/brief.md --source docs/project/decisions.md --source package.json --source README.md
```

这个包的“当前Git事实”“项目来源快照”“新会话任务”都属于参考仓库；不能照抄成新项目状态或新项目实施指令。新项目续接只使用 handoff/context-pack.md 与 new-session.md。参考包已经人工读过：有来源与限制，未发现需要保留的联系方式/密钥；没有源代码全文、聊天历史、媒体或远程配置。

## 可借鉴的拥有源

| 来源（绝对路径） | 本次读到的内容 | 可借鉴方法 | 不能推断的能力 |
| --- | --- | --- | --- |
| /Users/bytedance/Documents/coding/game_engineer/package.json:5 | Node ^22.12或>=24；React19、TS5.9、Vite7；check组合命令 | 单个网页工程与检查入口 | 新项目依赖已安装、构建通过 |
| /Users/bytedance/Documents/coding/game_engineer/package-lock.json | 读取node_modules版本字段：React/ReactDOM19.3.1、TS5.9.3、Vite7.3.8、Vitest5.1.0、Playwright1.65.0 | 新工程建锁文件时可对照版本 | 与README概述版本完全相同、运行兼容性已实测 |
| /Users/bytedance/Documents/coding/game_engineer/src/features/design/model.ts:177 | isDesignState检查theme/scene/document/对象范围、唯一ID；199的readVersions解析JSON并校验 | 从unknown校验结构后恢复；拒绝坏数据 | 新关卡schema/地块逻辑已实现 |
| /Users/bytedance/Documents/coding/game_engineer/src/features/design/model.ts:222 | makeVersion用structuredClone保存独立快照；235限制12条 | 预览与保存快照隔离方法 | 自动保存、无限历史或跨设备数据 |
| /Users/bytedance/Documents/coding/game_engineer/src/features/design/DesignStudio.tsx:22 | 从localStorage读版本，39从最近版本初始化；121保存，131写JSON，139错误提示 | 保存成功后更新状态；恢复失败可编辑 | 新工具刷新恢复通过；数据自动同步 |
| /Users/bytedance/Documents/coding/game_engineer/src/features/design/DesignStudio.tsx:145 | restoreVersion载入本地版本；156添加固定货箱 | UI与状态联动 | 文件导入、2D地块拼装或可玩试走 |
| /Users/bytedance/Documents/coding/game_engineer/src/features/design/InspectorPanel.tsx:30 | Blob/objectURL/anchor真实下载机制；265下载设计变量，343下载HTML | 文件导出适配器 | 下载的是完整关卡/可重载关卡；当前存在JSON导入 |
| /Users/bytedance/Documents/coding/game_engineer/src/features/design/model.test.ts:14 | 保存快照隔离与JSON往返测试源码 | 领域行为测试思路 | 本次已运行测试或浏览器已通过 |
| /Users/bytedance/Documents/coding/game_engineer/playwright.config.ts:4 | 配置tests/e2e，desktop/mobile；固定4173端口 | 桌面真实浏览器与稳定地址验证思路 | 实际测试文件完整或本任务运行成功 |
| /Users/bytedance/Documents/coding/game_engineer/.agents/skills/recover-project-context/scripts/context_pack.py | 只读Git、白名单、20KB预算、遗漏与脱敏 | 来源/状态分隔与新会话材料 | 生成包等于项目通过 |

初始rg指定了不存在的src/lib、e2e，退出2；后续使用rg --files与实际配置定位。未将“搜索未发现”写成对整个仓库的绝对证明。已检查的设计组件没有文件导入流程；仅结论为这些拥有源尚不能提供关卡文件导入参考。

## 身份与状态边界

新项目状态：没有应用源码、package/lockfile、运行产物、独立Git或commit；只有本次 /tmp 材料。参考仓库状态：有工作台源码，但本次没有运行行为检查，Git HEAD不可解析。两者各自的测试、CI、部署、数据和任务不可合并。
