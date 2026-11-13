---
name: recover-project-context
description: 从当前Git与项目文档生成有来源、有限体积、明确遗漏的独立上下文交接包及新会话任务。用户要求恢复上下文、清理会话、交接项目、从旧聊天继续或让另一位协作者独立接手时使用；不把历史摘要视为当前验证证据。
---

# 恢复项目上下文

1. 先读README、AGENTS、brief、decisions、tasks、验收记录及当前Git状态。把规则收敛到拥有源：AGENTS写路由与常用命令，领域步骤放skill，长期决策放文档；不要将全部旧聊天复制进新会话。
2. 运行本skill的可移植脚本：
   ```bash
   python3 <skill路径>/scripts/context_pack.py --root <仓库路径> --output /tmp/context-pack.md
   ```
   使用 `--stdout` 输出到终端；默认UTF-8预算20000 bytes，可用 `--max-bytes` 调整。此项目入口为 `python3 scripts/context_pack.py`。项目路径不同或交接的是示例子项目时，重复 `--source <仓库内相对文本路径>` 显式替换默认来源列表；例如 `--source demos/project/brief.md --source demos/project/tasks.json`。不要混淆工作台与示例游戏。脚本是当前规则的单一实现。
3. 检查包中的Git分支/HEAD/工作区、来源路径与状态。不存在、过大、非UTF-8、二进制、符号链接、格式无效和预算截断必须在遗漏中呈现，禁止补猜文件内容。20KB≈5000token只作为体积近似，不是精确中文token计数。
4. 检查敏感内容。脚本只收录白名单项目文档，排除env、私人文件、凭据、视频原件、临时录屏和node_modules；尽力遮盖明显联系方式/密钥模式。分享前人工查看最终包，不默认记录个人信息。项目源资产按既有资产版本策略管理，不能机械地删除所有图片音频视频。
5. 用 [新会话模板](assets/new-session-template.md) 写明确下一步与附件名。要求新会话从当前拥有源核对事实，不重复已确认决策，区分历史陈述、人工记录和实际测试结果。
6. 做独立恢复验收：向新会话只提供skill路径、任务与原始产物；不提供上一会话的预期答案。让其指出目标、有效约束、阻塞项和下一步，再执行适当验证；比较其源依据，修正真实缺口。
7. 清理仅针对已确认无用的草稿、死代码与临时产物。尊重他人修改和项目资产策略；保留仍有用的研究来源。报告实际删改与剩余事项，不因为包已生成就宣称项目已通过验收。

需要理解包边界时读 [包格式](references/package.md)；讨论方法来源时读 [来源](references/sources.md)。
