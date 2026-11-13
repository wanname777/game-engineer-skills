# 方法与依赖来源

本项目原创实现六个 skill、交互界面、游戏场景、动画和合成音效。以下作者的公开视频与公开规范为方法研究来源，具体可追溯证据见 docs/research；未将原视频或完整字幕再发布。

- 歸藏的AI工具箱：[dsh-guizang-design](https://github.com/op7418/dsh-guizang-design)，参考提交 `d16cea63497e1c6a95a63804b5274f93939ddb1d`。借鉴统一设计系统、结构化标注后确定性渲染、作品复用的方法；本项目未复制其模板或代码。
- code秘密花园 / ConardLi：[garden-skills / motion-showreel](https://github.com/ConardLi/garden-skills)，参考提交 `08150e750bdc8c8dc452fb43c8ef5221b71c4308`。借鉴按时间渲染与共享音画时间轴、风格帧和数值验证的方法；本项目独立实现渲染、音频和导出脚本。
- 卡普迪姆 / Nagi Studio：[nagi-studio/skills](https://github.com/nagi-studio/skills)，参考提交 `b7bb3ee09f502ffd68cee984b8344b2af3b616e6`，MIT，Copyright 2026 Nagi Studio。借鉴 grill、architect、prove-it、de-slop、tidy 的流程；本项目独立编写游戏项目场景中的操作规范。

软件依赖：React / React DOM（MIT）、Vite（MIT）、TypeScript（Apache-2.0）、Vitest（MIT）、Playwright（Apache-2.0）、axe-core（MPL-2.0）。npm 锁文件固定实际版本；许可证随各依赖分发。

`@ffmpeg-installer/ffmpeg` 是 FFmpeg 安装包装器。动画导出会调用其当前平台二进制（FFmpeg LGPL/GPL 取决于构建选项，H.264 编码构建通常启用 GPL）。本仓库不再分发该二进制；`npm ci` 按平台安装。导出的原创视频本身使用本项目许可证。
