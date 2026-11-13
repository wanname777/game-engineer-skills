/** The single clock for preview, exported frames, and synthesized sound. */
export const DUR = 14;
export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;

export const ACTS = [
  { start: 0, end: 4.5, label: '01 · 星港出发', title: '每份心意，都值得启程。', color: '#ef7651' },
  { start: 4.5, end: 9.5, label: '02 · 穿越轨道', title: '绕过银河，准时抵达。', color: '#9bc6b1' },
  { start: 9.5, end: DUR, label: '03 · 温柔抵达', title: '把宇宙送到你手里。', color: '#e9bb58' },
] as const;

export const SOUND_EVENTS = [
  { at: 1.4, duration: 0.32, kind: 'stamp', frequency: 220, gain: 0.16 },
  { at: 3.25, duration: 0.5, kind: 'chime', frequency: 659.25, gain: 0.12 },
  { at: 4.45, duration: 0.85, kind: 'whoosh', frequency: 110, gain: 0.11 },
  { at: 5.3, duration: 0.5, kind: 'chime', frequency: 523.25, gain: 0.1 },
  { at: 6.55, duration: 0.5, kind: 'chime', frequency: 659.25, gain: 0.1 },
  { at: 7.8, duration: 0.5, kind: 'chime', frequency: 783.99, gain: 0.1 },
  { at: 9.45, duration: 0.85, kind: 'whoosh', frequency: 140, gain: 0.09 },
  { at: 10.55, duration: 1.3, kind: 'chime', frequency: 523.25, gain: 0.14 },
  { at: 10.7, duration: 1.3, kind: 'chime', frequency: 659.25, gain: 0.12 },
  { at: 10.85, duration: 1.3, kind: 'chime', frequency: 783.99, gain: 0.1 },
] as const;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const smooth = (p: number) => { const v = clamp(p); return v * v * (3 - 2 * v); };
export const progress = (time: number, start: number, end: number) => clamp((time - start) / (end - start));

export function timeline(rawTime: number) {
  const time = clamp(rawTime, 0, DUR);
  const act = time < 4.5 ? 0 : time < 9.5 ? 1 : 2;
  const phase = progress(time, ACTS[act].start, ACTS[act].end);
  const launch = smooth(progress(time, 1.4, 4.5));
  const flight = smooth(progress(time, 4.5, 9.5));
  const land = smooth(progress(time, 9.5, 10.6));
  let parcelX: number;
  let parcelY: number;
  let parcelRotation: number;
  if (act === 0) {
    parcelX = lerp(472, 1020, launch);
    parcelY = lerp(436, 310, launch) - Math.sin(launch * Math.PI) * 95;
    parcelRotation = -launch * 0.3;
  } else if (act === 1) {
    parcelX = lerp(1020, 332, flight);
    parcelY = 310 - Math.sin(flight * Math.PI * 2) * 90 + flight * 46;
    parcelRotation = -0.3 + Math.sin(flight * Math.PI * 2) * 0.18;
  } else {
    parcelX = lerp(332, 350, land);
    parcelY = lerp(356, 433, land);
    parcelRotation = lerp(-0.3, 0, land);
  }
  return { time, act, phase, launch, flight, land, parcelX, parcelY, parcelRotation, opening: smooth(progress(time, 10.5, 11.5)), endTitle: smooth(progress(time, 10.1, 11.2)) };
}

export function sampleAudio(rawTime: number): number {
  const time = clamp(rawTime, 0, DUR);
  if (rawTime < 0 || rawTime >= DUR) return 0;
  const edge = smooth(progress(time, 0, 0.35)) * (1 - smooth(progress(time, DUR - 0.8, DUR)));
  const noteIndex = Math.floor(time / 0.5);
  const notes = [130.8128, 164.8138, 195.9977, 164.8138, 146.8324, 174.6141, 220, 195.9977];
  const frequency = notes[noteIndex % notes.length];
  const beat = time - noteIndex * 0.5;
  const pluck = Math.exp(-beat * 10) * (1 - Math.exp(-beat * 180));
  let sample = 0.055 * pluck * (Math.sin(2 * Math.PI * frequency * beat) + 0.35 * Math.sin(2 * Math.PI * frequency * 2 * beat));
  sample += 0.016 * Math.sin(2 * Math.PI * 65.4064 * time) * (0.7 + 0.3 * Math.sin(time * Math.PI));
  for (const event of SOUND_EVENTS) {
    const local = time - event.at;
    if (local < 0 || local > event.duration) continue;
    const p = local / event.duration;
    const envelope = Math.sin(Math.PI * p) ** 2;
    if (event.kind === 'whoosh') {
      // Deterministic chirp; no random noise and no accumulated oscillator phase.
      sample += event.gain * envelope * (Math.sin(2 * Math.PI * (event.frequency * local + 470 * local * local)) + 0.3 * Math.sin(2 * Math.PI * 1733 * local));
    } else if (event.kind === 'stamp') {
      sample += event.gain * Math.exp(-local * 24) * (1 - Math.exp(-local * 400)) * Math.sin(2 * Math.PI * (event.frequency * local - 160 * local * local));
    } else {
      sample += event.gain * envelope * Math.exp(-local * 2.5) * (Math.sin(2 * Math.PI * event.frequency * local) + 0.24 * Math.sin(2 * Math.PI * event.frequency * 3 * local));
    }
  }
  return clamp(sample * edge, -0.95, 0.95);
}

export function makeAudioSamples(sampleRate = 48000): Float32Array {
  return Float32Array.from({ length: Math.round(DUR * sampleRate) }, (_, i) => sampleAudio(i / sampleRate));
}
