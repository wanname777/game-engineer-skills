# 离线2D关卡拼装工具 — 独立规划与交接材料

这是一个新项目的规划包，目录 /tmp/youzao-fresh-project/。当前没有工具实现、构建产物或新项目 Git 提交。game_engineer 是只读参考仓库，不能把它的界面、测试记录或 Git 状态当成本项目成果。

目标：个人创作者在桌面离线拼装2D地块，一键进入预览，保存后刷新恢复，把可重载的 JSON 发给朋友。

## 先读这些文件

1. raw-input.md：用户给定条件，避免重复追问。
2. docs/project/brief.md：PRD、完整路径、范围和假设。
3. docs/project/decisions.md：事实、建议与复议条件。
4. docs/architecture/ADR-001-offline-local-tool.md：三种路线比较和建议。
5. docs/project/tasks.json、docs/project/delivery-plan.md：任务依赖、负责人、两周安排及完成门槛。
6. docs/project/acceptance.md：未来实际运行的验收步骤与本次已执行记录。
7. handoff/context-pack.md、handoff/new-session.md：独立摘要和下一会话任务。
8. reference/current-repository-evidence.md：当前仓库读到的证据及缺口。

samples/level-v1.json 是按建议格式手工制作的测试输入，尚未被真实工具导入、导出或预览。checks/ 保存本规划包的结构检查结果，不代表工具功能通过。

## 路线与状态

建议使用 React + TypeScript + Vite 构建静态资源，Node 内置本机服务器固定绑定 http://127.0.0.1:4186，关卡用 localStorage 保存为规范 JSON，导入/导出 JSON 文件。所有运行资源随离线包提供，浏览器中不接网络服务。部署服务器、账号和云数据库不在范围中。

两周从实际开始之日算起；开始日期、每日可投入工时、最终支持的操作系统和费用上限尚未给定。以当前 macOS 开发环境和桌面 Chromium 浏览器作为首个验证目标的假设，在 T-001 开始时记录实际设备与浏览器版本，不把未验证平台列为已支持。

## 状态边界

- 新项目：仅规划，全部实施任务 todo/blocked，所有功能验收未执行。
- 本次实际动作：只读源码与锁文件；读取当前参考仓库 Git；运行恢复脚本；检查本规划包。
- 当前参考仓库 Git：详见 reference/game-engineer-context-pack.md 的生成时点与来源；并行编辑使其随后变化；主线程随后通知已首次提交/推送，本任务未独立复核，新工具状态不受此影响。
- GitHub CI、线上部署、视频渲染：本任务未运行；新项目无对应产物。

不得在当前 game_engineer 路径启动新项目实施。下一会话先在本包下创建独立 implementation/ 工作目录；若要长期维护，随后移出 /tmp 到持久目录。/tmp 不是长期备份。
