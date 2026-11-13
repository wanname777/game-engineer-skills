import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DUR,FPS,seedPosition,timeline,sampleAudio,makeAudioSamples } from '../src/timeline.js';
import { root,openPage,capture } from './browser.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const record={title:'月面花园',checkedAt:new Date().toISOString(),checks:[],pageErrors:[]};
function check(name,fn){fn();record.checks.push({name,passed:true});}
check('8 seconds and 30 frames per second',()=>{assert.equal(DUR,8);assert.equal(FPS,30);});
check('seed remains continuous at the orbit-to-landing boundary',()=>{
  const a=seedPosition(3.2-1e-6),b=seedPosition(3.2+1e-6);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<0.001);
});
check('seed lands on soil and flower reaches full bloom',()=>{assert.equal(seedPosition(4.65).x,910);assert.equal(seedPosition(4.65).y,638);assert.equal(timeline(7.4).bloom,1);});
check('timeline clamps outside range and repeats independently of calls',()=>{
  assert.deepEqual(timeline(-10),timeline(0));assert.deepEqual(timeline(99),timeline(8));const a=timeline(4.1);timeline(8);timeline(0);assert.deepEqual(timeline(4.1),a);
});
check('audio samples are finite, audible, below clipping, and deterministic',()=>{
  const a=makeAudioSamples();const b=makeAudioSamples();assert.equal(a.length,384000);assert.deepEqual(a,b);
  const peak=a.reduce((p,x)=>Math.max(p,Math.abs(x)),0);const rms=Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length);
  assert.ok(peak<0.95&&peak>0.1);assert.ok(rms>0.005);assert.equal(sampleAudio(-1),0);assert.equal(sampleAudio(8),0);
  record.audio={peakLinear:peak,rmsLinear:rms,sampleRate:48000,samples:a.length};
});
const b=await openPage('index.html');
try {
  const seekChecks=[];
  for(const t of [0,0.8,3.2,4.1,4.65,6.4,7.4,8]) {
    const a=await capture(b.page,t);for(const s of [7.9,0.1,5.15,2.3])await b.page.evaluate(x=>window.render(x),s);
    const z=await capture(b.page,t);assert.ok(a.equals(z));seekChecks.push({time:t,first:hash(a),repeat:hash(z),identical:true});
  }
  record.repeatedSeekPixels=seekChecks;record.checks.push({name:'Eight repeated out-of-order seeks produce identical PNG bytes',passed:true});
  await b.page.getByRole('button',{name:'开花 · 7.4s',exact:true}).click();assert.equal((await b.page.evaluate(()=>window.previewState())).time,7.4);
  await b.page.getByRole('button',{name:'上一帧',exact:true}).click();assert.ok(Math.abs((await b.page.evaluate(()=>window.previewState())).time-(7.4-1/30))<1e-9);
  await b.page.getByRole('button',{name:'下一帧',exact:true}).click();assert.ok(Math.abs((await b.page.evaluate(()=>window.previewState())).time-7.4)<1e-9);
  await b.page.locator('#seek').evaluate(el=>{el.value='4.1';el.dispatchEvent(new Event('input',{bubbles:true}));});assert.ok(Math.abs((await b.page.evaluate(()=>window.previewState())).time-4.1)<0.034);
  await b.page.getByRole('combobox',{name:'播放速度'}).selectOption('2');assert.equal((await b.page.evaluate(()=>window.previewState())).speed,2);
  await b.page.getByRole('button',{name:'播放动画',exact:true}).click();await b.page.waitForFunction(()=>window.previewState().time>4.5);
  await b.page.getByRole('button',{name:'暂停动画',exact:true}).click();const paused=await b.page.evaluate(()=>window.previewState());assert.equal(paused.playing,false);
  await b.page.getByRole('button',{name:'声音：关',exact:true}).click();assert.equal((await b.page.evaluate(()=>window.previewState())).audioEnabled,true);
  record.checks.push({name:'Preview style jumps, frame steps, arbitrary seek, speed, playback, pause, sound toggle work in Chromium',passed:true});
  await b.page.setViewportSize({width:390,height:844});assert.ok(await b.page.evaluate(()=>document.documentElement.scrollWidth<=390));
  record.checks.push({name:'390px mobile preview has no horizontal overflow',passed:true});record.pageErrors=b.errors;assert.deepEqual(b.errors,[]);
  record.checks.push({name:'No browser runtime errors',passed:true});
  await writeFile(join(root,'evidence/check-results.json'),JSON.stringify(record,null,2)+'\n');
  console.log(`PASS: ${record.checks.length} meaningful checks; 8 deterministic seek pairs; no browser errors.`);
}finally{await b.close();}
