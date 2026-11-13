# 实际检查记录

最终检查于 2026-11-13 07:54 UTC 附近执行，精确时间见 browser-report.json。使用项目已安装的 Playwright 与 Chromium 158.0.8127.18，运行环境 Node v24.10.0。检查命令 `node /tmp/youzao-fresh-design/check_introduction.mjs` 最终退出码为 0。

| 检查 | 390 × 900 | 1440 × 900 | 证据 |
| --- | --- | --- | --- |
| 实际打开静态页面 | 通过 | 通过 | browser-report.json |
| 三段原文逐字一致 | 通过 | 通过 | 原文段落的 textContent 与本次原始输入一致 |
| 字面植物标签可见 | 通过 | 通过 | 原样显示 `<script>alert('seed')</script>`；script 元素数 0，弹窗数 0 |
| 无横向溢出 | 通过 | 通过 | 文档宽度分别为 390px 与 1440px，与窗口宽一致 |
| 阅读层级与遮挡 | 通过 | 通过 | 实际查看两张最终全页截图；标题、原文、模式、标签与页脚完整可见 |
| 键盘焦点与阅读导航 | 通过 | 通过 | Tab 到入口时有 3px 实线焦点；Enter 后焦点移到 #gameplay |
| 触控阅读入口 | 通过 | 不适用 | 390px 使用真实 Playwright tap，导航 hash 正确 |
| 链接命中尺寸 | 通过 | 通过 | 全部宽高至少 44px；下载入口高度 44px |
| 两个真实 JSON 下载 | 通过 | 通过 | 键盘触发实际下载并保存；解析后分别与 tokens.json、interface-spec.json 一致 |
| 页面错误与外部请求 | 0 / 0 | 0 / 0 | 无 console error、pageerror、弹窗或外部资源请求 |
| Axe 可访问性扫描 | 0 项违规 | 0 项违规 | browser-report.json；不能替代全部辅助技术人工验收 |
| 减少动态效果设置 | 通过 | 通过 | reducedMotion=reduce；页面无自动动画 |

另以 `file:///tmp/youzao-fresh-design/introduction.html` 在 390px 实际打开，原文一致且无横向溢出。页面不依赖联网资源；直接用浏览器打开文件即可阅读。通过本地 HTTP 打开时两个交付链接已验证产生真实下载。

文字对比通过计算检查：正文 10.71、卡片 11.79、辅助文字 6.33、标题区 10.71、按钮 6.92，均大于 4.5:1；结果见 contrast-report.json。最终截图为 introduction-390.png 与 introduction-1440.png，均已实际查看，没有文字遮挡或裁切。窄屏玩法正文自然换行，标签完整处于卡片内；桌面为两列阅读布局。

本次只制作和验证独立介绍页，没有修改当前项目；因此未运行会在当前项目产生构建文件的 npm run check。已对实际交付 HTML 执行上述浏览器行为检查。没有运行游戏场景行为、存档、主题切换、CI、部署或视频渲染；这些不属于本次已实现或已通过的功能。

浏览器检查脚本使用现有项目依赖，所有下载样本、截图、报告与交付均写在 /tmp/youzao-fresh-design/。本地检查服务器在检查后已停止。
