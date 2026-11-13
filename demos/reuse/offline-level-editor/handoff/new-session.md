# 给全新会话的接手任务

请接手一个新项目：离线2D关卡拼装工具。附件根目录 /tmp/youzao-fresh-project/，这是规划包，不是已经实现的应用。

先读 handoff/context-pack.md，再读 raw-input.md、README.md、AGENTS.md、docs/project/brief.md、docs/project/decisions.md、docs/architecture/ADR-001-offline-local-tool.md、docs/project/tasks.json、docs/project/delivery-plan.md、docs/project/acceptance.md。以这些拥有源为准；不要重新追问用户已确认的离线/个人/两周/桌面/JSON/无云条件。

本轮任务：实施T-001的独立工程与离线启动骨架，在 /tmp/youzao-fresh-project/implementation/ 写入；先记录实际设备/Node/浏览器及Git状态，建立锁文件和未来 npm run check，再验证固定 http://127.0.0.1:4186 的启动、端口占用行为与离线运行包资源。完成后附命令退出状态和可定位证据，按依赖推进T-002；未执行的核心功能仍保持未完成。

本轮只加载 /Users/bytedance/Documents/coding/game_engineer/.agents/skills/deliver-project/SKILL.md。其他技能路径留在raw-input.md供下一阶段使用。当前计划技术路线为建议，T-001实测后记录采用/验证状态；未知费用/平台不要虚构。

/Users/bytedance/Documents/coding/game_engineer 只读，是其他agents正在修改的参考工程；不得在此处新增或改动新工具。reference/game-engineer-context-pack.md 的 main/HEAD/工作区与说明均属于该参考工程，不是新项目Git。必要时只读当前源文件核对借鉴方法，不能使用参考仓库历史测试或其他agents的CI充作新工具证据。

新工程尚未初始化；不存在package命令不表示检查通过。若初始化Git，只报告新目录自己的状态；如果暂不建Git，提交/CI状态记“无”。/tmp容易被清理，工程建立后整理可迁移包，迁到长期路径需按当时授权执行。

验收以任务证据为准：本机打开、断外网冷启动、同origin刷新/重开、独立会话文件往返、第二设备分别记录。第二设备缺失就保持对应任务阻塞，继续本机可独立完成的内容。不要使用工具向朋友发消息或文件，文件分享验收可用已提供的本地第二设备。
