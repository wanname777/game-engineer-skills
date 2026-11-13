# 固定来源与使用边界

- 作者：code秘密花园（ConardLi）。视频：https://www.bilibili.com/video/BV1f94c6uEr3/ 。
- 原仓库：https://github.com/ConardLi/garden-skills 。固定版本 main `08150e750bdc8c8dc452fb43c8ef5221b71c4308`，避免把后来更新算作当前证据。
- 实际取得完整公开音轨的本地机器转写并核对21张关键帧，另查看稀疏stories。讲解涵盖 `render(3.2)`、逐帧、声音、真实仓库和风格库；不是人工逐字字幕或逐帧观看。详见项目 `docs/research/motion-video.md` 与 `research/owned-video-content/animation-video-notes.md`。
- 方法依据：brief → 三风格帧 → `window.render(t)` → 交互预览 → 逐帧截图 + FFmpeg → 视觉、听感和指标验证。画面与声音共用 timeline，禁止 `render` 中累积状态或使用随机数。
- 证据等级：固定仓库规范、完整音轨机器转写和稀疏画面分别标记，不能互相替代。转写术语以仓库和画面核对；没有完整回听或逐帧核查。游戏短片是本项目原创迁移。对本项目行为以运行脚本、文件、测试、实际查看或听音为证据。

「星港快递 / Starport Courier」的人物、包裹、站台、轨道、画面实现与合成音轨均为本项目原创。借鉴作者的确定性渲染工作流；未复制上游源代码、视频画面、音乐或完整字幕。在项目 THIRD_PARTY_NOTICES.md 同步这一说明。
