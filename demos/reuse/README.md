# 独立新上下文的复用示例

这些成果由独立的新上下文按给定skill和原始题目制作，先输出到临时目录，再归档到项目。没有向执行者提供原实现的预期答案。它们用来验证方法是否可以迁移到新题材，不复用版权视频或课程素材。

| 示例 | 使用的 skill | 真实产物与结果 |
|---|---|---|
| [月面温室](moon-greenhouse/README.md) | design-game-interface | 原创介绍页、token与结构化方案；390/1440两档、原文转义、下载、键盘触控和axe检查通过 |
| [月面花园](moon-garden/README.md) | create-motion-showreel | 新8秒短片、三风格帧、独立源代码；240帧H.264/AAC，8对seek一致、9项检查、播放到结束 |
| [离线2D关卡拼装工具](offline-level-editor/README.md) | discover-project、choose-project-stack、deliver-project、recover-project-context | PRD、ADR、9项依赖任务、12项验收计划及独立交接；26项材料检查通过，工具本身仍是未实施计划 |

本地工作台启动后可打开 `/reuse/moon-greenhouse/` 与 `/reuse/moon-garden/`。`npm run build` 从本目录的规范来源生成 `public/reuse`；不维护第二份源文件。新clone执行build后这些入口同样可访问。

月面花园可以独立复制目录后按其README安装与重渲染。归档时排除了共享node_modules符号链接和构建缓存。设计浏览器报告记录了原始临时路径，这是当时执行证据，不是当前访问路径。
