# 动画视频：确定性时间函数与共同音画时间轴

研究日期：2026-11-13。[BV1f94c6uEr3](https://www.bilibili.com/video/BV1f94c6uEr3/)《【经验开源】AI 做动画视频完全指南：原理、技巧、Skill 一次给全》，code秘密花园（MID 474921808），2026-11-02 20:10:06 中国时间发布，标称 942 秒，CID 43264967605。

## 证据与覆盖

[官方元数据](https://api.bilibili.com/x/web-interface/view?bvid=BV1f94c6uEr3) 与视频简介直接指定 [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) 的 `motion-showreel`。作者 GitHub 个人资料链接同一 Bilibili UID。原始规范、README、setup、stack、editor、narration 与风格指南已实际读取。

先实际查看 [videoshot API](https://api.bilibili.com/x/player/videoshot?bvid=BV1f94c6uEr3&cid=43264967605&index=1) 返回的两张稀疏故事板，覆盖 0–937 秒。随后完整公开音轨在本地转写，覆盖约 941 秒、435 段，并另外实际阅读 21 张关键帧。详见 [正文笔记](../../research/owned-video-content/animation-video-notes.md) 与 [方法与覆盖](../../research/owned-video-content/method-and-coverage.md)。故事板的空白格不是视频黑帧。

[播放器 API](https://api.bilibili.com/x/player/v2?bvid=BV1f94c6uEr3&cid=43264967605) 给出以下公开章节：

| 时间 | 公开章节 |
|---|---|
| 00:00–01:00 | 开篇引入 |
| 01:00–07:00 | 视频创作原理 |
| 07:00–10:45 | 视频创作技巧 |
| 10:45–13:26 | 开源 Skill 介绍 |
| 13:26–15:42 | Skill 使用流程 |

该接口提示需登录字幕，匿名列表为空；不能推断视频不存在字幕。官方 AI conclusion 返回 -403。本次没有找到独立作者长文，未用第三方介绍替代正文。

## 正文关键证据

时间来自本地机器转写近似值；代码符号、工具名用画面和原仓库核对。

| 时间 | 已取得的讲解 |
|---|---|
| 01:28–01:57 | 任意时间直接得到对应画面，不依赖上一帧，支持并行取帧和局部修改 |
| 04:58–06:23 | 固定随机种子；画面和声音共用时间表 |
| 07:10–10:33 | 明确对标，比较三种讲法；按拍点组织注意力；使用真实产品资料，分阶段渲染 |
| 13:26–15:17 | brief → 真代码风格帧 → 逐镜制作 → 音轨预览 → 导出 → 抽帧/运动/响度/规格检查 |

关键帧实际展示 `render(3.2)`、逐帧图像与 FFmpeg、HTML/SVG/Canvas/Three.js、音波/节拍、共同时间轴、真实仓库和光标、风格库与最终指标。正文描述的是代码渲染动画，不能将它写成视频生成模型流程。

## 固定原始资料

[原始 Skill 目录](https://github.com/ConardLi/garden-skills/tree/08150e750bdc8c8dc452fb43c8ef5221b71c4308/skills/motion-showreel)，本次 main SHA `08150e750bdc8c8dc452fb43c8ef5221b71c4308`。正式 tag `motion-showreel-v0.2.0` 指向 `2b9a89340b70f632d31c0f1c69fce94a7912423e`；不能认为 main 与发布版本相同。本次主干资料写 43 种风格，manifest 仍有 40 的旧描述。

- `SKILL.md`：需求、brief、风格帧、制作与交付。
- `references/stack.md`：页面渲染契约、素材、确定性、技术选择。
- `references/editor.md`：拖动/逐帧/音轨/循环预览与导出。
- `references/narration.md`：真实 TTS 时长先行，凭据使用环境变量。
- `scripts/setup.sh` / `package.json`：Node18+、Playwright^1.55、Chromium、Tone15.1.22、ffmpeg/ffprobe。

以上路径都相对固定目录。借鉴方法，未复制作者渲染器、模板或素材。

## 制作契约与本项目 workflow

核心接口为 `window.DUR`、`window.render(t)` 和资源加载后的 `window.READY`。相同时间应产生相同画面，允许乱序 seek；禁止依赖上一帧状态、`Math.random()` 或实时钟。预览的播放循环可以调用该函数，正式画面本身按解析时间计算。

本项目原创 `create-motion-showreel` 采用以下流程：

1. 先写主题、时长、画幅、声音和叙事 brief，沿用用户当前授权。
2. 用实际渲染代码产出开场、记忆点和结束风格帧。
3. 将场景、事件与音效时间放在统一 timeline；保持角色与空间承接。
4. 同一 renderer 用于可拖动的网页预览和离线取帧。
5. 用 Playwright 逐帧，再用 FFmpeg 合成原创 PCM 音轨和 H.264 MP4。
6. 检查重复/乱序取帧、时长、帧数、规格、黑帧及音量；另对实际画面进行视觉检查。

本项目使用 Canvas 原创星港场景和确定性 synth，不启用任何 TTS 或云端媒体生成服务，不需要 API key。依赖实际版本见锁文件，不声称与上游配置完全相同。自动数值检查通过不能代表人类听感评价。

## 原创范围与限制

游戏叙事、角色、场景、交互预览、音效与导出脚本为本项目原创。展示短片不冒充真实多人在线游戏；工作台的实际可编辑场景与动画示例分别提供可操作入口。动画渲染与实时游戏状态区分，避免回放受到输入和历史帧影响。

视频已分析完整音轨与关键帧，没有逐帧审查原片运动或人工完整回听。转写可能误识别，关键技术与原始文件交叉核对。尚未运行作者的原插件，交付验证针对本项目自己的实现。
