import { ACTS, DUR, HEIGHT, WIDTH, clamp, lerp, progress, smooth, timeline } from './timeline';

const C = { paper: '#f8f3e7', ink: '#263b37', muted: '#788b7e', mint: '#b6d6bf', deep: '#295349', orange: '#ef7651', yellow: '#e9bb58', white: '#fffcf4', line: '#d6dcc9' };
type Context = CanvasRenderingContext2D;
const FONT = '"Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif';

function roundRect(ctx: Context, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function text(ctx: Context, label: string, x: number, y: number, size = 18, weight = 500, color = C.ink) {
  ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillText(label, x, y);
}
function line(ctx: Context, points: number[], color = C.ink, width = 2) {
  ctx.beginPath(); ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function circle(ctx: Context, x: number, y: number, radius: number, fill: string, stroke?: string) {
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function star(ctx: Context, x: number, y: number, r: number, color: string) {
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x + 2, y - 2, x + r, y);
  ctx.quadraticCurveTo(x + 2, y + 2, x, y + r); ctx.quadraticCurveTo(x - 2, y + 2, x - r, y);
  ctx.quadraticCurveTo(x - 2, y - 2, x, y - r); ctx.fillStyle = color; ctx.fill();
}
function planet(ctx: Context, x: number, y: number, r: number, color: string, angle = -0.3) {
  circle(ctx, x, y, r, color); ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.65, r * 0.34, 0, 0, Math.PI * 2); ctx.strokeStyle = C.deep; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  circle(ctx, x - r * 0.3, y - r * 0.22, r * 0.14, C.white);
}
function ship(ctx: Context, x: number, y: number, scale: number, time: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.beginPath(); ctx.moveTo(-46, 8); ctx.quadraticCurveTo(0, -45, 43, 0); ctx.lineTo(61, 17); ctx.lineTo(-56, 17); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill(); ctx.strokeStyle = C.deep; ctx.lineWidth = 3; ctx.stroke();
  roundRect(ctx, -8, -11, 34, 16, 8, C.mint, C.deep);
  ctx.beginPath(); ctx.moveTo(-52, 20); ctx.lineTo(-76 - Math.sin(time * 14) * 8, 28); ctx.lineTo(-49, 29); ctx.fillStyle = C.orange; ctx.fill();
  line(ctx, [-28, 11, -23, 33, 10, 33, 16, 17], C.deep, 3); ctx.restore();
}
function courier(ctx: Context, x: number, y: number, time: number, wave = false) {
  ctx.save(); ctx.translate(x, y);
  circle(ctx, 0, -117, 27, C.white, C.ink);
  roundRect(ctx, -21, -127, 42, 21, 10, C.deep);
  roundRect(ctx, -26, -88, 52, 60, 18, C.orange, C.ink);
  roundRect(ctx, -30, -74, 16, 35, 7, C.mint, C.ink);
  line(ctx, [-12, -28, -17, 0, -31, 0], C.ink, 12);
  line(ctx, [11, -28, 19, 0, 32, 0], C.ink, 12);
  const lift = wave ? Math.sin(time * 5) * 9 : -2;
  line(ctx, [21, -76, 46, -72 - lift, 56, -94 - lift], C.ink, 9);
  circle(ctx, 58, -99 - lift, 7, C.white, C.ink);
  roundRect(ctx, -8, -64, 16, 14, 3, C.white); text(ctx, '✦', -6, -53, 12, 600, C.deep);
  ctx.restore();
}
function packageBox(ctx: Context, x: number, y: number, rotation: number, scale: number, opening: number, time: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.scale(scale, scale);
  ctx.save(); ctx.globalAlpha = 0.15; ctx.scale(1, 0.22); circle(ctx, 0, 230, 51, C.deep); ctx.restore();
  roundRect(ctx, -41, -32, 82, 70, 7, C.orange, C.ink);
  roundRect(ctx, -7, -32, 14, 70, 0, C.yellow);
  roundRect(ctx, -29, -14, 26, 20, 3, C.white); line(ctx, [-24, -8, -10, -8, -24, -3, -15, -3], C.deep, 2);
  if (opening > 0) {
    ctx.save(); ctx.translate(-41, -30); ctx.rotate(-opening * 1.15); roundRect(ctx, 0, -5, 41, 10, 2, C.orange, C.ink); ctx.restore();
    ctx.save(); ctx.translate(41, -30); ctx.rotate(opening * 1.15); roundRect(ctx, -41, -5, 41, 10, 2, C.orange, C.ink); ctx.restore();
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI + i * Math.PI / 6;
      const reach = opening * (42 + (i % 3) * 10);
      star(ctx, Math.cos(a) * reach, -38 + Math.sin(a) * reach - Math.sin(time * 3 + i) * 4, 5 + (i % 2) * 3, i % 2 ? C.mint : C.yellow);
    }
  } else { line(ctx, [-41, -31, 0, -46, 41, -31], C.ink, 2); }
  ctx.restore();
}
function sceneryStars(ctx: Context, time: number) {
  for (let i = 0; i < 24; i++) {
    const x = 80 + ((i * 149 + 47) % 1120); const y = 143 + ((i * 83 + 21) % 290);
    const glow = 0.45 + 0.25 * Math.sin(time * 1.3 + i * 2.7);
    ctx.save(); ctx.globalAlpha = glow;
    if (i % 4 === 0) star(ctx, x, y, 7, C.deep); else circle(ctx, x, y, 2, C.muted);
    ctx.restore();
  }
}

function station(ctx: Context, time: number) {
  const state = timeline(time);
  circle(ctx, 927, 310, 154, '#e7dec7');
  ctx.save(); ctx.translate(927, 310); ctx.rotate(-0.28);
  ctx.beginPath(); ctx.ellipse(0, 0, 193, 79, 0, 0, Math.PI * 2); ctx.strokeStyle = C.mint; ctx.lineWidth = 26; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 193, 79, 0, Math.PI, Math.PI * 2); ctx.strokeStyle = C.deep; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  circle(ctx, 903, 284, 18, C.paper); circle(ctx, 963, 346, 32, '#dad1ba');
  ship(ctx, 800 + Math.sin(time * 0.5) * 18, 207, 0.68, time);
  // The departure dock anchors the parcel before it is launched into orbit.
  roundRect(ctx, 104, 369, 185, 137, 21, C.mint, C.deep);
  roundRect(ctx, 126, 394, 69, 58, 11, C.deep); text(ctx, 'SC', 142, 430, 25, 700, C.white);
  roundRect(ctx, 205, 391, 63, 7, 3, C.white); roundRect(ctx, 205, 411, 48, 7, 3, C.white);
  roundRect(ctx, 114, 494, 790, 17, 8, C.deep);
  roundRect(ctx, 276, 473, 415, 21, 8, '#cdd8c1', C.deep);
  for (let i = 0; i < 13; i++) circle(ctx, 290 + i * 31, 484, 6, C.paper, C.deep);
  for (let i = 0; i < 3; i++) line(ctx, [334 + i * 190, 511, 334 + i * 190, 549], C.deep, 6);
  courier(ctx, 342, 473, time, state.launch > 0.3);
  roundRect(ctx, 433, 325, 100, 32, 16, C.white, C.line); text(ctx, 'TO: EARTH', 447, 346, 12, 700);
  ctx.save(); ctx.globalAlpha = 1 - smooth(progress(time, 1.8, 3));
  text(ctx, '下一站，地球。', 105, 264, 47, 700); text(ctx, '一位快递员，一份跨越星河的心意。', 107, 298, 17, 500, C.muted); ctx.restore();
  const route = smooth(progress(time, 2.5, 4.5));
  ctx.save(); ctx.globalAlpha = route; ctx.setLineDash([4, 9]);
  ctx.beginPath(); ctx.moveTo(526, 415); ctx.bezierCurveTo(730, 184, 850, 280, 1036, 303); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}

function orbit(ctx: Context, time: number) {
  const phase = progress(time, 4.5, 9.5);
  circle(ctx, 203, 296, 119, '#dce6cf'); circle(ctx, 175, 271, 17, C.paper); circle(ctx, 243, 324, 32, '#cad7bc');
  planet(ctx, 1051, 385, 93, '#efc66c', -0.34);
  planet(ctx, 799, 199, 34, C.orange, 0.22);
  ctx.save(); ctx.strokeStyle = C.deep; ctx.lineWidth = 2; ctx.setLineDash([7, 10]);
  ctx.beginPath(); ctx.ellipse(636, 323, 448, 153, -0.19, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(636, 323, 448, 153, -0.19, Math.PI * 0.96, Math.PI * 1.97); ctx.strokeStyle = C.mint; ctx.lineWidth = 20; ctx.stroke();
  // The same package now threads the long orbital route, with analytic ghosts.
  for (let i = 1; i <= 5; i++) {
    const ghost = timeline(Math.max(4.5, time - i * 0.13));
    ctx.save(); ctx.globalAlpha = (6 - i) * 0.035; packageBox(ctx, ghost.parcelX, ghost.parcelY, ghost.parcelRotation, 0.82, 0, time); ctx.restore();
  }
  ship(ctx, 420 + phase * 290, 172 + Math.sin(phase * Math.PI) * 35, 0.56, time);
  roundRect(ctx, 98, 442, 210, 66, 13, C.white, C.line); text(ctx, 'ORBIT 02', 117, 469, 12, 700, C.muted); text(ctx, '全速，奔向你的坐标。', 117, 493, 17, 600);
  star(ctx, 939, 198, 12, C.orange); star(ctx, 1148, 264, 9, C.deep);
}

function arrival(ctx: Context, time: number) {
  const state = timeline(time);
  circle(ctx, 323, 344, 174, '#e0e9d5');
  ctx.beginPath(); ctx.ellipse(340, 503, 228, 44, -0.03, 0, Math.PI * 2); ctx.fillStyle = C.mint; ctx.fill();
  roundRect(ctx, 172, 402, 172, 106, 24, C.white, C.deep);
  roundRect(ctx, 194, 418, 58, 74, 26, C.deep); roundRect(ctx, 265, 426, 52, 30, 10, C.mint, C.deep);
  line(ctx, [218, 402, 218, 365, 248, 365], C.deep, 3); circle(ctx, 250, 365, 6, C.orange);
  // Leaf silhouettes and landing pad share the same geometry language as the dock.
  for (let i = 0; i < 3; i++) {
    const x = 134 + i * 155;
    line(ctx, [x, 490, x, 423], C.deep, 3);
    ctx.beginPath(); ctx.ellipse(x - 12, 448, 14, 27, -0.65, 0, Math.PI * 2); ctx.fillStyle = C.deep; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 12, 434, 13, 24, 0.6, 0, Math.PI * 2); ctx.fillStyle = C.mint; ctx.fill();
  }
  courier(ctx, 440, 487, time, true);
  roundRect(ctx, 307, 480, 92, 14, 7, C.deep);
  ctx.save(); ctx.globalAlpha = state.endTitle;
  text(ctx, '星港快递', 622, 300, 76, 750);
  text(ctx, 'STARPORT COURIER', 627, 339, 20, 600, C.muted);
  text(ctx, '把宇宙送到你手里。', 625, 395, 27, 500);
  roundRect(ctx, 625, 433, 201, 46, 23, C.orange); text(ctx, 'YOUR NEXT ADVENTURE', 645, 462, 13, 700, C.ink);
  star(ctx, 1045, 261, 21, C.yellow); star(ctx, 1137, 358, 11, C.orange); star(ctx, 579, 425, 12, C.mint);
  ctx.restore();
  if (state.opening > 0) {
    for (let i = 0; i < 12; i++) {
      const theta = i * 2.39996; const distance = state.opening * (62 + i * 8);
      const x = 350 + Math.cos(theta) * distance; const y = 385 + Math.sin(theta) * distance * 0.65 - state.opening * 65;
      ctx.save(); ctx.translate(x, y); ctx.rotate(theta + time * 0.3); roundRect(ctx, -3, -5, 6, 10, 2, i % 2 ? C.orange : C.deep); ctx.restore();
    }
  }
}

/** Stateless: every pixel is a function of t, fixed geometry, and canvas size. */
export function drawFrame(canvas: HTMLCanvasElement, rawTime: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable');
  const state = timeline(rawTime);
  ctx.save(); ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
  ctx.globalAlpha = 1; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  roundRect(ctx, 42, 42, 1196, 636, 23, C.paper, C.line);
  text(ctx, '✦ 游造', 74, 88, 22, 700);
  text(ctx, 'INDEPENDENT WORLDS, IN MOTION', 169, 87, 11, 600, C.muted);
  roundRect(ctx, 1077, 65, 124, 30, 15, C.white, C.line); text(ctx, 'LAUNCH FILM / 01', 1090, 85, 10, 700);
  ctx.save(); ctx.beginPath(); ctx.roundRect(63, 112, 1154, 448, 18); ctx.clip();
  sceneryStars(ctx, state.time);
  // Only the backgrounds dissolve; the parcel remains a single uninterrupted object.
  const mix01 = smooth(progress(state.time, 4.2, 4.8));
  const mix12 = smooth(progress(state.time, 9.2, 9.8));
  if (mix01 < 1) { ctx.save(); ctx.globalAlpha = 1 - mix01; station(ctx, Math.min(state.time, 4.5)); ctx.restore(); }
  if (mix01 > 0 && mix12 < 1) { ctx.save(); ctx.globalAlpha = mix01 * (1 - mix12); orbit(ctx, state.time); ctx.restore(); }
  if (mix12 > 0) { ctx.save(); ctx.globalAlpha = mix12; arrival(ctx, state.time); ctx.restore(); }
  packageBox(ctx, state.parcelX, state.parcelY, state.parcelRotation, lerp(0.82, 1.08, state.land), state.opening, state.time);
  ctx.restore();
  line(ctx, [73, 568, 1207, 568], C.line, 1);
  text(ctx, ACTS[state.act].label, 75, 605, 13, 650, C.muted);
  text(ctx, ACTS[state.act].title, 75, 646, 29, 650);
  for (let i = 0; i < 3; i++) {
    const x = 967 + i * 76;
    roundRect(ctx, x, 615, 62, 4, 2, C.line);
    const p = clamp((state.time - ACTS[i].start) / (ACTS[i].end - ACTS[i].start));
    if (p > 0) roundRect(ctx, x, 615, 62 * p, 4, 2, ACTS[i].color);
    text(ctx, `0${i + 1}`, x, 643, 12, 600, i === state.act ? C.ink : C.muted);
  }
  ctx.restore();
}

export function installRenderContract(canvas: HTMLCanvasElement) {
  const contract = window as unknown as { render: (time: number) => void; READY: boolean; DUR: number; __MOTION_SOURCE: string };
  contract.READY = false; contract.DUR = DUR; contract.__MOTION_SOURCE = 'src/features/motion/timeline.ts + renderer.ts';
  contract.render = (time: number) => drawFrame(canvas, time);
  void document.fonts.ready.then(() => { contract.render(0.8); contract.READY = true; });
  return () => { contract.READY = false; };
}
