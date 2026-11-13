# 项目上下文交接包

生成时间：2026-11-13T07:59:14.159879+00:00
生成器：recover-project-context/scripts/context_pack.py（当前文件与只读Git命令）
规则：以当前拥有源为准；未知状态必须保留未知。20KB约5000token只是近似，中文不按此精确计数。

## 当前Git事实
- 分支（git branch --show-current）：不可读取（非Git仓库、尚无提交或命令失败）
- HEAD（git rev-parse HEAD）：不可读取（非Git仓库、尚无提交或命令失败）
- 工作区（git status --porcelain=v1）：无法确认
```text
不可读取（非Git仓库、尚无提交或命令失败）
```

## 项目来源快照
### 来源：AGENTS.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# 新项目规划包工作规则

本目录是独立新项目的规划与交接产物，不是 game_engineer 的新分支或已实现模块。
先读 README.md、raw-input.md、docs/project/brief.md 与 docs/project/decisions.md。按当前阶段只加载一个原始项目 skill，技能路径见 raw-input.md。

- 不重复询问原始输入已给出的条件；未给出的设备、预算、预览玩法按文档假设推进并记录验证时机。
- 不修改 /Users/bytedance/Documents/coding/game_engineer；它仅作为只读参考，其他 agents 正在修改。
- 下一会话的实现拥有目录为 /tmp/youzao-fresh-project/implementation/；初始化 Git、依赖和命令后才记录新项目工程状态。
- 建议 Node 22.12+ 或 24+、npm ci、npm run dev；这些是未来工程要建立的命令，此规划目录尚不能运行应用。
- 行为改动必须执行未来工程的 npm run check（构建、领域测试与真实浏览器行为），保留实际日志；不存在的命令不能写成已通过。
- 任务完成必须依赖已完成且验收证据齐全。前置重开时重新评估下游和里程碑。
- 计划、源码阅读、人工记录、命令、浏览器、GitHub CI和部署分别标注。摘要不覆盖当前拥有源。
- JSON 共享不等于自动同步；保存作用域是固定浏览器 origin，导出文件承担备份。
- 不复制参考仓库 Git 状态到新项目状态。参考快照与新项目交接包分别生成。
- 不提交 node_modules、凭据、临时浏览器录屏。只在授权目录写入，尊重其他 agents 的文件所有权。

### 来源：raw-input.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# 新项目原始输入

来源：2026-11-13 当前用户任务；以下为项目条件原文。

一个离线运行的2D关卡拼装工具，个人维护，两周，桌面优先，玩家能放地块、按一键预览、保存为JSON、刷新恢复，再导出可重新载入的关卡。不需要账号或云服务，也不做排行榜；共享只需要把JSON文件发给朋友。

任务授权：生成PRD、决策、ADR、任务依赖、真实验收方案、给全新会话的交接包，保存到 /tmp/youzao-fresh-project/。不要再次追问已有条件。可只读检查 /Users/bytedance/Documents/coding/game_engineer 作为借鉴来源。不得修改该仓库，其他 agents 正在并行修改。规划、当前仓库行为和实际验收必须分开；恢复脚本读取的 Git 属于当前 game_engineer 仓库。

指定方法来源（分阶段使用）：
- /Users/bytedance/Documents/coding/game_engineer/.agents/skills/discover-project/SKILL.md
- /Users/bytedance/Documents/coding/game_engineer/.agents/skills/choose-project-stack/SKILL.md
- /Users/bytedance/Documents/coding/game_engineer/.agents/skills/deliver-project/SKILL.md
- /Users/bytedance/Documents/coding/game_engineer/.agents/skills/recover-project-context/SKILL.md

### 来源：handoff/current-state.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

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

### 来源：docs/project/decisions.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# 新项目决策

日期：2026-11-13。状态来源优先 raw-input.md；建议通过最小技术切片后才可变更为已验证。技术细节以 ADR-001 为单一拥有源，本表只引用结论。

| ID | 结论 | 理由 | 来源 | 状态 | 复议条件 |
| --- | --- | --- | --- | --- | --- |
| D-001 | 离线2D关卡创作工具，个人维护，首版两周，桌面优先 | 用户给定交付类型/边界 | raw-input.md | 用户已确认 | 用户调整目标/期限 |
| D-002 | 必须完成放地块→一键预览→JSON保存→刷新恢复→文件导出/导入 | 最短用户完整路径 | raw-input.md | 用户已确认 | 用户显式改变验收 |
| D-003 | 无账号、云服务、排行榜，分享只传JSON | 数据与维护边界 | raw-input.md | 用户已确认 | 新需求涉及协作/同步 |
| D-004 | 本机离线静态网页 + React/TS/Vite + Node内置服务 | 单人两周、能借鉴已有网页方法、无运行服务费项 | docs/architecture/ADR-001-offline-local-tool.md | 建议，未验证 | 拒绝Node/本机启动、要求原生安装或复杂运行时 |
| D-005 | 固定origin、本机JSON存储与规范文件导入/导出 | 刷新恢复与朋友文件共享；不同浏览器不会共享存储 | ADR-001数据与地址策略 | 建议，未验证 | 数据规模/多关卡/自动同步变化 |
| D-006 | 单层有限网格、内置原创地块、俯视四向试走 | 首版范围可由一人维护；预览玩法尚未给定 | brief.md首版范围与假设 | 假设，待首次预览评审 | 用户要求平台跳跃、敌人、复杂物理 |
| D-007 | 显式保存；未保存刷新恢复上次成功保存；导入先不覆盖保存点 | 保存、导出与恢复提示保持一致 | brief.md失败行为；ADR-001 | 建议，未验证 | 要求逐步自动恢复或历史版本 |
| D-008 | 不修改game_engineer，实施放在独立目录 | 当前任务边界与并行修改 | raw-input.md、AGENTS.md | 已执行于本次规划（本次只写/tmp） | 用户另授权迁移/集成 |
| D-009 | 所有实施任务保持todo/blocked；计划检查不等于功能验收 | 当前没有新项目实现 | tasks.json、acceptance.md | 当前事实 | 实施后附真实证据更新 |
| D-010 | 参考仓库历史Git快照仅属于game_engineer；新项目尚无Git提交 | 避免状态混用 | reference/game-engineer-context-pack.md、current-repository-evidence.md | 当时观察，保留历史 | 新会话建立独立工程后重新检查 |
| D-011 | 首个测试目标macOS+桌面Chromium，两周暂按10工作日 | 用户未指定OS/浏览器与工时 | 环境信息、brief.md假设 | 假设 | 实际设备/投入能力不一致 |

状态变更记录：本次仅建立规划与只读参考证据。沒有用户访谈、试运行、CI或部署状态升级。

### 来源：handoff/new-session.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

# 给全新会话的接手任务

请接手一个新项目：离线2D关卡拼装工具。附件根目录 /tmp/youzao-fresh-project/，这是规划包，不是已经实现的应用。

先读 handoff/context-pack.md，再读 raw-input.md、README.md、AGENTS.md、docs/project/brief.md、docs/project/decisions.md、docs/architecture/ADR-001-offline-local-tool.md、docs/project/tasks.json、docs/project/delivery-plan.md、docs/project/acceptance.md。以这些拥有源为准；不要重新追问用户已确认的离线/个人/两周/桌面/JSON/无云条件。

本轮任务：实施T-001的独立工程与离线启动骨架，在 /tmp/youzao-fresh-project/implementation/ 写入；先记录实际设备/Node/浏览器及Git状态，建立锁文件和未来 npm run check，再验证固定 http://127.0.0.1:4186 的启动、端口占用行为与离线运行包资源。完成后附命令退出状态和可定位证据，按依赖推进T-002；未执行的核心功能仍保持未完成。

本轮只加载 /Users/bytedance/Documents/coding/game_engineer/.agents/skills/deliver-project/SKILL.md。其他技能路径留在raw-input.md供下一阶段使用。当前计划技术路线为建议，T-001实测后记录采用/验证状态；未知费用/平台不要虚构。

/Users/bytedance/Documents/coding/game_engineer 只读，是其他agents正在修改的参考工程；不得在此处新增或改动新工具。reference/game-engineer-context-pack.md 的 main/HEAD/工作区与说明均属于该参考工程，不是新项目Git。必要时只读当前源文件核对借鉴方法，不能使用参考仓库历史测试或其他agents的CI充作新工具证据。

新工程尚未初始化；不存在package命令不表示检查通过。若初始化Git，只报告新目录自己的状态；如果暂不建Git，提交/CI状态记“无”。/tmp容易被清理，工程建立后整理可迁移包，迁到长期路径需按当时授权执行。

验收以任务证据为准：本机打开、断外网冷启动、同origin刷新/重开、独立会话文件往返、第二设备分别记录。第二设备缺失就保持对应任务阻塞，继续本机可独立完成的内容。不要使用工具向朋友发消息或文件，文件分享验收可用已提供的本地第二设备。

### 来源：README.md
状态：读取当前工作区文件；内容陈述尚未独立复核。

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

## 遗漏与状态限制
- 仅收录约定或显式指定的项目文本来源；没有全量读取源代码或聊天历史。
- 排除.env、personal/private、凭据、二进制、大文件、视频原件、录屏、node_modules和输出文件。
- 不读取远程URL或密钥配置；个人联系方式和明显密钥模式仅作尽力脱敏，分享前仍需检查。
- 未运行构建、测试、CI、部署或渲染；文档内结果属于有来源的历史陈述，需在新会话复核。

## 新会话任务
读取当前README.md与AGENTS.md遵守仓库规则；本次项目来源为：`AGENTS.md`、`raw-input.md`、`handoff/current-state.md`、`docs/project/decisions.md`、`handoff/new-session.md`、`README.md`。
以这些来源核对当前Git、项目目标、决策和任务；不要把其他子项目的默认文档混作拥有源。只加载一个最相关skill，指出仍有效的决策、阻塞与下一步；实施后记录真实验证结果。独立验收只接收skill路径、任务和原始输入，不沿用前一会话的预期答案。
