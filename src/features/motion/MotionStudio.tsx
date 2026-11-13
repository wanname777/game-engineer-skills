import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ACTS, DUR, FPS, HEIGHT, WIDTH, clamp, makeAudioSamples, timeline } from './timeline';
import { drawFrame, installRenderContract } from './renderer';
import './motion.css';

const STYLE_FRAMES = [
  { time: 0.8, name: '星港出发', description: '奶油纸色 · 薄荷站台' },
  { time: 6.5, name: '穿越轨道', description: '环形动线 · 一物贯穿' },
  { time: 12, name: '温柔抵达', description: '橙色心意 · 花园终点' },
];
const VIDEO_URL = new URL('../../../demos/motion/output/starport-courier.mp4', import.meta.url).href;

function StyleFrame({ time, name, description, onSelect }: typeof STYLE_FRAMES[number] & { onSelect: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (canvas.current) void document.fonts.ready.then(() => { if (canvas.current) drawFrame(canvas.current, time); }); }, [time]);
  return <button type="button" className="motion-style-frame" onClick={onSelect} aria-label={`查看${name}风格帧`}>
    <span className="motion-style-image"><canvas ref={canvas} width={384} height={216} aria-hidden="true" /><span className="motion-frame-time">{time.toFixed(1)}s ↗</span></span>
    <span className="motion-style-caption"><strong>{name}</strong><small>{description}</small></span>
  </button>;
}

export default function MotionStudio() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(true);
  const [notice, setNotice] = useState('');
  const timeRef = useRef(time);
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const gain = useRef<GainNode | null>(null);
  const state = timeline(time);

  useEffect(() => { timeRef.current = time; if (canvas.current) drawFrame(canvas.current, time); }, [time]);
  useEffect(() => { if (canvas.current) return installRenderContract(canvas.current); }, []);
  useEffect(() => () => { void audioContext.current?.close(); }, []);
  useEffect(() => { if (gain.current) gain.current.gain.value = muted ? 0 : 0.8; }, [muted]);

  useEffect(() => {
    if (!playing) return;
    const startTime = timeRef.current;
    const startClock = performance.now();
    let frame = 0;
    let source: AudioBufferSourceNode | undefined;
    if (audioContext.current && audioBuffer.current) {
      source = audioContext.current.createBufferSource(); source.buffer = audioBuffer.current;
      source.playbackRate.value = speed;
      const output = audioContext.current.createGain(); output.gain.value = muted ? 0 : 0.8; gain.current = output;
      source.connect(output); output.connect(audioContext.current.destination); source.start(0, startTime);
    }
    const tick = (now: number) => {
      const next = clamp(startTime + (now - startClock) / 1000 * speed, 0, DUR);
      setTime(next);
      if (next >= DUR) setPlaying(false); else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); source?.stop(); source?.disconnect(); gain.current?.disconnect(); };
    // Mute changes the existing GainNode; speed starts a new absolute playback clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed]);

  const prepareAudio = () => {
    if (!audioContext.current) {
      const context = new AudioContext(); audioContext.current = context;
      const buffer = context.createBuffer(1, Math.round(DUR * context.sampleRate), context.sampleRate);
      buffer.copyToChannel(makeAudioSamples(context.sampleRate) as Float32Array<ArrayBuffer>, 0); audioBuffer.current = buffer;
    }
    void audioContext.current.resume();
  };
  const togglePlayback = () => {
    if (!playing) { prepareAudio(); if (timeRef.current >= DUR) { timeRef.current = 0; setTime(0); } }
    setPlaying(value => !value);
  };
  const seek = (next: number) => { setPlaying(false); const value = clamp(next, 0, DUR); timeRef.current = value; setTime(value); };
  const saveFrame = () => {
    if (!canvas.current) return;
    const link = document.createElement('a'); link.download = `starport-${time.toFixed(2)}s.png`; link.href = canvas.current.toDataURL('image/png'); link.click();
    setNotice('当前风格帧已保存');
  };

  return <section className="motion-studio" aria-labelledby="motion-title">
    <div className="motion-heading">
      <div><span className="eyebrow">MOTION LAB / 02</span><h2 className="section-title" id="motion-title">让世界，动起来<span className="motion-title-star">✦</span></h2><p>一份跨越星河的心意，一支属于你的游戏发布短片。</p></div>
      <span className="motion-project-tag"><span /> 星港快递 <small>原创短片</small></span>
    </div>
    <div className="motion-workspace">
      <div className="motion-main">
        <div className="motion-preview-top"><span><i /> {playing ? '正在播放' : '预览已就绪'}</span><span>14 秒 · 720p · 30 fps</span></div>
        <div className="motion-canvas-wrap"><canvas ref={canvas} width={WIDTH} height={HEIGHT} role="img" aria-label={`星港快递动画，第${state.act + 1}幕：${ACTS[state.act].title}，${time.toFixed(1)}秒`} /></div>
        <div className="motion-playback">
          <button type="button" className="motion-play-button" onClick={togglePlayback} aria-label={playing ? '暂停动画' : '播放动画'}>{playing ? 'Ⅱ' : '▶'}</button>
          <button type="button" className="motion-step-button" onClick={() => seek(time - 1 / FPS)} aria-label="上一帧">Ⅰ◀</button>
          <button type="button" className="motion-step-button" onClick={() => seek(time + 1 / FPS)} aria-label="下一帧">▶Ⅰ</button>
          <span className="motion-time"><strong>{time.toFixed(2)}</strong> / {DUR.toFixed(2)}s</span>
          <label className="motion-speed-label">速度<select aria-label="播放速度" value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label>
          <button type="button" className="motion-sound-button" aria-label={muted ? '开启声音' : '关闭声音'} aria-pressed={!muted} onClick={() => { prepareAudio(); setMuted(value => !value); }}>{muted ? '♫ 关闭' : '♫ 开启'}</button>
        </div>
        <div className="motion-timeline">
          <div className="motion-timeline-label"><span>故事时间轴</span><span>拖动探索每一帧</span></div>
          <label className="motion-scrubber"><span className="motion-sr-only">动画时间</span><input aria-label="动画时间" type="range" min={0} max={DUR} step={1 / FPS} value={time} onChange={event => seek(Number(event.target.value))} style={{ '--motion-progress': `${time / DUR * 100}%` } as CSSProperties} /></label>
          <div className="motion-acts">{ACTS.map((act, index) => <button type="button" key={act.start} onClick={() => seek(act.start + 0.3)} aria-current={state.act === index ? 'step' : undefined}><span>0{index + 1}</span><strong>{act.label.slice(5)}</strong><small>{act.start.toFixed(1)}s – {act.end.toFixed(1)}s</small></button>)}</div>
        </div>
      </div>
      <aside className="motion-side" aria-label="短片创作说明">
        <span className="eyebrow">THE STORY</span><h3>小小包裹。<br />大大宇宙。</h3><p>从薄荷色的星港站台出发，沿环形轨道穿越银河，再落进一座温柔的小花园。</p>
        <div className="motion-story-note"><span>✦</span><p>用一个物件连接三个空间。<br />用一次抵达，留下记忆。</p></div>
        <dl><div><dt>画面语言</dt><dd>几何插画 / 纸感配色</dd></div><div><dt>声音设计</dt><dd>轻拨弦 · 飞行声 · 到达铃</dd></div><div><dt>片尾节奏</dt><dd>心意展开，停留 2 秒</dd></div></dl>
        <div className="motion-palette" role="img" aria-label="色板：奶油色、深绿、橙色、薄荷色"><span /><span /><span /><span /></div>
        <a className="button button-primary motion-export" href={VIDEO_URL} download="starport-courier.mp4">下载发布短片 <span>↓</span></a>
        <button type="button" className="button button-quiet motion-export" onClick={saveFrame}>保存当前风格帧 <span>↗</span></button>
        <small className="motion-export-note">MP4 · H.264 · 含原创合成音轨</small><span className="motion-notice" role="status">{notice}</span>
      </aside>
    </div>
    <div className="motion-frames-heading"><div><span className="eyebrow">STYLE FRAMES</span><h3>三个瞬间，一段旅程</h3></div><p>点击风格帧，跳到故事里的那个瞬间。</p></div>
    <div className="motion-style-frames">{STYLE_FRAMES.map(frame => <StyleFrame key={frame.time} {...frame} onSelect={() => seek(frame.time)} />)}</div>
  </section>;
}
