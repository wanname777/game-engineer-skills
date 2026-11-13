# 游造 · 实际验收记录

记录日期：2026-11-13（中国时间）。以实际运行结果为准；网页看板中的人工记录、自动测试、GitHub CI 与公开部署分别记录。

## 当前本地结果

`npm run check` 已实际退出 0：

| 范围 | 结果 | 证据 |
|---|---|---|
| 六个 skill | 名称、metadata、模板、引用与UI提示词全部有效 | `scripts/validate_skills.py` |
| 源文件上下文预算 | 全部受检源文件≤20KiB | `scripts/check_context_budget.py` |
| 独立交接脚本 | 4个测试通过：预算、脱敏、缺失/失败状态、显式来源 | skill内 `test_context_pack.py` |
| TypeScript与构建 | 编译通过，正式网页构建成功；MP4实际进入dist | package锁文件、Vite输出 |
| 核心行为单测 | 15个通过（设计4、项目8、动画3） | `src/features/**/model.test.ts`、`timeline.test.ts` |
| 浏览器验收 | 26个通过：桌面1440×1000与手机390×844，含两个新题材入口 | `tests/e2e/workbench.spec.ts` |
| 可访问性与布局 | 3工作区×2视口，WCAG2A/AA、2.1AA扫描0违规，无水平溢出 | browser screenshot与axe结果 |
| 依赖检查 | `npm audit` 当前0已知漏洞 | 当前npm锁文件 |

浏览器流程包括：真实对象修改和键盘移动；版本保存、复制、未保存修改不污染快照和刷新恢复；坏JSON/存储配额失败反馈；主题与JSON一致；介绍页原文保留与HTML转义；PRD/ADR/人工修改交接；任务依赖、空证据拦截与下游失效；不能选违反后端硬约束的静态方案；过期ADR不可下载；动画乱序重现、播放逐帧及实际MP4文件。

桌面与手机截图位于 [images](images)。截图已实际查看。移动端按同一套真实交互进行检查，不只检查CSS宽度。

## 原创动画实际产物

[星港快递 MP4](../demos/motion/output/starport-courier.mp4)：14秒，1280×720，30fps，420帧，H.264/yuv420p + AAC。画面、人物、场景、时间轨和声音原创。

正式渲染脚本与skill wrapper均实际运行成功。三个时间点乱序重复seek的像素哈希一致；无黑帧和页面错误；音频 peak −17.8dBFS、mean −34.1dBFS，无削波。指标和原始源哈希见 [metadata](../demos/motion/output/starport-courier-metadata.json)，编码/解码记录见 [log](../demos/motion/output/starport-courier-validation.log)。已实际查看封面、三张风格帧与六帧分镜；没有把自动音量检查描述成人工听感评价。

## 独立新上下文试用

独立任务只给skill路径、题目和原始约束，不提供实现作者的预期答案；输出先放临时目录，不修改主项目。原创复用产物已在 [demos/reuse](../demos/reuse/README.md) 保存：

- 设计：换题材「月面温室」，保留三种种植格/每轮一移动/十轮目标；字面植物标签 `<script>alert('seed')</script>` 作为文字显示，无脚本和弹窗。390/1440两档实际打开、下载和键盘/触控检查通过，axe零违规。
- 动画：换成「月面花园」8秒故事，独立时间函数/三风格帧/240帧H.264/AAC与完整源代码；9项检查通过，8对乱序seek一致，真实视频播放到结束。视频470383 bytes，音频峰值−17.9dBFS、平均−31.3dBFS，无黑帧/削波，媒体播放和解码帧已实际核对。
- 项目：离线2D关卡拼装工具，四个项目技能串联PRD、决策、ADR、9项依赖任务、12项验收计划与独立交接。26项材料检查退出0，17917-byte交接包无截断。独立审阅发现并修正任务依赖和裸路径歧义。新工具仍是未实施计划，与参考仓库的实际Git状态区分。

恢复技能的独立试用曾发现默认白名单不便接手子项目；修复后支持重复 `--source`，安全路径和页脚指向真实来源，4项脚本测试通过。主线程审查发现静态方案可以绕过后端硬约束，已加入 UI 禁用、ADR拒绝和真实浏览器检查。全项目验收发现色板缺少有效ARIA语义，已修复；还改进了损坏版本数据的明确反馈。所有修复均在最终检查内复跑。

## GitHub与公开访问

仓库为 [wanname777/game-engineer-skills](https://github.com/wanname777/game-engineer-skills)，PUBLIC。首个完整版本 `0f03de2` 的 [检查与发布](https://github.com/wanname777/game-engineer-skills/actions/runs/43389372639) 已实际全部success。公开工作台返回HTTP200：[正式入口](https://wanname777.github.io/game-engineer-skills/)。

每次main push/PR执行同一套检查，公开demo只在检查通过后发布。新增复用入口后本地26个浏览器场景全部通过；`scripts/verify_live_demo.mjs` 可在新浏览器上下文检查线上保存重载、动画任意seek、实际MP4与PRD。最新版本的工作流状态见 [GitHub Actions](https://github.com/wanname777/game-engineer-skills/actions/workflows/verify.yml)。

包含全部复用示例的实现版本 `b87c4bf` 的 [检查与发布](https://github.com/wanname777/game-engineer-skills/actions/runs/43390667247) 已全部success。2026-11-13 16:09中国时间运行了线上独立浏览器验收：[实际报告](live-verification.json)。1440与390两档均HTTP200、保存刷新恢复、时间轴seek、真实738177-byte MP4和PRD生成通过；无页面错误。两个换题材入口均HTTP200、标题可见且无水平溢出。报告中的实现revision是实际验收时版本，后续仅补记此证据文档。

## 范围与限制

11个视频的完整公开音轨均已本地机器转写，两个主要视频另有关键帧核对；不是人工逐字字幕或逐帧观看。原规范均可追溯，见 [研究索引](research/README.md)。

工作台提供浏览器内的原创示例与产物生成，保存属于当前浏览器。首版没有多用户账号、跨设备数据库或云端AI；相应功能不被标记为完成。新题材的界面方案和项目计划不等同已实现游戏。生成的交接包不代表测试、CI或部署通过。
