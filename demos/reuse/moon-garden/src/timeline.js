export const DUR = 8;
export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;
export const PALETTE = { paper: '#f4f0e4', green: '#173f34', yellow: '#e5b64a', sage: '#cdd8c6', light: '#e7eadc' };
export const ACTS = [
  { start: 0, end: 3.2, label: '01 / ORBIT', action: '种子穿过月球轨道' },
  { start: 3.2, end: 4.65, label: '02 / LAND', action: '落入温室的土壤' },
  { start: 4.65, end: 8, label: '03 / BLOOM', action: '生长为暖黄色小花' },
];
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(x) ? x : a));
export const lerp = (a,b,p) => a+(b-a)*p;
export const progress = (t,a,b) => clamp((t-a)/(b-a));
export const smooth = x => { const p=clamp(x); return p*p*(3-2*p); };
export const easeOut = x => 1-(1-clamp(x))**3;

export function seedPosition(rawTime) {
  const t=clamp(rawTime,0,DUR);
  if (t <= 3.2) {
    const p=smooth(progress(t,0,3.2));
    return { x:lerp(170,1040,p), y:345-Math.sin(p*Math.PI)*225-p*25, rotation:lerp(-0.75,0.8,p) };
  }
  const p=smooth(progress(t,3.2,4.65));
  return { x:lerp(1040,910,p)+Math.sin(p*Math.PI)*28, y:lerp(320,638,p), rotation:lerp(0.8,Math.PI/2,p) };
}

export function timeline(rawTime) {
  const time=clamp(rawTime,0,DUR);
  const camera=smooth(progress(time,2.9,4.75));
  const seed=seedPosition(time);
  return { time, act:time<3.2?0:time<4.65?1:2, seed,
    cameraScale:lerp(1,1.85,camera), cameraX:lerp(640,800,camera), cameraY:lerp(360,495,camera),
    seedOpacity:1-smooth(progress(time,4.65,4.95)), growth:easeOut(progress(time,4.85,6.05)),
    leaves:smooth(progress(time,5.2,5.95)), bloom:easeOut(progress(time,5.9,6.8)),
    landing:smooth(progress(time,4.65,5.15)), ending:smooth(progress(time,6.55,7.15)) };
}

export const SOUND_EVENTS = [
  { at:0.35, duration:1.1, kind:'pluck', frequency:293.6648, gain:0.14 },
  { at:1.3, duration:1.1, kind:'pluck', frequency:349.2282, gain:0.11 },
  { at:2.2, duration:1, kind:'pluck', frequency:440, gain:0.1 },
  { at:2.75, duration:0.65, kind:'whoosh', frequency:160, gain:0.07 },
  { at:3.3, duration:1.1, kind:'fall', frequency:540, gain:0.08 },
  { at:4.65, duration:0.3, kind:'tap', frequency:170, gain:0.17 },
  { at:5.2, duration:1.2, kind:'pluck', frequency:587.3295, gain:0.11 },
  { at:6.05, duration:1.65, kind:'bell', frequency:349.2282, gain:0.1 },
  { at:6.22, duration:1.55, kind:'bell', frequency:440, gain:0.09 },
  { at:6.4, duration:1.45, kind:'bell', frequency:523.2511, gain:0.08 },
  { at:7.2, duration:0.8, kind:'bell', frequency:1046.5023, gain:0.055 },
];

export function sampleAudio(t) {
  if (!Number.isFinite(t)||t<0||t>=DUR) return 0;
  const edge=smooth(progress(t,0,0.4))*(1-smooth(progress(t,7.5,8)));
  let s=0.013*Math.sin(2*Math.PI*73.4162*t)+0.008*Math.sin(2*Math.PI*146.8324*t);
  for (const event of SOUND_EVENTS) {
    const u=t-event.at;
    if (u<0||u>event.duration) continue;
    const p=u/event.duration, attack=1-Math.exp(-u*100);
    if (event.kind==='tap') s+=event.gain*attack*Math.exp(-u*25)*Math.sin(2*Math.PI*(event.frequency*u-100*u*u));
    else if(event.kind==='whoosh'||event.kind==='fall') {
      const phase=event.frequency*u+(event.kind==='fall'?-170:430)*u*u;
      s+=event.gain*Math.sin(Math.PI*p)**2*(Math.sin(2*Math.PI*phase)+0.22*Math.sin(2*Math.PI*1327*u));
    } else {
      const env=attack*Math.exp(-u*(event.kind==='pluck'?4:2.1))*(1-smooth(progress(p,0.7,1)));
      s+=event.gain*env*(Math.sin(2*Math.PI*event.frequency*u)+0.17*Math.sin(2*Math.PI*event.frequency*3*u));
    }
  }
  return s*edge;
}
export function makeAudioSamples(rate=48000) {
  return Float32Array.from({length:Math.round(DUR*rate)},(_,i)=>sampleAudio(i/rate));
}
