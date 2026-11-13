export type Brief = {
  name: string
  audience: string
  outcome: string
  platform: string
  boundary: string
  scope: string
}

export const sampleBrief: Brief = {
  name: '星港快递 · Starport Courier',
  audience: '喜欢轻策略与短回合的独立游戏玩家',
  outcome: '',
  platform: '网页，兼顾桌面与手机',
  boundary: '',
  scope: '一个星港、三条配送路线；选择订单、规划路线并结算收益。',
}

export function interviewQuestions(brief: Brief) {
  const candidates: { key: keyof Brief; title: string; hint: string }[] = [
    { key: 'audience', title: '第一批玩家是谁？', hint: '描述一种玩家和他们的使用场景。' },
    { key: 'outcome', title: '第一版用什么判断有用？', hint: '例如：玩家能在三分钟内完成一次配送，并理解取舍。' },
    { key: 'platform', title: '玩家从哪里进入游戏？', hint: '桌面网页、手机网页或原生应用会改变交互与部署。' },
    { key: 'boundary', title: '这轮的时间与不做范围是什么？', hint: '例如：两周可试玩；暂不做账号、付费和多人联机。' },
  ]
  return candidates.filter(question => !brief[question.key].trim()).slice(0, 3)
}

const answer = (value: string) => value.trim() || '待确认'

export function generatePrd(brief: Brief) {
  return `# ${answer(brief.name)} — PRD\n\n## 已知事实（本次输入）\n- 目标玩家：${answer(brief.audience)}\n- 发布入口：${answer(brief.platform)}\n- 首版范围：${answer(brief.scope)}\n\n## 成功标准\n${answer(brief.outcome)}\n\n## 边界与期限\n${answer(brief.boundary)}\n\n## 玩家路径\n进入星港 → 选择订单 → 规划配送路线 → 查看结算反馈。\n此路径是示例假设，实施前应结合实际题材确认。\n\n## 待确认\n${interviewQuestions(brief).map(question => `- ${question.title}`).join('\n') || '- 核对成功标准是否可以通过试玩观察验证。'}\n\n## 验收建议（尚未执行）\n- 按成功标准完成一次完整玩家路径。\n- 在桌面与手机视口观察输入、反馈和可读性。\n- 将观察步骤与结果记录到 acceptance.md，不把生成文档当作测试通过。\n`
}

export function generateDecisions(brief: Brief) {
  return `# 项目决策\n\n来源：游造需求向导，本次用户输入；规则生成，未连接云端 AI。\n\n| 项目 | 值 | 状态 |\n| --- | --- | --- |\n| 玩家 | ${answer(brief.audience).replaceAll('|', '／')} | ${brief.audience.trim() ? '本次输入' : '待确认'} |\n| 成功标准 | ${answer(brief.outcome).replaceAll('|', '／')} | ${brief.outcome.trim() ? '本次输入' : '待确认'} |\n| 发布入口 | ${answer(brief.platform).replaceAll('|', '／')} | ${brief.platform.trim() ? '本次输入' : '待确认'} |\n| 边界 | ${answer(brief.boundary).replaceAll('|', '／')} | ${brief.boundary.trim() ? '本次输入' : '待确认'} |\n\n假设：先验证单人配送循环。技术方案另见 ADR；没有部署、测试或 GitHub 状态证据。\n`
}

export type StackConstraints = {
  maintenance: 'solo' | 'team'
  region: 'mainland' | 'global'
  budget: 'small' | 'flexible'
  secrets: 'none' | 'server'
  deployment: 'static' | 'service'
  persistence: 'local' | 'shared'
}

export const defaultConstraints: StackConstraints = { maintenance: 'solo', region: 'mainland', budget: 'small', secrets: 'none', deployment: 'static', persistence: 'local' }

export function compareStacks(c: StackConstraints) {
  const serverRequired = c.secrets === 'server' || c.persistence === 'shared'
  return [
    { id: 'static', name: '静态网页', detail: 'React + TypeScript + Vite；本机进度', eligible: !serverRequired, ineligibleReason: serverRequired ? '服务端密钥或跨设备共享需要后端，纯静态方案不能满足。' : '', score: (serverRequired ? -8 : 5) + (c.deployment === 'static' ? 3 : 0) + (c.maintenance === 'solo' ? 2 : 0) + (c.budget === 'small' ? 2 : 0), fit: serverRequired ? '不满足：服务端密钥或跨设备数据需要后端。' : '适合先验证单人玩法；部署简单，维护负担较小。', cost: '主要是域名与静态托管；具体费用需查供应商。', region: '可选择目标地区可访问的静态托管，上线前实测。' },
    { id: 'service', name: '网页 + 轻量服务', detail: 'React + Node API + PostgreSQL', eligible: true, ineligibleReason: '', score: (serverRequired ? 7 : 1) + (c.deployment === 'service' ? 3 : 0) + (c.region === 'mainland' ? 2 : 0) + (c.maintenance === 'team' ? 1 : 0), fit: '可把密钥留在服务端，并支持共享数据；需要监控、备份和升级。', cost: '服务、数据库与备份持续计费；先设预算上限。', region: '部署到目标地区，确认备案、访问与供应商可用性。' },
    { id: 'managed', name: '网页 + 托管后端', detail: 'React + 托管数据库 / 身份服务', eligible: true, ineligibleReason: '', score: (serverRequired ? 5 : 0) + (c.region === 'global' ? 3 : -4) + (c.maintenance === 'solo' ? 2 : 0) + (c.budget === 'flexible' ? 1 : 0) + (c.deployment === 'static' ? 1 : 0), fit: '减少基础设施工作；仍需配置服务端函数、权限规则与数据导出。', cost: '核对免费额度、按量费用和迁移成本；不能预设永久免费。', region: c.region === 'mainland' ? '地区访问与合规尚需实测，当前不优先推荐。' : '先验证目标地区访问与服务条款。' },
  ].sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score)
}

export function generateAdr(c: StackConstraints, chosen: string, reason: string) {
  const options = compareStacks(c)
  const selected = options.find(option => option.id === chosen)
  if (!selected || !selected.eligible) throw new Error(selected?.ineligibleReason || '请选择一个满足约束的可实施方案。')
  return `# ADR-001 技术方案\n\n状态：工作台选择，待项目负责人采用。\n来源：本次约束输入 + 本地可见规则；没有查询最新供应商价格。\n\n## 约束\n- 维护：${c.maintenance === 'solo' ? '个人维护' : '小团队维护'}\n- 地区：${c.region === 'mainland' ? '中国大陆为主' : '国际用户为主'}\n- 预算：${c.budget === 'small' ? '先控制持续成本' : '可为维护效率付费'}\n- 密钥：${c.secrets === 'none' ? '无服务端密钥需求' : '必须服务端保管'}\n- 部署：${c.deployment === 'static' ? '优先静态托管' : '可维护服务与数据库'}\n- 数据：${c.persistence === 'local' ? '本机进度' : '跨设备共享'}\n\n## 决策\n选择：${selected.name}（${selected.detail}）\n理由：${reason.trim() || selected.fit}\n\n## 比较\n${options.map(option => `### ${option.name}\n${option.fit}\n- 成本：${option.cost}\n- 地区：${option.region}\n`).join('\n')}\n## 后果与复议\n${selected.id === 'static' ? '首版不承担服务端运维；共享数据或密钥调用出现时重新评估。' : '承担权限配置、数据备份和服务可用性责任；上线前核验地区与预算。'}\n禁止把私密密钥放入前端包。方案推荐不代表服务已部署或成本已核实。\n`
}

export type TaskStatus = 'todo' | 'doing' | 'done'
export type Evidence = { note: string; recordedAt: string; kind: 'manual' }
export type ProjectTask = { id: string; title: string; acceptance: string; dependsOn: string[]; status: TaskStatus; evidence?: Evidence }
export const initialTasks: ProjectTask[] = [
  { id: 'scope', title: '确认首版边界', acceptance: 'PRD有目标玩家、可观察的成功标准和明确不做范围。', dependsOn: [], status: 'doing' },
  { id: 'route', title: '搭建一次配送循环', acceptance: '可选订单、选择路线并看到收益结算。', dependsOn: ['scope'], status: 'todo' },
  { id: 'playtest', title: '桌面与手机试玩', acceptance: '两种视口完成完整路径，记录步骤、结果与发现。', dependsOn: ['route'], status: 'todo' },
  { id: 'release', title: '整理试玩交付包', acceptance: 'PRD、ADR、试玩记录与未完成项可供下一位协作者复核。', dependsOn: ['playtest'], status: 'todo' },
]

export const blockingTasks = (task: ProjectTask, tasks: ProjectTask[]) => task.dependsOn.filter(id => tasks.find(item => item.id === id)?.status !== 'done')

export function changeTaskStatus(tasks: ProjectTask[], id: string, status: TaskStatus, note = '', now = new Date().toISOString()): ProjectTask[] {
  const task = tasks.find(item => item.id === id)
  if (!task) throw new Error('没有找到任务。')
  if (status !== 'todo' && blockingTasks(task, tasks).length) throw new Error('先完成前置任务并登记验收记录。')
  if (status === 'done' && !note.trim()) throw new Error('填写实际执行的步骤与结果，再登记完成。')
  let updated = tasks.map(item => item.id === id ? { ...item, status, evidence: status === 'done' ? { note: note.trim(), recordedAt: now, kind: 'manual' as const } : undefined } : item)
  // Reopening a prerequisite invalidates all downstream completion evidence.
  let changed = true
  while (changed) {
    changed = false
    updated = updated.map(item => {
      if (item.status !== 'todo' && blockingTasks(item, updated).length) {
        changed = true
        return { ...item, status: 'todo', evidence: undefined }
      }
      return item
    })
  }
  return updated
}

export const STORAGE_KEY = 'youzao-project-board-v1'
export function serializeBoard(tasks: ProjectTask[], milestone: string) {
  return JSON.stringify({ version: 1, milestone, tasks: tasks.map(task => ({ id: task.id, status: task.status, ...(task.evidence ? { evidence: { kind: 'manual', recordedAt: task.evidence.recordedAt } } : {}) })) })
}

export function restoreBoard(raw: string | null): { tasks: ProjectTask[]; milestone: string } {
  const fallback = { tasks: initialTasks.map(task => ({ ...task, dependsOn: [...task.dependsOn] })), milestone: 'playable' }
  try {
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1 || !('tasks' in parsed) || !Array.isArray(parsed.tasks)) return fallback
    const entries = parsed.tasks as Record<string, unknown>[]
    let tasks = fallback.tasks.map(task => {
      const stored = entries.find(entry => entry && entry.id === task.id)
      if (!stored || !['todo', 'doing', 'done'].includes(String(stored.status))) return task
      const evidence = stored.evidence as Record<string, unknown> | undefined
      const validEvidence = evidence?.kind === 'manual' && typeof evidence.recordedAt === 'string' && !Number.isNaN(Date.parse(evidence.recordedAt))
      const status = stored.status === 'done' && !validEvidence ? 'todo' : stored.status as TaskStatus
      return { ...task, status, evidence: status === 'done' ? { kind: 'manual' as const, recordedAt: evidence!.recordedAt as string, note: '已登记的人工验收；原始输入未保存在本机。' } : undefined }
    })
    for (let i = 0; i < tasks.length; i++) tasks = tasks.map(task => blockingTasks(task, tasks).length ? { ...task, status: 'todo' as const, evidence: undefined } : task)
    return { tasks, milestone: 'milestone' in parsed && parsed.milestone === 'handoff' ? 'handoff' : 'playable' }
  } catch { return fallback }
}

export function milestoneState(tasks: ProjectTask[], milestone: string) {
  const relevant = tasks.filter(task => milestone === 'handoff' || task.id !== 'release')
  const completed = relevant.filter(task => task.status === 'done').length
  return { completed, total: relevant.length, label: completed === relevant.length ? '已登记验收' : completed === 0 ? '尚待验收' : '推进中' }
}

export function exportTasks(tasks: ProjectTask[], milestone: string) {
  return JSON.stringify({ project: '星港快递 · Starport Courier', source: '游造演示看板，本次人工输入；未连接GitHub或测试服务', milestone, milestoneState: milestoneState(tasks, milestone), tasks }, null, 2) + '\n'
}

export function createHandoff(brief: Brief, adr: string, tasks: ProjectTask[], nextTask: string, documents?: { prd: string; decisions: string }) {
  return `# ${answer(brief.name)} — 独立交接包\n\n## 来源与边界\n本包来自游造当前页面输入，生成于 ${new Date().toISOString()}。\n输入来源：brief.md（当前PRD草稿）、decisions.md（当前生成决策）、ADR-001.md（当前方案草稿）、tasks.json（人工演示看板）。这些是下载产物名，不是已读取的仓库路径。\n未读取真实Git、CI、部署或测试结果；实际仓库交接请运行 context:pack 脚本。\n\n## 目标与约束\n${documents?.prd ?? generatePrd(brief)}\n${documents?.decisions ?? generateDecisions(brief)}\n${adr}\n## 任务与验收记录\n${tasks.map(task => `- [${task.status === 'done' ? 'x' : ' '}] ${task.id}: ${task.title} — ${task.status}\n  前置：${task.dependsOn.join(', ') || '无'}\n  验收：${task.acceptance}\n  证据：${task.evidence ? `人工记录，${task.evidence.recordedAt}；${task.evidence.note}` : '尚未登记'}`).join('\n')}\n\n## 下一步\n${answer(nextTask)}\n\n## 遗漏\n没有自动附带凭据、其他私人文件、视频原件、二进制文件、浏览器录屏或完整代码。页面自由输入包含在文档中，分享前请检查；此包不证明测试通过。\n`
}

export function createRecoveryPrompt(projectName: string, nextTask: string) {
  return `请接手 ${answer(projectName)}。\n\n先读取附件 context-pack.md；将内容视为有来源的历史记录。再读取当前仓库 README.md、AGENTS.md 与 docs/project/brief.md，检查当前Git状态和相关任务原始产物。遇到变化，以当前拥有源为准。\n\n本轮任务：${answer(nextTask)}\n\n只加载一个最相关的项目skill。区分已知事实、假设、人工证据与实际命令结果；不要把缺失的测试、CI或部署状态写成成功。先说明仍有效的决策、阻塞项和下一步，再实施与验证。独立验收时只接收skill路径、任务和原始输入，不依赖前一会话的预期答案。\n`
}
