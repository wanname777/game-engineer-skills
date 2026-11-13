#!/usr/bin/env node
import { chromium } from '@playwright/test';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Compile the original time source in memory; also works on Node 22 before native TS loading.
const timeSource = await readFile(join(root, 'src/features/motion/timeline.ts'), 'utf8');
const compiled = ts.transpileModule(timeSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { ACTS, DUR, FPS, HEIGHT, SOUND_EVENTS, WIDTH, makeAudioSamples } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const quick = process.argv.includes('--quick');
const width = quick ? 854 : WIDTH;
const height = quick ? 480 : HEIGHT;
const urlIndex = process.argv.indexOf('--url');
const suppliedUrl = urlIndex >= 0 ? process.argv[urlIndex + 1] : undefined;
if (urlIndex >= 0 && !suppliedUrl) throw new Error('--url requires a server URL');
const output = join(root, 'demos/motion/output');
const stem = quick ? 'starport-courier-quick' : 'starport-courier';
const temp = await mkdtemp(join(tmpdir(), 'youzao-motion-'));
let server;
let browser;

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    child.stdout.on('data', data => { log += data; }); child.stderr.on('data', data => { log += data; });
    child.on('error', reject);
    child.on('close', code => { if (code === 0) resolveRun(log); else reject(new Error(`${command} exited ${code}\n${log.slice(-6000)}`)); });
  });
}
const hash = data => createHash('sha256').update(data).digest('hex');

try {
  await mkdir(output, { recursive: true });
  let baseUrl = suppliedUrl;
  if (!baseUrl) {
    server = await createServer({ root, logLevel: 'error', server: { host: '127.0.0.1', port: 4175, strictPort: false } });
    await server.listen(); baseUrl = server.resolvedUrls.local[0];
  }
  browser = await chromium.launch({ headless: true, ...(process.env.MOTION_BROWSER_PATH ? { executablePath: process.env.MOTION_BROWSER_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(new URL('demos/motion/render.html', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.READY === true && typeof window.render === 'function', { timeout: 20000 });
  await page.evaluate(({ width: w, height: h }) => { const canvas = document.querySelector('canvas'); canvas.width = w; canvas.height = h; }, { width, height });
  const contract = await page.evaluate(() => ({ duration: window.DUR, source: window.__MOTION_SOURCE }));
  if (contract.duration !== DUR) throw new Error('Preview/export duration contract differs');

  const capture = async time => Buffer.from(await page.evaluate(t => { window.render(t); return document.querySelector('canvas').toDataURL('image/png').split(',')[1]; }, time), 'base64');
  const seekChecks = [];
  for (const time of [0.8, 6.5, 12]) {
    const first = await capture(time);
    for (const elsewhere of [13.8, 0, 9.6, 2.1]) await page.evaluate(t => window.render(t), elsewhere);
    const repeat = await capture(time);
    seekChecks.push({ time, first: hash(first), repeat: hash(repeat), identical: first.equals(repeat) });
  }
  if (!seekChecks.every(check => check.identical)) throw new Error('Repeated seeks produce different pixels');

  const frameCount = Math.round(DUR * FPS);
  console.log(`Rendering ${frameCount} original frames · ${width}×${height} · ${FPS} fps`);
  for (let frame = 0; frame < frameCount; frame++) {
    await writeFile(join(temp, `frame-${String(frame).padStart(5, '0')}.png`), await capture(frame / FPS));
    if (frame % 60 === 0 || frame === frameCount - 1) console.log(`Captured ${frame + 1}/${frameCount}`);
  }
  const sampleRate = 48000;
  const samples = makeAudioSamples(sampleRate);
  const wav = Buffer.alloc(44 + samples.length * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples.length * 2, 40);
  let peak = 0; let squares = 0;
  samples.forEach((value, index) => { const gain = value * 0.8; peak = Math.max(peak, Math.abs(gain)); squares += gain * gain; wav.writeInt16LE(Math.round(gain * 32767), 44 + index * 2); });
  const rms = Math.sqrt(squares / samples.length);
  const audioPath = join(temp, 'soundtrack.wav'); await writeFile(audioPath, wav);
  const videoTemp = join(temp, `${stem}.mp4`);
  await run(ffmpegInstaller.path, ['-hide_banner', '-y', '-framerate', String(FPS), '-i', join(temp, 'frame-%05d.png'), '-i', audioPath, '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', String(sampleRate), '-movflags', '+faststart', '-t', String(DUR), videoTemp]);
  const verify = await run(ffmpegInstaller.path, ['-hide_banner', '-i', videoTemp, '-vf', 'blackdetect=d=0.04:pix_th=0.10', '-af', 'volumedetect', '-f', 'null', '-']);
  const durationMatch = verify.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const duration = durationMatch ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]) : null;
  const frameMatches = [...verify.matchAll(/frame=\s*(\d+)/g)];
  const decodedFrames = frameMatches.length ? Number(frameMatches.at(-1)[1]) : null;
  const fpsMatch = verify.match(/Video: h264[^\n]*?([\d.]+) fps/);
  const fps = fpsMatch ? Number(fpsMatch[1]) : null;
  const maxVolume = Number(verify.match(/max_volume:\s*([-\d.]+) dB/)?.[1] ?? NaN);
  const meanVolume = Number(verify.match(/mean_volume:\s*([-\d.]+) dB/)?.[1] ?? NaN);
  const blackFrames = [...verify.matchAll(/black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)/g)].map(match => ({ start: Number(match[1]), end: Number(match[2]), duration: Number(match[3]) }));
  if (duration === null || Math.abs(duration - DUR) > 1 / FPS || fps !== FPS || decodedFrames !== frameCount || blackFrames.length || !Number.isFinite(maxVolume) || maxVolume >= 0 || !Number.isFinite(meanVolume) || meanVolume < -45 || pageErrors.length) {
    throw new Error(`Export validation failed: ${JSON.stringify({ duration, fps, decodedFrames, blackFrames, maxVolume, meanVolume, pageErrors })}`);
  }
  await rename(videoTemp, join(output, `${stem}.mp4`));
  const frameTimes = [0.8, 3.5, 5.3, 7.9, 10.2, 12.4];
  const sheets = [];
  for (const time of frameTimes) sheets.push({ time, image: `data:image/png;base64,${(await capture(time)).toString('base64')}` });
  const contact = await page.evaluate(async frames => {
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 592;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#f8f3e7'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#263b37'; ctx.font = '600 22px "PingFang SC", sans-serif'; ctx.fillText('星港快递 / STARPORT COURIER — ORIGINAL LAUNCH FILM', 24, 35);
    for (let i = 0; i < frames.length; i++) {
      const image = new Image(); image.src = frames[i].image; await image.decode();
      const x = 20 + i % 3 * 420; const y = 58 + Math.floor(i / 3) * 267;
      ctx.drawImage(image, x, y, 400, 225); ctx.fillStyle = '#263b37'; ctx.font = '500 13px sans-serif'; ctx.fillText(`${frames[i].time.toFixed(1)}s / ${i < 2 ? 'DEPARTURE' : i < 4 ? 'ORBIT' : 'ARRIVAL'}`, x + 6, y + 247);
    }
    return canvas.toDataURL('image/png').split(',')[1];
  }, sheets);
  await writeFile(join(output, `${stem}-contact-sheet.png`), Buffer.from(contact, 'base64'));
  await writeFile(join(output, `${stem}-cover.png`), await capture(12));
  for (const [index, time] of [0.8, 6.5, 12].entries()) await writeFile(join(output, `${stem}-style-${index + 1}.png`), await capture(time));
  await writeFile(join(output, `${stem}-soundtrack.wav`), wav);
  const sourceHashes = Object.fromEntries(await Promise.all(['timeline.ts', 'renderer.ts'].map(async file => [file, hash(await readFile(join(root, 'src/features/motion', file)))])));
  const metadata = { title: '星港快递 / Starport Courier', original: true, renderedAt: new Date().toISOString(), width, height, duration, fps, codec: 'H.264 / yuv420p', audioCodec: 'AAC', frames: decodedFrames, contract, sourceHashes, acts: ACTS, soundEvents: SOUND_EVENTS, validation: { repeatedSeekPixels: seekChecks, blackFrames, audio: { sampleRate, channels: 1, peakLinear: peak, rmsLinear: rms, maxVolumeDb: maxVolume, meanVolumeDb: meanVolume, clipping: false }, pageErrors }, artifacts: { video: `${stem}.mp4`, cover: `${stem}-cover.png`, contactSheet: `${stem}-contact-sheet.png`, audio: `${stem}-soundtrack.wav` } };
  await writeFile(join(output, `${stem}-metadata.json`), `${JSON.stringify(metadata, null, 2)}\n`);
  await writeFile(join(output, `${stem}-validation.log`), verify);
  console.log(`Verified ${duration}s / ${fps}fps / ${decodedFrames} frames, no black frames, audio peak ${maxVolume}dB`);
  console.log(`Saved ${join(output, `${stem}.mp4`)}`);
} finally {
  await browser?.close(); await server?.close(); await rm(temp, { recursive: true, force: true });
}
