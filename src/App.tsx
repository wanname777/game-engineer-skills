import { useEffect, useRef, useState } from 'react';
import DesignStudio from './features/design/DesignStudio';
import MotionStudio from './features/motion/MotionStudio';
import ProjectStudio from './features/project/ProjectStudio';

const workspaces = [
  { id: 'design', number: '01', label: '设计工作室', english: 'DESIGN', summary: '场景、视觉与设计系统', component: DesignStudio },
  { id: 'motion', number: '02', label: '动画放映室', english: 'MOTION', summary: '分镜、时间与声音', component: MotionStudio },
  { id: 'project', number: '03', label: '项目驾驶舱', english: 'PROJECT', summary: '从需求到可验证的交付', component: ProjectStudio },
] as const;
type Workspace = typeof workspaces[number]['id'];
const skills = [
  { name: 'design-game-interface', label: '设计游戏界面', category: 'DESIGN', description: '先明确内容层级，再用统一 token 呈现场景、属性和作品。', prompt: '使用 $design-game-interface，为一个小型游戏设计可交互的创作界面，并交付桌面与手机预览。' },
  { name: 'create-motion-showreel', label: '制作动画短片', category: 'MOTION', description: '同一个时间函数驱动预览、画面和声音，精确复现每一帧。', prompt: '使用 $create-motion-showreel，为星港快递制作一段 14 秒短片，交付风格帧、可拖动预览和 MP4。' },
  { name: 'discover-project', label: '澄清项目需求', category: 'PROJECT', description: '把模糊想法变成第一版边界、明确决策和可检查的验收。', prompt: '使用 $discover-project，把我的游戏想法整理成最小可交付版本；先读取已有决策，只追问会改变方案的问题。' },
  { name: 'choose-project-stack', label: '选择技术方案', category: 'PROJECT', description: '比较两三条路径，记录预算、维护成本和选择理由。', prompt: '使用 $choose-project-stack，为这个游戏工作台比较技术方案，写出维护成本、取舍和 ADR。' },
  { name: 'deliver-project', label: '验证与交付', category: 'PROJECT', description: '小步提交、真实行为验收，让每项完成都有证据。', prompt: '使用 $deliver-project，按已有需求完成一个最小迭代，用真实浏览器验收，再把代码交付到 GitHub。' },
  { name: 'recover-project-context', label: '恢复项目上下文', category: 'PROJECT', description: '从代码与 Git 重建事实，让新的对话也能接着做。', prompt: '使用 $recover-project-context，从当前代码与 Git 生成交接包，让一个独立的新会话继续下一项任务。' },
];

function getWorkspace(): Workspace {
  const hash = window.location.hash.slice(1);
  return workspaces.some(w => w.id === hash) ? hash as Workspace : 'design';
}

export default function App() {
  const [active, setActive] = useState<Workspace>(getWorkspace);
  const [showSkills, setShowSkills] = useState(false);
  const [copied, setCopied] = useState('');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = workspaces.find(w => w.id === active)!;
  const Panel = current.component;

  useEffect(() => {
    const change = () => setActive(getWorkspace());
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    if (showSkills) dialog.current?.showModal();
    else dialog.current?.close();
  }, [showSkills]);

  async function copyPrompt(name: string, prompt: string) {
    try { await navigator.clipboard.writeText(prompt); setCopied(name); }
    catch { setCopied('复制受限，请选中上方文字复制。'); }
  }

  return <>
    <a className="skip-link" href="#workspace">跳到创作区</a>
    <header className="site-header">
      <a className="wordmark" href="#design" aria-label="游造首页">
        <svg className="brand-symbol" viewBox="0 0 36 36" aria-hidden="true"><path d="M3 3h14v14H3zM19 3h14v14H19zM3 19h14v14H3z"/><circle cx="26" cy="26" r="7"/></svg>
        <span>游造<span className="wordmark-en">FIELDNOTES / PLAY LAB</span></span>
      </a>
      <nav className="header-actions" aria-label="辅助导航">
        <button className="text-button" onClick={() => setShowSkills(true)}>技能工具箱 <span aria-hidden="true">↗</span></button>
        <a className="text-button" href="https://github.com/wanname777/game-engineer-skills" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        <span className="local-badge"><span/>本地创作</span>
      </nav>
    </header>

    <main>
      <section className="intro" aria-labelledby="intro-title">
        <div className="intro-copy">
          <p className="eyebrow">A SMALL IDEA. A WORLD OF ITS OWN.</p>
          <h1 id="intro-title">让想法，<br/>长成可玩的<span className="title-accent">世界<span className="title-dot">。</span></span></h1>
          <p className="intro-description">从一张星港地图开始。为它找到视觉、赋予动作，<br className="desktop-break"/>再沿着清楚的交付路径，把它做成一个作品。</p>
          <div className="intro-meta"><span className="project-dot"/>示例项目：星港快递 <span className="meta-divider">/</span> STARPORT COURIER</div>
        </div>
        <div className="creative-loop" aria-label="创作流程：设计，动画，交付">
          <div className="loop-heading"><span className="eyebrow">THE CREATIVE LOOP</span><span className="loop-orbit" aria-hidden="true">↗</span></div>
          {workspaces.map(w => <button key={w.id} className={`loop-step ${active === w.id ? 'is-current' : ''}`} onClick={() => { window.location.hash = w.id; document.getElementById('workspace')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>
            <span className="loop-number">{w.number}</span><span><strong>{w.label}</strong><small>{w.summary}</small></span><span className="loop-arrow" aria-hidden="true">↗</span>
          </button>)}
          <p className="loop-note">六个可复用 skill · 三个创作工作区</p>
        </div>
      </section>

      <section className="workspace" id="workspace" aria-labelledby="workspace-title">
        <div className="workspace-bar">
          <h2 id="workspace-title" className="workspace-heading">创作工作台 <span>/ WORKSPACE</span></h2>
          <span className="workspace-note">动手试试，再带走方法。</span>
        </div>
        <div className="workspace-tabs" role="tablist" aria-label="创作工作区">
          {workspaces.map((w, i) => <button ref={el => { tabs.current[i] = el; }} key={w.id} id={`tab-${w.id}`} role="tab" aria-selected={active === w.id} aria-controls={`panel-${w.id}`} tabIndex={active === w.id ? 0 : -1} className={`workspace-tab ${active === w.id ? 'is-active' : ''}`} onClick={() => { window.location.hash = w.id; }} onKeyDown={event => {
            let next: number | undefined;
            if (event.key === 'ArrowRight') next = (i + 1) % workspaces.length;
            if (event.key === 'ArrowLeft') next = (i + workspaces.length - 1) % workspaces.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = workspaces.length - 1;
            if (next !== undefined) { event.preventDefault(); window.location.hash = workspaces[next].id; tabs.current[next]?.focus(); }
          }}><span className="tab-number">{w.number}</span><span>{w.label}</span><span className="tab-english">{w.english}</span></button>)}
        </div>
        <div key={active} id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`} tabIndex={0} className="workspace-panel"><Panel /></div>
      </section>

      <section className="method-note" aria-label="项目方法说明"><span className="method-mark" aria-hidden="true">✳</span><div><p>把方法留在项目里，把作品带到世界去。</p><span>视频研究 → 项目内 skill → 可操作 demo → 独立验收。源码、来源和使用说明都在公开仓库。</span></div><button className="button button-quiet" onClick={() => setShowSkills(true)}>查看六个 skill <span aria-hidden="true">↗</span></button></section>
    </main>
    <footer className="site-footer"><span>游造 / FIELDNOTES</span><span>一个想法，值得被认真做出来。</span><a href="https://github.com/wanname777/game-engineer-skills/blob/main/docs/research/README.md" target="_blank" rel="noreferrer">研究来源与证据 ↗</a></footer>

    <dialog ref={dialog} className="skills-dialog" aria-labelledby="skills-title" onCancel={() => setShowSkills(false)} onClick={e => { if (e.target === dialog.current) setShowSkills(false); }}>
      <div className="dialog-heading"><div><p className="eyebrow">TAKE THE METHOD WITH YOU</p><h2 id="skills-title">六个 skill，一套创作方法。</h2></div><button className="button button-quiet" aria-label="关闭技能工具箱" onClick={() => setShowSkills(false)}>关闭 ×</button></div>
      <p className="dialog-description">在项目中直接用下面的提示词，或打开源文件了解操作步骤。每个 skill 都包含明确输入、输出和验收要求。</p>
      <div className="skill-grid">{skills.map((skill, index) => <article className="skill-card" key={skill.name}><div className="skill-card-meta"><span>0{index + 1} / {skill.category}</span><a href={`https://github.com/wanname777/game-engineer-skills/blob/main/.agents/skills/${skill.name}/SKILL.md`} target="_blank" rel="noreferrer" aria-label={`打开${skill.label}的源文件`}>↗</a></div><h3>{skill.label}</h3><p>{skill.description}</p><code>{skill.prompt}</code><button className="text-button" onClick={() => copyPrompt(skill.name, skill.prompt)}>{copied === skill.name ? '已复制 ✓' : '复制使用提示词'}</button></article>)}</div>
      <p className="copy-status" role="status">{copied && (copied.startsWith('复制') ? copied : '提示词已复制，可以带到新的对话使用。')}</p>
      <div className="reuse-links"><span>独立上下文，换题材再做一次：</span><a href={`${import.meta.env.BASE_URL}reuse/moon-greenhouse/`} target="_blank" rel="noreferrer">月面温室 · 设计 ↗</a><a href={`${import.meta.env.BASE_URL}reuse/moon-garden/`} target="_blank" rel="noreferrer">月面花园 · 动画 ↗</a></div>
    </dialog>
  </>;
}
