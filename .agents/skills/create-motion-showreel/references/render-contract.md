# 确定性渲染契约

## 页面

- `window.render(t)`：接受绝对秒数，立即画完这一时刻，不推进任何状态；超界时间夹到 `[0,DUR]`。
- `window.READY`：只在字体与全部素材就绪后变为 true。
- `window.DUR`：总秒数。帧索引 `i` 的时间为 `i/FPS`，范围为 `0..DUR*FPS-1`，不额外编码末端帧。
- `window.__MOTION_SOURCE`：记录共享源路径。
- 浏览器 viewport 与 canvas 像素尺寸等于输出尺寸，deviceScaleFactor=1。

本项目 `src/features/motion/timeline.ts` 定义动作与声音事件；`renderer.ts` 的 `drawFrame(canvas,t)` 绘制全部画面。MotionStudio 与 `demos/motion/render.html` 均调用同一函数。仅外部播放控制可以使用 performance/rAF，并从起始时间和绝对经过时间求 t。

## 声音

`sampleAudio(t)` 是固定包络、解析振荡器与音符表的纯函数。`makeAudioSamples(sampleRate)` 为交互 Web Audio 和导出 PCM 提供同一采样源。预览与导出默认启用时增益均为 0.8；预览初始静音遵守浏览器播放策略。改变速度对应同一时间轴播放率；拖动停止播放，重新播放时从所选偏移开始。

## 输出与验证

`scripts/render-motion.mjs` 默认生成 14 秒、1280×720、30 fps 的视频。`--quick` 输出带 `-quick` 的 854×480 文件，不覆盖正式成片。

正式成果位于 `demos/motion/output/`：

- `starport-courier.mp4`：H.264 yuv420p / AAC / faststart。
- `starport-courier-cover.png` 与 `starport-courier-style-{1,2,3}.png`。
- `starport-courier-contact-sheet.png`：六时刻分镜。
- `starport-courier-soundtrack.wav`：本地生成的 48 kHz 单声道 PCM。
- `starport-courier-metadata.json`：总时长、fps、帧数、来源哈希、乱序 seek 像素哈希、音量及黑帧指标。
- `starport-courier-validation.log`：实际 FFmpeg 解码检查。

脚本使用临时目录存放逐帧图，finally 清理。先编码到临时视频，全部指标通过后才移到交付位置。任一断言失败就以非零状态结束，不声称成片成功。指标要求：重复 seek PNG 完全一致；黑帧区间为空；时长误差 ≤1/FPS；实际 fps 与帧数匹配；音频 peak <0 dBFS 且 mean >−45 dBFS；无页面错误。

视觉验证须检查帧间关系、主体与可读性；听感验证须实际播放音频。自动指标不能证明审美或听感。不要把脚本运行等同于实际听音。
