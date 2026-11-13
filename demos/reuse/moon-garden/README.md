# 月面花园 · 原创 8 秒短片

成果在本目录，当前项目源码未被修改。

- `lunar-garden.mp4`：真实逐帧编码的 H.264 / yuv420p + AAC 成片。
- `lunar-garden-style-{1,2,3}.png`：0.8s、4.1s、7.4s 三张 1280×720 风格帧。
- `lunar-garden-cover.png`、`lunar-garden-contact-sheet.png`：封面和六时刻分镜。
- `lunar-garden-soundtrack.wav`：原创本地解析合成音轨，48kHz / mono / PCM 16-bit。
- `index.html`：播放、暂停、任意拖动、逐帧、速度、风格帧跳转与音量开关预览。
- `brief.md`、`brief.json`：故事、分镜、视觉与声音事件。
- `lunar-garden-metadata.json`、`lunar-garden-validation.log`、`evidence/`：真实编码、确定性、行为及媒体播放证据。
- `SHA256SUMS.json`：源文件与交付产物的 SHA-256 和大小。

## 复现

使用 Node >=22.12。本次执行环境为 Node v24.10.0、macOS arm64。临时目录通过 node_modules 符号链接复用已有依赖，未调用 API。`package-lock.json` 已生成，后续在复制后的新目录中可执行：

```sh
npm ci
npx playwright install chromium
npm run check
npm run styles
npm run render:motion
node scripts/review-media.mjs
npm run dev
```

归档副本已经排除了临时 `node_modules` 符号链接，可直接执行 `npm ci`。预览在终端显示的本地地址打开；默认端口为 4187。构建缓存不纳入交付。

`npm run styles` 先输出三张风格帧、封面与 contact sheet。`npm run render:motion` 对 0..239 帧的 `i/30` 秒调用同一渲染函数，合成 384000 个声音采样，然后编码。它先生成临时 MP4，验证通过后才移入本目录；临时逐帧图在 finally 中清理。

`npm run check` 验证故事对象连续性、完整开花、越界夹取、音轨确定性、八个乱序 seek 像素哈希、预览真实行为和手机宽度。`review-media.mjs` 读取实际导出的 MP4，保存三张解码帧，并等待真正的播放结束事件。软件播放与客观音量指标不等同于主观听感；本记录不声称完成了主观听感判断。

系统字体使用 PingFang SC / sans-serif。不同操作系统字体可能影响像素哈希；在同一环境下重复 seek 必须完全一致。来源与原创边界见 `THIRD_PARTY_NOTICES.md`。
