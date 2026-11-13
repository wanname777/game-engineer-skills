# 星港快递 · 原创发布短片

「一份跨越星河的心意」：用同一只橙色包裹连接三个空间。人物、图形、运动路径和声音均由本项目原创实现。

| 时段 | 画面与承接 | 声音 |
| --- | --- | --- |
| 0–4.5s | 薄荷星港站台，快递员盖件，包裹沿上扬路径进入轨道 | 轻拨弦、发件敲击、出发铃 |
| 4.5–9.5s | 长环形轨道，星球与小飞船建立空间，包裹连续穿行 | 同节拍拨弦、飞行滑音、递进音符 |
| 9.5–14s | 花园落地点，包裹展开心意，片尾标题停留 | 落地滑音、到达和弦、渐弱 |

交互入口：`npm run dev` 后打开 `/#motion`。播放、暂停、拖动、逐帧、速度、声音与风格帧跳转均可操作；声音初始关闭，点击后启用。可保存当前静帧、下载实际 MP4。

实际产物：

- [MP4 成片](output/starport-courier.mp4)：14 秒 / 1280×720 / 30 fps / 420 帧 / H.264 yuv420p / AAC。
- [封面](output/starport-courier-cover.png)、[六帧分镜](output/starport-courier-contact-sheet.png)、[风格帧一](output/starport-courier-style-1.png)、[风格帧二](output/starport-courier-style-2.png)、[风格帧三](output/starport-courier-style-3.png)。
- [原创 PCM 音轨](output/starport-courier-soundtrack.wav)、[元数据与验证](output/starport-courier-metadata.json)、[FFmpeg 解码日志](output/starport-courier-validation.log)。

重新导出：`npm run render:motion`。480p 迭代选项：`npm run render:motion -- --quick`。导出页为 `render.html`，等待 `window.READY` 后调用 `window.render(t)`。预览与导出共用 `src/features/motion/timeline.ts`、`renderer.ts`；画面不累积状态，声音由同一秒数解析合成。

已运行验证：三个时间点乱序重复 seek 的 PNG 哈希完全一致；无黑帧；实际时长、帧率与帧数匹配；音频 peak −17.8 dBFS、mean −34.1 dBFS，无削波；浏览器没有页面错误。桌面与 390px 手机检查了控件和布局，无横向溢出。已查看分镜与界面截图；自动音量验证不等同于人工听感评价。

方法借鉴 code秘密花园的确定性渲染工作流。原视频已做完整音轨的本地机器转写分析和关键帧核对，没有逐帧观看或人工完整回听；固定来源与边界见 [研究说明](../../docs/research/motion-video.md)，操作流程见 [动画 skill](../../.agents/skills/create-motion-showreel/SKILL.md)。
