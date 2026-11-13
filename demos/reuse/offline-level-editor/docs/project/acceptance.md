# 验收计划与本次真实记录

本轮范围：仅生成新项目规划/交接，未实现关卡工具。原始需求见 raw-input.md，无新项目提交。

## 新工具的可执行验收（全部未执行）

执行前：在 implementation/建立真实工程与依赖；记录OS、设备、Node、浏览器版本、HEAD和工作区；确认启动的是新工具，不是参考仓库的旧网页。npm run check 由T-001建立，包含构建、领域测试和真实浏览器。

| ID / 任务 | 实际要执行的步骤 | 可观察结果与失败门槛 | 计划证据位置 | 当前状态 |
| --- | --- | --- | --- | --- |
| A-001 / T-001 | npm ci；npm run build；启动离线包；在1280×720打开127.0.0.1:4186；另占用该端口再启动 | 新工具可打开；端口占用明确退出而不换origin；运行包不需npm下载 | implementation/artifacts/T-001/commands.txt、device.json | 未执行 |
| A-002 / T-002 | 点击(2,2)放地面、(3,2)放墙；覆盖墙；橡皮擦；边界格放置；键盘移动焦点并放置 | 数据/画面对应、无越界；删除地面清掉所在标记并提示；重复起点是移动而非多个 | artifacts/T-002/behavior.md、domain-tests.txt | 未执行 |
| A-003 / T-003 | 编辑并保存A；再改成B不保存；刷新；关闭浏览器/服务后重启同地址；读取恢复数据 | 两次都恢复A，不是B；name/尺寸/tiles/标记一致；dirty与提示符合实际 | artifacts/T-003/saved.json、restored.json、browser-report/ | 未执行 |
| A-004 / T-003 | 注入不可用存储/配额错误；尝试保存；注入损坏JSON再刷新 | 保存失败不消dirty且仍可导出；损坏恢复提示明确、键不自动覆写、可新建编辑 | artifacts/T-003/failure-report.md | 未执行 |
| A-005 / T-004 | 当前未保存关卡地面通路、墙与空格；放有效起终点；点击预览，方向键走/碰阻挡/到终点，返回编辑；无标记再预览 | 角色被墙/空格阻挡、终点反馈、退出后关卡结构相等；缺标记定位错误留在编辑 | artifacts/T-004/before.json、after.json、browser-report/ | 未执行 |
| A-006 / T-005 | 浏览器下载JSON，实际解析文件；全新浏览器context导入；保存后刷新；重新导出并解析比较 | 字段/值严格相等；编辑画面/标记相同；保存刷新保持一致；独立context没有读取旧origin缓存；试走验收放在A-008/T-006 | artifacts/T-005/exported-a.json、exported-b.json、roundtrip-report.json | 未执行 |
| A-007 / T-005 | 导入语法损坏、版本2、超界、长度不匹配、未知地块、标记在墙上、未知字段、256KiB以上文件 | 拒绝且有具体错误；当前编辑与保存点完全保持；文件大小在读取内容前检查 | artifacts/T-005/invalid-input-report.json | 未执行 |
| A-008 / T-006 | 新建→放地块/标记→预览→返回→保存→刷新→导出→导入另一context→预览→保存→刷新 | 全路径实际可完成；没有console/pageerror；JSON下载存在且可读取 | artifacts/T-006/playwright-report/、trace.zip | 未执行 |
| A-009 / T-007 | build发行包；关原浏览器与本机服务；清缓存或用干净context；断开外网而保留loopback；重启服务与浏览器；执行A-008 | 断外网冷启动成功；所需资源全本地；不能仅使用warm cache；所有外部请求记录 | artifacts/T-007/offline-steps.md、network.json、browser-report/ | 未执行 |
| A-010 / T-007 | 1440×900、1280×720；Tab完成工具选择/文件/保存/预览；箭头操作网格；Escape退出预览；浏览器缩放200% | 核心操作可达、焦点清晰，无页面横向溢出；地图可在自身容器滚动；无核心console错误 | artifacts/T-007/accessibility.md、screenshots/ | 未执行 |
| A-011 / T-008 | 把A-006实际导出的JSON及同版本离线包复制到第二桌面设备；断外网打开、导入、预览、保存、重开、再导出 | 同一结构与预览规则；保存仅该设备缓存；记录真实OS/版本；缺第二设备不能标通过 | artifacts/T-008/device-b.json、reexport.json、steps.md | 未执行 |
| A-012 / T-009 | 当前工程 npm run check；逐项复核证据对应冻结版本；从交付包依说明冷启动；生成新工程上下文包 | 检查退出0且全部核心行为通过；最终包可用；独立会话能按新拥有源继续 | artifacts/T-009/check.txt、bundle-manifest.json、context-pack.md | 未执行 |

A-009自动浏览器可禁止非loopback网络请求并记录尝试，以验证应用无外部依赖；真实“断外网”还需机器网络环境实测。浏览器 context.setOffline(true) 可能同时挡住本机HTTP，不能把此模式错误当成应用离线不支持。服务停止导致127.0.0.1不可访问是运行前置不满足，应与断外网区分。

领域单测应验证规则风险：严格unknown输入校验、大小/版本拒绝、tile索引与标记一致性、JSON往返、preview不改关卡、保存失败不报成功。浏览器必须验证真实点击、实际下载、导入、刷新与网络请求，不以截图替代交互。

手机完整编辑：首版不要求支持，未执行；桌面优先不是手机测试通过。GitHub CI：未建立新工程/远端，未读取检查；部署：离线包计划，未构建，线上不在范围；视频：无任务、未渲染。

## 本轮已执行的规划/参考检查

| 动作 | 实际结果 | 来源/证据 | 限制 |
| --- | --- | --- | --- |
| 读取README/brief/AGENTS与指定四skill、模板 | 已读取；据此生成规划 | raw-input.md中的技能路径；reference/current-repository-evidence.md | 方法应用与源码阅读，不是产品验收 |
| 读取参考保存/恢复/下载源码 | 看到本机版本JSON校验和Blob下载，未看到关卡文件导入 | DesignStudio.tsx、model.ts、InspectorPanel.tsx精确位置见reference | 未在本任务运行网页；其他agents可能继续修改 |
| node --version | 退出0，v24.10.0 | reference/current-repository-evidence.md | 当前开发环境，不是朋友设备 |
| git rev-parse --is-inside-work-tree | 退出0，true | reference/current-repository-evidence.md | 属于game_engineer |
| git rev-parse --verify HEAD | 退出128，fatal: Needed a single revision | reference/current-repository-evidence.md | 当时参考仓库没有可解析HEAD；不能据此快照绑定后续commit的CI |
| 参考恢复脚本 | 退出0，生成15798 bytes | reference/game-engineer-context-pack.md | 只读Git/白名单文档；未运行构建/测试/CI/部署；不属于新项目Git |
| 本规划包JSON/依赖/来源/预算检查 | 实际退出0；16项结构与后续修正检查通过 | checks/planning-validation.json、checks/planning-validation.txt | 只验证材料结构，不验证应用行为 |
| 独立恢复审阅 | 已执行；独立恢复目标/约束/状态/阻塞/下一步，发现依赖与路径缺口并修正 | handoff/recovery-acceptance.md | 最后路径/报告收尾由本次结构复核；不是独立工具测试 |

新项目 npm ci/build/check、浏览器功能、GitHub CI、部署全部未执行。因本任务没有实现代码且不得写参考仓库，不运行参考仓库check造成额外输出，也不把其他agents的测试结果合并到本项目。

## 观察到的阻塞与限制

1. 新工程尚未建立，所有工具功能验收缺实施前置；这是规划任务的当前状态，不是规划生成失败。
2. game_engineer历史快照main但当时HEAD不可解析，工作区有大量未跟踪文件。主线程随后通知已提交/推送及项目检查，本任务未独立核验，不能把历史快照当作最终当前Git状态，也不能将其验收计入新工具。
3. 初始文本搜索包含不存在的src/lib、e2e目录，退出2；已按rg --files与playwright.config.ts纠正，未据缺失目录推断通过。读取时tests/e2e没有在rg文件清单出现，因此本任务未宣称现有浏览器用例完整。
4. 尚未实测离线冷启动、存储失败、第二设备、最终支持OS；任务门槛保留。
5. /tmp材料可能被系统清理；长期维护应迁至持久目录，当前未擅自迁移或建新仓库。
