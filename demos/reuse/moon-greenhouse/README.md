# 月面温室 · 介绍页与界面方案

直接使用浏览器打开 introduction.html 即可阅读。页面采用深绿、米白与暖黄，包含原创温室装饰；完整保留三段提供内容，植物标签作为字面文字安全显示。页面没有外部素材、字体或跟踪请求。

| 文件 | 用途 |
| --- | --- |
| introduction.html | 可独立打开的原创响应式介绍页 |
| gameplay.md | 玩法、模式与植物标签原文 |
| tokens.json | 可复用的颜色、字体、间距、圆角与布局变量 |
| interface-spec.json | 可机器读取的区域、来源、动作、反馈、状态与验收方案 |
| interface-plan.md | 可阅读的界面建议与已知/待定边界 |
| sources.md | 当前输入来源、证据等级与原创说明 |
| validation.md | 实际浏览器检查与限制 |
| browser-report.json、contrast-report.json | 原始行为与对比记录 |
| introduction-390.png、introduction-1440.png | 两档最终全页截图 |
| check_introduction.mjs | 使用项目现有浏览器依赖复核本次 HTML 的脚本 |

介绍页已实现阅读导航与真实设计文件下载。回合 HUD、种植格移动与光照反馈仅在结构化方案中提供设计建议；未实现的联网和排行榜以原文声明。没有给出的种植格名称、地图尺寸、光照规则和回合推进方式保持待定。

原始独立执行输出位于 `/tmp/youzao-fresh-design/`，当时未修改主项目。归档副本位于本目录；截图与原始检查见 validation.md。项目根目录安装依赖后，可用 `node demos/reuse/moon-greenhouse/check_introduction.mjs` 再次检查当前副本，脚本按自身位置定位文件。
