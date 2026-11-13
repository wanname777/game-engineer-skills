import { describe, expect, it } from 'vitest'
import { changeTaskStatus, compareStacks, createHandoff, defaultConstraints, generateAdr, initialTasks, interviewQuestions, restoreBoard, sampleBrief, serializeBoard } from './model'

describe('project decisions and dependency evidence', () => {
  it('asks at most three unanswered high value questions', () => {
    expect(interviewQuestions({ ...sampleBrief, audience: '', platform: '' })).toHaveLength(3)
    expect(interviewQuestions({ ...sampleBrief, outcome: '一次完整配送', boundary: '两周，不做账号' })).toHaveLength(0)
  })
  it('requires server deployment when shared data or private keys are requested', () => {
    expect(compareStacks(defaultConstraints)[0].id).toBe('static')
    expect(compareStacks({ ...defaultConstraints, secrets: 'server' })[0].id).toBe('service')
    expect(compareStacks({ ...defaultConstraints, persistence: 'shared' })[0].id).not.toBe('static')
  })
  it('excludes ineligible static hosting and rejects an ADR that bypasses the UI', () => {
    for (const constraints of [{ ...defaultConstraints, secrets: 'server' as const }, { ...defaultConstraints, persistence: 'shared' as const }]) {
      expect(compareStacks(constraints).find(option => option.id === 'static')?.eligible).toBe(false)
      expect(() => generateAdr(constraints, 'static', '便宜')).toThrow('需要后端')
      expect(generateAdr(constraints, 'service', '保管密钥或共享数据')).toContain('选择：网页 + 轻量服务')
    }
  })
  it('prevents a blocked task or missing evidence from being completed', () => {
    expect(() => changeTaskStatus(initialTasks, 'route', 'done', '观察完成')).toThrow('前置')
    expect(() => changeTaskStatus(initialTasks, 'scope', 'done')).toThrow('步骤')
  })
  it('invalidates downstream evidence when a prerequisite is reopened', () => {
    let tasks = changeTaskStatus(initialTasks, 'scope', 'done', 'PRD已核对')
    tasks = changeTaskStatus(tasks, 'route', 'done', '配送循环已观察')
    tasks = changeTaskStatus(tasks, 'playtest', 'done', '两种视口完成')
    tasks = changeTaskStatus(tasks, 'scope', 'doing')
    expect(tasks.find(task => task.id === 'playtest')?.status).toBe('todo')
    expect(tasks.find(task => task.id === 'route')?.evidence).toBeUndefined()
  })
  it('persists progress without free text or private interview inputs', () => {
    const tasks = changeTaskStatus(initialTasks, 'scope', 'done', '联系 someone@example.com / 13800138000', '2026-11-13T00:00:00Z')
    const saved = serializeBoard(tasks, 'handoff')
    expect(saved).not.toContain('someone')
    expect(saved).not.toContain('13800138000')
    expect(restoreBoard(saved).tasks[0].status).toBe('done')
    expect(restoreBoard(saved).milestone).toBe('handoff')
  })
  it('recovers from malformed storage and rejects inconsistent dependencies', () => {
    expect(restoreBoard('{broken').tasks).toEqual(initialTasks)
    const raw = JSON.stringify({ version: 1, tasks: [{ id: 'playtest', status: 'done', evidence: { kind: 'manual', recordedAt: '2026-11-13' } }] })
    expect(restoreBoard(raw).tasks.find(task => task.id === 'playtest')?.status).toBe('todo')
  })
  it('hands off the edited documents rather than regenerating and losing edits', () => {
    const pack = createHandoff(sampleBrief, '# ADR edited', initialTasks, '实现下一任务', { prd: '# PRD edited\n保留人工修改。', decisions: '# Decisions edited' })
    expect(pack).toContain('# PRD edited\n保留人工修改。')
    expect(pack).toContain('# Decisions edited')
    expect(pack).toContain('未读取真实Git')
    expect(pack).not.toContain('## 玩家路径')
  })
})
