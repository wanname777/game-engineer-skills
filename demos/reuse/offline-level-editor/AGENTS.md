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
