import { useEffect, useState } from 'react'
import type { Brief, ProjectTask, StackConstraints, TaskStatus } from './model'
import { STORAGE_KEY, blockingTasks, changeTaskStatus, compareStacks, createHandoff, createRecoveryPrompt, defaultConstraints, exportTasks, generateAdr, generateDecisions, generatePrd, initialTasks, interviewQuestions, milestoneState, restoreBoard, sampleBrief, serializeBoard } from './model'
import './project.css'

const stages = [
  { id: 'discover', number: '01', name: '需求访谈', subtitle: '把想法变成边界' },
  { id: 'stack', number: '02', name: '技术选型', subtitle: '选一条合适的路' },
  { id: 'deliver', number: '03', name: '交付看板', subtitle: '带着证据前进' },
  { id: 'recover', number: '04', name: '上下文恢复', subtitle: '让下一次继续' },
] as const
type Stage = typeof stages[number]['id']

function download(name: string, content: string, type = 'text/markdown;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function readInitialBoard() {
  try { return restoreBoard(localStorage.getItem(STORAGE_KEY)) } catch { return restoreBoard(null) }
}

export default function ProjectStudio() {
  const [stage, setStage] = useState<Stage>('discover')
  const [brief, setBrief] = useState<Brief>(sampleBrief)
  const [prd, setPrd] = useState(generatePrd(sampleBrief))
  const [decisions, setDecisions] = useState(generateDecisions(sampleBrief))
  const [constraints, setConstraints] = useState<StackConstraints>(defaultConstraints)
  const [selectedStack, setSelectedStack] = useState<string | null>(null)
  const [stackReason, setStackReason] = useState('')
  const [adr, setAdr] = useState(generateAdr(defaultConstraints, 'static', ''))
  const [initialBoard] = useState(readInitialBoard)
  const [tasks, setTasks] = useState<ProjectTask[]>(initialBoard.tasks)
  const [milestone, setMilestone] = useState(initialBoard.milestone)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [storageIssue, setStorageIssue] = useState(false)
  const [notice, setNotice] = useState('')
  const [nextTask, setNextTask] = useState('核对PRD与ADR，完成下一项未阻塞的任务，并记录实际验收步骤。')
  const [handoff, setHandoff] = useState('')
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, serializeBoard(tasks, milestone)); setStorageIssue(false) } catch { setStorageIssue(true) }
  }, [tasks, milestone])

  const questions = interviewQuestions(brief)
  const options = compareStacks(constraints)
  const chosen = options.find(option => option.id === selectedStack && option.eligible)?.id || options[0].id
  const currentAdr = generateAdr(constraints, chosen, stackReason)
  const adrIsStale = adr !== currentAdr
  const milestoneProgress = milestoneState(tasks, milestone)
  const updateBrief = (key: keyof Brief, value: string) => setBrief(current => ({ ...current, [key]: value }))
  const updateConstraint = (key: keyof StackConstraints, value: string) => {
    setConstraints(current => ({ ...current, [key]: value }))
    setSelectedStack(null)
  }
  const moveTask = (id: string, status: TaskStatus) => {
    try {
      setTasks(changeTaskStatus(tasks, id, status, notes[id] || ''))
      setNotice(status === 'done' ? '已登记人工验收。这条记录不代表自动测试或GitHub检查通过。' : '任务状态已更新；重开前置任务会同时重开下游任务。')
    } catch (error) { setNotice(error instanceof Error ? error.message : '更新失败。') }
  }

  return (
    <div className="project-studio">
      <header className="project-heading">
        <div><p className="eyebrow">PROJECT STUDIO / 项目工作台</p><h2 className="section-title">从第一句话，<br />走到下一次交付。</h2><p className="project-intro">用四个小步骤收拢想法、选择方案、记录证据，再把项目交给未来的自己。</p></div>
        <div className="project-stamp" aria-label="示例项目 星港快递"><span className="project-orbit" aria-hidden="true">✳</span><div><span>正在构建的世界</span><strong>星港快递</strong><small>STARPORT COURIER · 独立游戏样例</small></div></div>
      </header>

      <nav className="project-stages" aria-label="项目管理阶段">
        {stages.map(item => <button key={item.id} type="button" className={`project-stage ${stage === item.id ? 'is-active' : ''}`} aria-pressed={stage === item.id} onClick={() => { setStage(item.id); setNotice('') }}><span>{item.number}</span><div><strong>{item.name}</strong><small>{item.subtitle}</small></div><i aria-hidden="true">↗</i></button>)}
      </nav>
      <p className="project-status" role="status">{notice || (storageIssue ? '此浏览器无法保存进度；当前页面仍可操作与下载。' : '任务进度自动保留在本机。访谈、理由与验收原文只保留在当前页面；请自行下载需要的内容。')}</p>

      {stage === 'discover' && <section className="project-panel" aria-labelledby="discover-title">
        <div className="project-panel-title"><div><p className="eyebrow">01 / DISCOVER</p><h3 id="discover-title">先问值得问的问题。</h3></div><span className="project-chip">本地规则向导 · 无云端 AI</span></div>
        <div className="project-columns">
          <div className="project-form">
            <label>项目名称<input value={brief.name} onChange={event => updateBrief('name', event.target.value)} /></label>
            <label>第一批玩家<input value={brief.audience} onChange={event => updateBrief('audience', event.target.value)} /></label>
            <label>发布入口<input value={brief.platform} onChange={event => updateBrief('platform', event.target.value)} /></label>
            <label>首版可玩内容<textarea rows={3} value={brief.scope} onChange={event => updateBrief('scope', event.target.value)} /></label>
            <div className="project-questions"><div className="project-small-heading"><span>关键追问</span><small>最多 3 个 · 只补未知项</small></div>{questions.length ? questions.map(question => <label key={question.key}>{question.title}<small>{question.hint}</small><input value={brief[question.key]} onChange={event => updateBrief(question.key, event.target.value)} placeholder="写下可以实施的答案" /></label>) : <p>关键条件已补齐。仍可编辑下方成功标准与边界。</p>}</div>
            {brief.outcome && <label>成功标准<textarea rows={2} value={brief.outcome} onChange={event => updateBrief('outcome', event.target.value)} /></label>}
            {brief.boundary && <label>边界与期限<textarea rows={2} value={brief.boundary} onChange={event => updateBrief('boundary', event.target.value)} /></label>}
            <button type="button" className="button button-primary" onClick={() => { setPrd(generatePrd(brief)); setDecisions(generateDecisions(brief)); setNotice('已根据当前输入生成PRD与决策，未知项标记为待确认；可继续编辑草稿。') }}>生成 PRD 与决策 <span aria-hidden="true">↗</span></button>
          </div>
          <div className="project-document"><div className="project-small-heading"><span>PRD 草稿</span><small>可直接修改</small></div><label className="project-sr-only" htmlFor="project-prd">PRD 草稿内容</label><textarea id="project-prd" className="project-doc-editor" value={prd} onChange={event => setPrd(event.target.value)} spellCheck={false} /><div className="project-downloads"><button type="button" className="button button-quiet" onClick={() => download('brief.md', prd)}>下载 PRD ↓</button><button type="button" className="button button-quiet" onClick={() => download('decisions.md', decisions)}>下载决策 ↓</button></div><p className="project-footnote">输入是事实来源，生成的玩家路径是显式假设；文档不会凭空补全期限或测试结果。</p></div>
        </div>
      </section>}

      {stage === 'stack' && <section className="project-panel" aria-labelledby="stack-title">
        <div className="project-panel-title"><div><p className="eyebrow">02 / ARCHITECT</p><h3 id="stack-title">按约束选择，给决定留理由。</h3></div><span className="project-chip">3 个方案 · 可改选</span></div>
        <p className="project-panel-intro">当前发布入口：{brief.platform || '待确认'}。这些约束继承当前项目，再比较维护、地区、预算与数据需求。</p>
        <div className="project-constraints">
          <label>谁来维护<select value={constraints.maintenance} onChange={event => updateConstraint('maintenance', event.target.value)}><option value="solo">个人维护</option><option value="team">小团队维护</option></select></label>
          <label>主要使用地区<select value={constraints.region} onChange={event => updateConstraint('region', event.target.value)}><option value="mainland">中国大陆</option><option value="global">国际用户</option></select></label>
          <label>预算取向<select value={constraints.budget} onChange={event => updateConstraint('budget', event.target.value)}><option value="small">先控制持续成本</option><option value="flexible">可为维护效率付费</option></select></label>
          <label>私密密钥需求<select value={constraints.secrets} onChange={event => updateConstraint('secrets', event.target.value)}><option value="none">没有服务端密钥</option><option value="server">必须由服务端保管</option></select></label>
          <label>部署承受范围<select value={constraints.deployment} onChange={event => updateConstraint('deployment', event.target.value)}><option value="static">优先静态托管</option><option value="service">可维护服务和数据库</option></select></label>
          <label>保存需求<select value={constraints.persistence} onChange={event => updateConstraint('persistence', event.target.value)}><option value="local">仅本机进度</option><option value="shared">跨设备共享数据</option></select></label>
        </div>
        <div className="project-options">{options.map((option, index) => <article key={option.id} className={`project-option ${chosen === option.id ? 'is-chosen' : ''}`}><div className="project-option-top"><span className="eyebrow">方案 {String(index + 1).padStart(2, '0')}</span>{index === 0 && <span className="project-chip">规则推荐</span>}</div><h4>{option.name}</h4><p className="project-option-detail">{option.detail}</p><p>{option.fit}</p><dl><dt>成本与维护</dt><dd>{option.cost}</dd><dt>地区与权限</dt><dd>{option.region}</dd></dl><button type="button" className={`button ${chosen === option.id ? 'button-primary' : 'button-quiet'}`} aria-pressed={chosen === option.id} disabled={!option.eligible} title={option.ineligibleReason || undefined} onClick={() => { setSelectedStack(option.id); setNotice(`已选择${option.name}；生成ADR后会记录你的理由。`) }}>{!option.eligible ? '不满足硬约束' : chosen === option.id ? '已选择 ✓' : '采用此方案'}</button>{!option.eligible && <p className="project-footnote">{option.ineligibleReason}</p>}</article>)}</div>
        <div className="project-adr-row"><label>采用理由或需要保留的取舍<textarea rows={2} value={stackReason} onChange={event => setStackReason(event.target.value)} placeholder="可为空，使用方案说明；不输入任何密钥。" /></label><div className="project-downloads"><button type="button" className="button button-primary" onClick={() => { setAdr(currentAdr); setNotice('ADR已更新：包含选项、采用理由、后果与需要复议的条件。') }}>生成 ADR ↗</button><button type="button" className="button button-quiet" disabled={adrIsStale} onClick={() => download('ADR-001.md', adr)}>下载 ADR ↓</button></div></div>
        {adrIsStale && <p className="project-adr-stale" role="status">约束、方案或理由已改变，ADR草稿需要重新生成。生成交接包时会按当前选择更新ADR。</p>}
        <details className="project-preview"><summary>查看当前 ADR{adrIsStale ? '（待更新）' : ''}</summary><pre>{adr}</pre></details>
      </section>}

      {stage === 'deliver' && <section className="project-panel" aria-labelledby="deliver-title">
        <div className="project-panel-title"><div><p className="eyebrow">03 / DELIVER</p><h3 id="deliver-title">完成，需要可以复核的证据。</h3></div><span className="project-chip">演示任务 · 人工记录</span></div>
        <div className="project-milestone"><div><label>当前里程碑<select value={milestone} onChange={event => setMilestone(event.target.value)}><option value="playable">M1 · 可玩切片</option><option value="handoff">M2 · 试玩交接</option></select></label></div><div className="project-milestone-progress"><div><strong>{milestoneProgress.completed}<span> / {milestoneProgress.total}</span></strong><span>{milestoneProgress.label}</span></div><progress value={milestoneProgress.completed} max={milestoneProgress.total} aria-label="里程碑验收进度" /></div></div>
        <div className="project-board">{tasks.map(task => {
          const blockers = blockingTasks(task, tasks)
          return <article key={task.id} className={`project-task ${blockers.length ? 'is-blocked' : ''}`}><div className="project-task-top"><span className={`project-task-status status-${task.status}`}>{blockers.length ? '等待前置' : task.status === 'done' ? '已登记验收' : task.status === 'doing' ? '进行中' : '待开始'}</span><span className="project-task-id">{task.id.toUpperCase()}</span></div><h4>{task.title}</h4><p>{task.acceptance}</p><p className="project-dependency">{task.dependsOn.length ? `依赖：${task.dependsOn.map(id => tasks.find(item => item.id === id)?.title || id).join(' → ')}` : '依赖：无，可先开始'}{blockers.length > 0 && <strong>前置验收尚未完成</strong>}</p>{task.status === 'done' ? <div className="project-evidence"><strong>人工验收记录</strong><p>{task.evidence?.note}</p><small>{task.evidence?.recordedAt.replace('T', ' ').slice(0, 19)}</small><button type="button" className="button button-quiet" onClick={() => moveTask(task.id, 'doing')}>重新打开</button></div> : <><label>实际步骤与结果<textarea rows={3} value={notes[task.id] || ''} disabled={blockers.length > 0} placeholder="例如：使用手机视口完成三次配送，结果…（请先实际执行）" onChange={event => setNotes(current => ({ ...current, [task.id]: event.target.value }))} /></label><div className="project-task-actions"><button type="button" className="button button-quiet" disabled={blockers.length > 0 || task.status === 'doing'} onClick={() => moveTask(task.id, 'doing')}>开始</button><button type="button" className="button button-primary" disabled={blockers.length > 0} onClick={() => moveTask(task.id, 'done')}>登记验收 ✓</button></div></>}</article>
        })}</div>
        <div className="project-board-footer"><p>里程碑来自任务与依赖状态。这里没有运行测试、连接 GitHub 或发布游戏；重新打开前置任务会使下游验收失效。</p><div className="project-downloads"><button type="button" className="button button-quiet" onClick={() => download('tasks.json', exportTasks(tasks, milestone), 'application/json;charset=utf-8')}>下载任务与证据 ↓</button><button type="button" className="button button-quiet" onClick={() => { setTasks(initialTasks.map(task => ({ ...task }))); setMilestone('playable'); setNotes({}); setNotice('演示看板已重置。') }}>重置演示</button></div></div>
      </section>}

      {stage === 'recover' && <section className="project-panel" aria-labelledby="recover-title">
        <div className="project-panel-title"><div><p className="eyebrow">04 / RECOVER</p><h3 id="recover-title">带走决定，而不只是聊天。</h3></div><span className="project-chip">独立 Markdown 交接</span></div>
        <div className="project-columns"><div className="project-recover-copy"><div className="project-pack-illustration" aria-hidden="true"><span>PRD</span><span>ADR</span><span>CONTEXT ↗</span></div><h4>下一位协作者，需要哪些事实？</h4><p>把当前需求、技术选择、依赖和人工证据放进一个独立文件；新会话提示词会要求重新检查当前仓库。</p><ul className="project-pack-list"><li>需求与明确标注的假设</li><li>采用方案、理由与复议条件</li><li>当前任务、阻塞与实际记录</li><li>下一步、来源与遗漏说明</li></ul><label>下一次会话的具体任务<textarea rows={3} value={nextTask} onChange={event => setNextTask(event.target.value)} /></label><button type="button" className="button button-primary" onClick={() => { setAdr(currentAdr); setHandoff(createHandoff(brief, currentAdr, tasks, nextTask, { prd, decisions })); setPrompt(createRecoveryPrompt(brief.name, nextTask)); setNotice('已按当前合法方案更新ADR，并生成交接包与新会话提示词。真实仓库状态仍需核验。') }}>生成交接包 ↗</button><p className="project-footnote">真实仓库可用 <code>npm run context:pack -- --output /tmp/context-pack.md</code> 读取 Git 和项目文档。网页包只使用本次页面数据。</p></div><div className="project-document"><div className="project-small-heading"><span>交接预览</span><small>{handoff ? `${new TextEncoder().encode(handoff).length.toLocaleString()} bytes` : '等待生成'}</small></div><pre className="project-handoff-preview">{handoff || '先填写下一步，再生成交接包。\n\n当前页面的数据会在生成时收拢。\nGit、CI、部署与实际测试状态不在网页包内。'}</pre><div className="project-downloads"><button type="button" className="button button-quiet" disabled={!handoff} onClick={() => download('context-pack.md', handoff)}>下载交接包 ↓</button><button type="button" className="button button-quiet" disabled={!prompt} onClick={() => download('new-session-prompt.md', prompt)}>下载新会话提示词 ↓</button></div>{prompt && <details className="project-preview"><summary>新会话提示词</summary><pre>{prompt}</pre></details>}</div></div>
      </section>}
    </div>
  )
}
