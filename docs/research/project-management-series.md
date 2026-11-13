# 项目管理：S2-0 至 S2-8 全集研究

研究日期：2026-11-13。作者卡普迪姆（MID312249633），[合集](https://space.bilibili.com/312249633/lists/8719249?type=season)。入口 BV1pwnj6BEMP 是 S2-0，仅一个 P；后八集是同一合集中的独立 BV。九集标称共 3,554 秒（59:14）。映射来自 [官方 view API 的合集列表](https://api.bilibili.com/x/web-interface/view?bvid=BV1pwnj6BEMP)，并与原作者 README 互相核对。

## 研究方法

九集完整公开音轨全部在本地用 faster-whisper1.2.1 与已有缓存 `Systran/faster-whisper-small` 转写；模型revision `536b0662742c02347bc0e980a01041f333bce120`，CPU int8、中文、beam3、VAD，关闭跨段文本条件。音轨从内存解码，不写入项目；未读取浏览器登录数据、未把媒体发到第三方 ASR。所有转写任务实际完成。

原作者五个 SKILL.md 及部分上游资料完整读取。时间点是机器识别近似值，术语以原始规范校对。没有逐帧观看九集，也没有独立核实视频中的模型跑分、所有平台现价和第三方体验。匿名字幕为空不能证明登录后不存在字幕。项目只保存归纳和时间证据，原件/全文字幕不再发布。

## 九集清单与正文要点

| 集数 | 标题 | BV | CID | 秒 |
|---|---|---|---|---:|
| S2-0 | 给你一个学 AI 的理由 | BV1pwnj6BEMP | 42859757674 | 346 |
| S2-1 | 你真的会用 GitHub 吗？ | BV1Y8aL6SEit | 42722856596 | 361 |
| S2-2 | 写代码之前，先让 AI 拷打你 | BV1irHx6dEEf | 42722528254 | 333 |
| S2-3 | 别随便让 AI 替你选技术栈！ | BV1TtpL6SEvg | 42910811330 | 328 |
| S2-4 | 如何防止 AI 越改越崩！ | BV1JynA6aEug | 42904913012 | 401 |
| S2-5 | AI 写好项目，怎么让别人用？ | BV1kJJr6uEzy | 42750838123 | 311 |
| S2-6 | 别再手动帮 AI 点测试了！ | BV1BgH36DE7y | 43030022264 | 585 |
| S2-7 | 一眼 AI 味？把网页的 AI Slop 洗掉 | BV1pbxr6REJi | 43198580136 | 407 |
| S2-8 | 感觉模型降智了怎么办？ | BV1Gu4L6iEdc | 43393483954 | 482 |

机器可读的逐集 URL、章节证据、取得方法与固定原仓库见 [series-manifest.json](series-manifest.json)。

### S2-0：先复用，明确长期使用条件

01:38–02:13：重复工作可以用确定性脚本；02:31–03:18：长期工具要考虑存储、同步、追加功能、备份恢复；04:39–05:15：查开源轮子，再需求、选型、测试、备份、部署维护。迁移：先确定游戏创作实际动作，不能用“页面生成”表示完成。

### S2-1：评估来源与复用方式

00:29–01:19：区分 Git 与 GitHub，先查已有实现；01:25–02:16：Star 不能证明质量；02:24–03:40：区分 ZIP、clone、fork，检查许可证和保留版权；04:00–04:15：Agent 可用官方 gh 查询仓库、issue、PR。迁移：记录引擎、组件和素材的来源与许可证。

### S2-2：只追问改变方案的取舍

01:37–01:51：事实由 AI 查询，用户目标和取舍才询问；03:12–03:23：案例第一版只保留创建排练、成员、曲目、备注；03:44–04:00：框架和价格查资料，维护意愿属于用户决定；04:47–05:19：记录已定、未定和未想到的问题。原技能 grill。迁移为 `discover-project`：玩法/第一版范围、决策、PRD 与验收。

### S2-3：方案写清维护成本

01:05–01:53：Choose Boring Technology；02:17–02:45：按真实经历问维护能力；02:49–03:18：现查价格额度与地区；03:19–04:07：每套方案写账号、续费、备份等自管事项；04:25–04:56：结论、理由、待定问题写成记录，architect 先读再问。迁移为 `choose-project-stack`：两三方案、维护清单、ADR，不凭经验编造当前服务价格。

### S2-4：小步保存，规则可执行

02:00–02:56：commit 为快照，实验用分支；04:37–05:10：短 AGENTS 指向决策与底线；05:12–05:51：规则文件没有强制保证，重要规则转检查。迁移：Git 小步提交、短路由与实际可执行的 source budget / skill 检查。游戏资产版本策略按用途判断，不机械忽略所有媒体。

### S2-5：上线与数据保存分别验收

00:19–00:48：他人手机可打开和 A 写 B 可见是两个条件，localhost 只指当前设备；01:54–02:29：静态/serverless/自租服务器维护责任不同；02:47–03:14：本人完成开户支付，密钥留平台后端；04:35–04:50：网址可访问而刷新丢数据，说明上线不等于持久化。迁移：本地保存、公开访问和多人共享分开报告。

### S2-6：行为证据与防重犯检查

00:13–00:19：此前数据只在网页内存；01:12–01:44：测保存、读取、删除、并发；04:00–04:32：反对假装测试、照实现抄答案与变量名测试；05:45–06:04：真实浏览器操作截图；08:07–08:45：交证据，重犯升为结构/检查并证明能拦，只守用户能感知的行为。迁移为 `deliver-project`：真实保存刷新、场景编辑、导出重新打开、任务阻塞及 GitHub CI 证据。

### S2-7：按工具用途做视觉减法

03:33–04:24：删无信息装饰、重复文字，卡片拍平、操作直接反馈；04:25–05:10：桌面和手机截图逐项检查，修后重拍，DESIGN记录审美纠正。原技能 de-slop。迁移：统一设计约束和实际截图验证，保留帮助场景创作的信息，不盲目移除所有视觉表达。

### S2-8：唯一规则来源，重建当前事实

01:49–02:25：业务规则只一处，先搜后写，清死代码与旧稿；02:30–03:08：独立 agent 研究，向主任务返回精炼结论；03:49–04:26：约20KB代码检查，跳过锁和生成文件；04:34–05:24：短 AGENTS、按需文档与工具；05:34–06:45：compact 或新对话，以当前代码和 Git 为事实。迁移为 `recover-project-context`：从真实项目生成有来源和缺口的交接包，让新上下文执行独立任务。20KB÷4是近似字节规则，不是准确中文 token 数。

## 固定原始规范与上游归因

原仓库 [nagi-studio/skills](https://github.com/nagi-studio/skills)，本次读取 SHA `b7bb3ee09f502ffd68cee984b8344b2af3b616e6`，MIT / 2026 Nagi Studio：

- [grill](https://github.com/nagi-studio/skills/blob/b7bb3ee09f502ffd68cee984b8344b2af3b616e6/skills/pondering/grill/SKILL.md)
- [architect](https://github.com/nagi-studio/skills/blob/b7bb3ee09f502ffd68cee984b8344b2af3b616e6/skills/rookie/architect/SKILL.md)
- [prove-it](https://github.com/nagi-studio/skills/blob/b7bb3ee09f502ffd68cee984b8344b2af3b616e6/skills/rookie/prove-it/SKILL.md)
- [de-slop](https://github.com/nagi-studio/skills/blob/b7bb3ee09f502ffd68cee984b8344b2af3b616e6/skills/rookie/de-slop/SKILL.md)
- [tidy](https://github.com/nagi-studio/skills/blob/b7bb3ee09f502ffd68cee984b8344b2af3b616e6/skills/rookie/tidy/SKILL.md)

作者 README 归因 Matt Pocock grilling/tdd、Poteto correct、Voyager verify-in-browser、Dan McKinley [Choose Boring Technology](https://mcfunley.com/choose-boring-technology)；相应原文已读。de-slop 与大小 hook 的 X 推文记录为作者归因，未独立取得完整 X 正文。

## 原创 demo 与实际验收边界

工作台的四个项目 skill 分别提供输入、决策和可下载产物。看板不能在依赖未满足或无证据时虚报完成。页面内的规则式需求/选型 demo 不冒充云端 AI 服务；自由输入不自动发给第三方。本地存储只属于当前浏览器，不能表示多设备同步。

实际交付需要本机运行、保存后恢复、导出重新打开与浏览器操作证据。公开 demo 访问只有实际部署并从新上下文打开才记为已验证；多人数据库功能不在本版范围。全体原创 skill 与示例不复制原技能全文或课程案例。
