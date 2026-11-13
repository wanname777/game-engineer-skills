# 月面花园 · 实际验证记录

所有记录对应本目录新制作的「月面花园」，不使用当前项目旧的「星港快递」成果。

| 项目 | 实际结果 | 证据 |
| --- | --- | --- |
| 风格帧与分镜 | 三张 1280×720 风格帧及六帧 contact sheet 已生成并逐张查看；种子、温室、暖黄色花朵与文字清晰 | `lunar-garden-style-*.png`、`lunar-garden-contact-sheet.png` |
| 行为检查 | `npm run check` 退出 0；9 项检查通过 | `evidence/check-results.json` |
| 确定性 | 0、0.8、3.2、4.1、4.65、6.4、7.4、8s，八对乱序重复 seek 的 PNG bytes / SHA-256 完全相等 | `evidence/check-results.json` |
| 预览控制 | Chromium 实际点击与调整：风格帧跳转、逐帧、拖动、速度、播放/暂停、声音开关；390px 无横向溢出，无页面错误 | `evidence/check-results.json` |
| 视频导出 | `npm run render:motion` 退出 0；240 原创帧；8.00s / 1280×720 / 30fps / H.264 yuv420p / AAC | `evidence/encode.log`、`lunar-garden-validation.log`、`lunar-garden-metadata.json` |
| 黑帧与解码 | FFmpeg 实际解码 240 帧，无 blackdetect 区间 | `lunar-garden-validation.log` |
| 音轨 | 本地合成 48000Hz / 1 channel / 384000 samples；音频 max −17.9dBFS、mean −31.3dBFS，无削波 | `lunar-garden-validation.log`、`lunar-garden-metadata.json` |
| 实际媒体播放 | 实际生成的 MP4 在 HTMLVideoElement 读取为 8s / 1280×720，开启声音从头播放到 ended，未出现媒体或页面错误 | `evidence/media-playback.json`、`evidence/mp4-playing-middle.png`、`evidence/mp4-ended.png` |
| 解码画面查看 | 实际 MP4 的 0.8、4.1、7.4s 解码画面已逐张查看，三幕内容与本题目对应 | `evidence/decoded-*.png` |
| 本机音频播放 | `afplay lunar-garden-soundtrack.wav` 实际退出 0 | `evidence/audio-playback.json` |
| 主观听感 | 未声称已完成主观听感判断；现有证据为本机播放成功、确定性采样与客观音量指标 | 本记录与 metadata 的 humanReview |

Computer Use 浏览器接口尝试返回 `native pipe closed before response`，因此没有宣称该接口检查成功。采用本 skill 指定的 Playwright 检查本地媒体，记录实际播放与解码结果。

本片使用原创几何图形与解析音效，无 API 密钥、外部版权视频或音轨。来源与方法证据等级见 `THIRD_PARTY_NOTICES.md`。本次操作的文件所有权为 `/tmp/youzao-fresh-motion/`；不提交或修改当前项目源码。复现步骤见 `README.md`，精确来源与交付文件哈希见 `SHA256SUMS.json`。
