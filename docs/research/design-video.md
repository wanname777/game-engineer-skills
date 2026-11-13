# 设计视频：统一语言、结构化渲染与作品复用

研究日期：2026-11-13。研究视频 [BV1py4g6TEYc](https://www.bilibili.com/video/BV1py4g6TEYc/)《如何帮 DeepSeek Harness 做出有设计感、没 AI 味的内容？》，作者歸藏的AI工具箱（UID 1741797），2026-11-03 16:10:08 中国时间发布，标称 344 秒，CID 43288822533。

## 取得的证据

- [官方元数据](https://api.bilibili.com/x/web-interface/view?bvid=BV1py4g6TEYc)：简介直接指向作者 `op7418/dsh-guizang-design`，说明多个设计 skill 共用设计系统和 Design Token。
- [同日作者署名公开文章](https://www.163.com/dy/article/LAPTMD180556BM3X.html)：《帮你的 DeepSeek Harness 做出有设计感、没 AI 味的东西》，完整正文已读取。文章与视频同题、同仓库，但不能认定为逐字稿。
- 视频完整公开音轨在本地用已有 small 模型转写，覆盖约 343 秒、170 段；实际阅读并核对 12 张关键帧。详见 [正文分析笔记](../../research/owned-video-content/design-video-notes.md) 和 [方法与覆盖](../../research/owned-video-content/method-and-coverage.md)。
- 原仓库 README、五个 skill 及相关主题/渲染规范实际读取。匿名播放器接口提示 `need_login_subtitle:true` 且字幕列表为空；这不证明登录后不存在字幕。

## 视频正文的关键时间

时间为本地机器转写近似值，术语用原始仓库与画面核对；不能当作人工逐字校对字幕。

| 时间 | 取得的讲解 | 对本项目的启发 |
|---|---|---|
| 01:02–02:14 | 减少自由发挥，固定颜色、字体、间距、主题规则，并检查溢出、重叠和颜色一致性 | 用统一 token 和确定组件渲染，实际检查页面 |
| 02:16–02:55 | 从自己的聊天语气建立语气档案 | 介绍和开发日志遵循已提供事实与措辞 |
| 02:55–04:09 | 多种输出共用设计语言，组合工作流 | 场景界面、介绍页和设计 token 使用相同输入 |
| 04:09–04:38 | 作品库复用上一期内容格式 | 场景保存、复制版本、继承主题 |
| 04:38–05:27 | 插件安装与入口界面 | 为项目提供实际可发现的 skill 与示例 |

## 固定的原始来源

- [整合插件历史 README](https://github.com/op7418/dsh-guizang-design/blob/d16cea63497e1c6a95a63804b5274f93939ddb1d/README.md)。视频发布前的 npm 0.1.3（2026-10-31 发布）gitHead 为 `d16cea63497e1c6a95a63804b5274f93939ddb1d`。不能确定视频实际安装版本。
- [历史 manifest](https://github.com/op7418/dsh-guizang-design/blob/d16cea63497e1c6a95a63804b5274f93939ddb1d/skills/manifest.json) 固定 PPT `93d21bf4a73a851907a6eb00acbf30618236667a`、Social `64d02d435fb092d3b403455a875e842fc8f29b8b`、Pages `bb39103c94c286ea8e729daf40e5ed9348ac608e`、Humanizer `f4518a8eab97b8bfebc66a89d34320a89bef6930`。
- [Page Skill](https://github.com/op7418/guizang-pages-skill/blob/bb39103c94c286ea8e729daf40e5ed9348ac608e/SKILL.md)：Markdown → annotations.json → render.mjs → HTML。模型标注内容的作用，固定脚本匹配原文行并渲染。
- [卡片 Skill](https://github.com/op7418/guizang-social-card-skill/blob/64d02d435fb092d3b403455a875e842fc8f29b8b/SKILL.md)：先选信息/证据再选模板，种子模板约束和截图检查。
- [PPT Skill](https://github.com/op7418/guizang-ppt-skill)：先叙事/大纲/页面目的，再填既有版式，必须看渲染结果。
- [Humanizer-zh](https://github.com/op7418/Humanizer-zh)：保留事实、条件、归因及确定程度，禁止编造细节。
- [语气档案](https://github.com/op7418/dsh-guizang-design/blob/d16cea63497e1c6a95a63804b5274f93939ddb1d/own-skills/guizang-voice/SKILL.md)：每条语气特征至少两处样本证据。

## 提炼的方法与原创迁移

原始工具服务内容生产，本项目将其方法迁移为 `design-game-interface`，独立编写游戏创作界面、场景状态和导出工具。游戏场景不是作者视频中的现成编辑器。

1. 先确定界面的核心动作和信息层级，区分场景、对象属性与作品版本。
2. 对同一项目使用统一颜色、字体角色、间距及按钮规则；主题切换真正改变渲染。
3. 输入结构化场景配置，由固定组件或脚本解释，保留可追溯事实。
4. 原稿与解释内容区分，不把假设或建议写成已经实现的玩法。
5. 保存可复用的版本，复制时继承已有结构与视觉主题。
6. 导出的介绍页和 token 由同一场景数据生成；检查真实渲染与重新打开的结果。

原规范的品牌色方法涉及 OKLCH 与 WCAG/APCA；本项目只对实际使用的主题做对比度与浏览器检查，没有声称复刻原始色彩算法或所有风格。

## 可靠性边界

视频正文证据来自完整音轨机器转写和稀疏关键帧；没有逐帧观看，也没有人工完整回听。作者文章、原始规范和视频证据互相核对，不能互相替代。未实际安装运行原插件；本项目六个 skill 和 demo 是原创实现。音轨、截图与完整字幕只在临时研究目录，不提交到公开仓库。
