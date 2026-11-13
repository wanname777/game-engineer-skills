import { DUR, WIDTH, HEIGHT, PALETTE as C, timeline, seedPosition, progress, smooth, lerp } from './timeline.js';

function ellipse(ctx,x,y,rx,ry,rotation=0,fill,stroke=C.green,width=3) {
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function line(ctx,points,color=C.green,width=3) {
  ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function seedShape(ctx,x,y,rotation=0,opacity=1) {
  ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.rotate(rotation);
  ctx.beginPath();ctx.moveTo(-16,0);ctx.bezierCurveTo(-7,-15,12,-13,18,0);ctx.bezierCurveTo(7,12,-10,13,-16,0);
  ctx.fillStyle=C.yellow;ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=3;ctx.stroke();
  line(ctx,[[-8,0],[8,0]],C.green,2);ctx.restore();
}
const STARS=[[132,240,5],[288,102,5],[432,300,3],[607,76,4],[768,201,5],[1052,82,4],[1175,258,5],[490,439,4],[88,473,3]];
const CRATERS=[[786,594,26,9],[1090,565,22,8],[1168,680,36,12],[700,708,45,13],[972,710,16,6]];

function greenhouse(ctx,t) {
  const x=910, floor=640;
  // A transparent geometric dome, sitting on the lunar soil.
  ctx.beginPath();ctx.moveTo(x-112,floor);ctx.lineTo(x-112,532);ctx.bezierCurveTo(x-112,470,x-62,422,x,422);ctx.bezierCurveTo(x+62,422,x+112,470,x+112,532);ctx.lineTo(x+112,floor);ctx.closePath();
  ctx.fillStyle='rgba(244,240,228,0.82)';ctx.fill();ctx.strokeStyle=C.green;ctx.lineWidth=4;ctx.stroke();
  ctx.save();ctx.globalAlpha=0.45;
  ctx.beginPath();ctx.moveTo(x-64,floor);ctx.lineTo(x-64,534);ctx.bezierCurveTo(x-64,475,x-30,422,x,422);ctx.bezierCurveTo(x+30,422,x+64,475,x+64,534);ctx.lineTo(x+64,floor);ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.stroke();
  line(ctx,[[x-111,531],[x+111,531]],C.green,2);
  line(ctx,[[x,422],[x,473]],C.green,2);
  ctx.restore();
  // Reflected cream arcs keep the enclosure legible without texture assets.
  ctx.beginPath();ctx.moveTo(x-84,509);ctx.bezierCurveTo(x-81,480,x-62,458,x-38,447);ctx.strokeStyle=C.paper;ctx.lineWidth=8;ctx.stroke();
  ellipse(ctx,x,floor+5,123,13,0,C.green,C.green,2);
  ellipse(ctx,x,floor-3,107,9,0,C.yellow,C.green,2);
  ctx.fillStyle=C.green;ctx.fillRect(x-110,floor+5,220,13);
  line(ctx,[[x-137,floor+19],[x+137,floor+19]],C.green,4);
  const f=timeline(t);
  if(t>=4.65) {
    ctx.save();ctx.globalAlpha=(1-progress(t,4.65,5.15))*0.8;
    ellipse(ctx,x,floor-5,8+f.landing*36,3+f.landing*9,0,undefined,C.yellow,2);ctx.restore();
  }
  if(f.growth>0) {
    const tipY=lerp(floor-7,493,f.growth);
    ctx.beginPath();ctx.moveTo(x,floor-7);ctx.bezierCurveTo(x-6,floor-54,x+8,tipY+30,x,tipY);
    ctx.strokeStyle=C.green;ctx.lineWidth=6;ctx.stroke();
    const leafScale=f.leaves;
    ctx.save();ctx.translate(x-2,568);ctx.scale(leafScale,leafScale);
    ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-45,-39,-55,-28);ctx.quadraticCurveTo(-48,7,0,0);ctx.fillStyle=C.green;ctx.fill();
    line(ctx,[[-7,-2],[-42,-23]],C.sage,1.5);ctx.restore();
    ctx.save();ctx.translate(x+2,547);ctx.scale(leafScale,leafScale);
    ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(42,-40,54,-30);ctx.quadraticCurveTo(45,9,0,0);ctx.fillStyle=C.green;ctx.fill();
    line(ctx,[[7,-2],[43,-24]],C.sage,1.5);ctx.restore();
    if(f.bloom>0) {
      ctx.save();ctx.translate(x,tipY);ctx.scale(f.bloom,f.bloom);ctx.rotate(Math.sin(t*1.5)*0.04);
      for(let i=0;i<6;i++) {const a=i*Math.PI/3;ellipse(ctx,Math.cos(a)*22,Math.sin(a)*22,24,14,a,C.yellow,C.green,2);}
      ellipse(ctx,0,0,13,13,0,C.paper,C.green,2.5);
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(ctx,Math.cos(a)*5,Math.sin(a)*5,1.2,1.2,0,C.green,null);}
      ctx.restore();
    }
  }
}

export function drawFrame(canvas,rawTime) {
  const t=Math.max(0,Math.min(DUR,Number.isFinite(rawTime)?rawTime:0));const f=timeline(t);
  const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.scale(canvas.width/WIDTH,canvas.height/HEIGHT);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.fillStyle=C.paper;ctx.fillRect(0,0,WIDTH,HEIGHT);
  // Subtle screen-space corner marks establish the editorial frame.
  ctx.strokeStyle=C.green;ctx.lineWidth=1;ctx.globalAlpha=0.3;
  line(ctx,[[40,75],[40,40],[75,40]],C.green,1);line(ctx,[[1205,680],[1240,680],[1240,645]],C.green,1);ctx.globalAlpha=1;
  ctx.save();ctx.translate(640,360);ctx.scale(f.cameraScale,f.cameraScale);ctx.translate(-f.cameraX,-f.cameraY);
  for(const [x,y,r] of STARS) {
    ctx.save();ctx.globalAlpha=0.7;line(ctx,[[x-r,y],[x+r,y]],C.green,1.5);line(ctx,[[x,y-r],[x,y+r]],C.green,1.5);ctx.restore();
  }
  // Large moon, made from a single circle plus original simple crater marks.
  ellipse(ctx,905,850,390,390,0,C.sage,C.green,3);
  ctx.save();ctx.globalAlpha=0.35;for(const [x,y,rx,ry] of CRATERS) ellipse(ctx,x,y,rx,ry,-0.12,C.light,C.green,1.5);ctx.restore();
  // The lunar orbit is carried from wide view into the greenhouse arrival.
  ctx.save();ctx.globalAlpha=0.65*(1-smooth(progress(t,3.45,4.5)));ctx.setLineDash([7,12]);
  ellipse(ctx,720,420,470,235,-0.22,undefined,C.green,2);ctx.setLineDash([]);ctx.restore();
  greenhouse(ctx,t);
  // Deterministic trailing seed positions, sampled from absolute earlier times.
  if(t<4.65) {
    ctx.save();ctx.globalAlpha=0.5;const trail=[];for(let i=9;i>=1;i--){const p=seedPosition(Math.max(0,t-i*0.045));trail.push([p.x,p.y]);}
    line(ctx,trail,C.yellow,3);ctx.restore();
  }
  seedShape(ctx,f.seed.x,f.seed.y,f.seed.rotation,f.seedOpacity);
  // Petal-like warm light signals the bloom but never obscures the subject.
  if(f.bloom>0) for(let i=0;i<5;i++) {
    const a=lerp(-2.8,-0.4,i/4), r=44+progress(t,6.1,7.2)*28;
    ctx.save();ctx.globalAlpha=Math.sin(Math.PI*progress(t,6.1,7.4))*0.7;
    line(ctx,[[910+Math.cos(a)*r,493+Math.sin(a)*r],[910+Math.cos(a)*(r+7),493+Math.sin(a)*(r+7)]],C.yellow,2);ctx.restore();
  }
  ctx.restore();
  // Typography stays at fixed screen size during the continuous camera move.
  ctx.fillStyle=C.green;ctx.font='600 16px "PingFang SC", sans-serif';ctx.fillText('LUNAR GARDEN',88,91);
  ctx.font='600 54px "PingFang SC", sans-serif';ctx.fillText('月面花园',86,158);
  ctx.globalAlpha=0.6;ctx.font='400 14px "PingFang SC", sans-serif';ctx.fillText('AN ORIGINAL EIGHT-SECOND FILM',89,190);ctx.globalAlpha=1;
  const initialOpacity=1-smooth(progress(t,2.3,3.5));
  ctx.save();ctx.globalAlpha=initialOpacity;ctx.font='400 23px "PingFang SC", sans-serif';ctx.fillText('一粒种子，越过寂静。',89,560);ctx.restore();
  ctx.save();ctx.globalAlpha=f.ending;ctx.font='500 44px "PingFang SC", sans-serif';ctx.fillText('在寂静里，',89,385);ctx.fillText('种一点光。',89,447);
  line(ctx,[[91,480],[169,480]],C.yellow,5);ctx.font='400 18px "PingFang SC", sans-serif';ctx.fillText('A SMALL BLOOM, FAR FROM HOME.',89,519);ctx.restore();
  ctx.globalAlpha=0.65;ctx.font='500 13px "PingFang SC", sans-serif';ctx.fillText(['01 / ORBIT','02 / LAND','03 / BLOOM'][f.act],89,662);ctx.globalAlpha=1;
  ctx.fillStyle=C.green;ctx.fillRect(88,686,1104,2);ctx.fillStyle=C.yellow;ctx.fillRect(88,684,1104*(t/DUR),6);
}

export async function installRenderContract(canvas) {
  window.READY=false;window.DUR=DUR;window.render=t=>drawFrame(canvas,t);window.__MOTION_SOURCE='src/renderer.js + src/timeline.js';
  await document.fonts.ready;window.render(0);window.READY=true;
}
