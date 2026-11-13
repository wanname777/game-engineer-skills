# 新项目当前状态与恢复索引

身份：/tmp/youzao-fresh-project/ 是新关卡工具的规划包，尚无实现目录、package.json、lockfile、运行产物或Git提交。本状态不是game_engineer状态。原始输入拥有源为 raw-input.md；完整PRD是 docs/project/brief.md，决策是 docs/project/decisions.md，技术规范是 docs/architecture/ADR-001-offline-local-tool.md，任务状态拥有源是 docs/project/tasks.json。

## 已确认与建议

用户已确认：离线2D关卡拼装工具、个人维护、两周、桌面优先、放地块、一键预览、JSON保存、刷新恢复、可重载文件导出；无账号、云服务、排行榜；JSON文件分享给朋友。

建议（未验证）：静态React/TS/Vite资源，Node内置本机服务固定127.0.0.1:4186，运行包无CDN/远端字体与生产npm依赖。localStorage保存规范JSON，文件选择导入、Blob下载导出。隐私模式/清缓存/换origin不能自动迁移，文件备份由使用者负责。朋友需要同版本工具及运行环境，不能只把JSON视为可运行程序。

假设：首个目标设备macOS桌面Chromium；最小预览为俯视四向逐格试走；两周按10工作日，任务粗估9日+1日缓冲。开始日期、每日投入、预算上限、完整OS支持未给定；不重复追问已给条件。若要求免Node安装或复杂游戏运行时，复议ADR。

## 关键规则

地块默认24×16、单层；导入1到64整数宽高，总格数最多4096。JSON字段format=youzao.level、schemaVersion=1、name、width、height、tiles、spawn、goal。tiles为row-major，0空/阻挡、1地面、2墙；标记可为null，否则在地面且不同。未知字段/未来版本/越界/256KiB以上文件拒绝整份导入，不破坏原编辑与保存点。无标记也能保存/导出，预览缺标记则定位提示；预览运行态不能改LevelV1。

显式保存成功后消dirty；未保存修改刷新恢复上次保存。导出当前JSON与本机保存分别报告；导入先成为未保存草稿，保存才改恢复点。存储失败保留编辑与导出能力；损坏恢复不自动覆写原键。

## 当前任务状态（全部未开始）

| ID | 依赖 | 状态 | 下一验收 |
| --- | --- | --- | --- |
| T-001 独立工程与离线骨架 | 无 | todo | 固定地址、实际设备、端口占用与离线包启动 |
| T-002 LevelV1与地块 | T-001 | blocked | 地块/标记一致、边界与键盘放置 |
| T-003 本机JSON恢复 | T-002 | blocked | 保存A/未保存B/刷新重开恢复A，存储错误 |
| T-004 试走预览 | T-002 | blocked | 墙/空格阻挡、终点反馈、编辑快照不变 |
| T-005 文件往返 | T-003 | blocked | 实际下载、独立context导入/重导出，坏输入原子拒绝 |
| T-006 完整路径 | T-003/T-004/T-005 | blocked | 浏览器全用户路径与console |
| T-007 离线/桌面/键盘 | T-006 | blocked | 断外网干净缓存冷启动，1440×900、1280×720 |
| T-008 第二设备 | T-006 | blocked | 同版本JSON导入/重开/再导出；设备缺失保留阻塞 |
| T-009 修复冻结与交接 | T-007/T-008 | blocked | 当前版本check、最终离线包与新工程上下文 |

里程碑M1/M2/M3全部planned，evidence全部空；计划材料结构检查不关闭任何工具任务。全部真实验收计划在 docs/project/acceptance.md 的A-001到A-012。功能构建/测试/浏览器/第二设备/CI/部署全部未执行。next：按 handoff/new-session.md 实施T-001，仅在 implementation/写入并记录新工程自己的状态。

## 参考仓库观察与禁止混用

只读参考 /Users/bytedance/Documents/coding/game_engineer，其他agents在并行修改，本任务未修改它。恢复脚本实际生成 reference/game-engineer-context-pack.md（2026-11-13T07:50:27.401410+00:00；15798 bytes），main、HEAD不可解析，工作区有大量未跟踪文件；git verify HEAD退出128。此Git和包内默认新会话任务仅属game_engineer，且是历史读取时点。主线程后来通知已首次提交/推送及项目检查，本任务未独立核验，不把后续状态或结果计入新工具。

参考源码读到设计版本localStorage保存/恢复、结构校验、Blob下载设计tokenJSON和介绍HTML，不能推断关卡导入、地块试走或新项目已通过。详情在 reference/current-repository-evidence.md。没有本次参考仓库check/CI/部署证据。

## 遗漏与限制

本交接摘要不复制源码、媒体、完整参考包或全部验收表，按以上拥有源路径读取。样本 samples/level-v1.json 是手工原创测试输入，未经过工具导出。/tmp可能被清理；长期维护迁往持久目录。完整独立恢复审阅记录在 handoff/recovery-acceptance.md，生成后查看其实际状态。
