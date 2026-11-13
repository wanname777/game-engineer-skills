import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { openPage,root } from './browser.mjs';
const b=await openPage('index.html',{width:1440,height:1200});
const record={title:'月面花园',reviewedAt:new Date().toISOString(),method:'Real HTMLVideoElement loaded generated MP4; sampled decoded video frames and played through ended event',frames:[],subjectiveListening:'Not claimed; audio metrics and local playback are recorded separately'};
try {
  await b.page.locator('summary').click();
  await b.page.waitForFunction(()=>document.querySelector('video').readyState>=2);
  record.media=await b.page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,currentSrc:v.currentSrc}));
  assert.equal(record.media.duration,8);assert.equal(record.media.width,1280);assert.equal(record.media.height,720);
  for(const t of [0.8,4.1,7.4]) {
    await b.page.locator('video').evaluate((v,t)=>new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;}),t);
    const png=await b.page.locator('video').evaluate(v=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/png').split(',')[1];});
    const file=`evidence/decoded-${t.toFixed(1)}s.png`;await writeFile(join(root,file),Buffer.from(png,'base64'));record.frames.push({time:t,file});
  }
  await b.page.locator('video').evaluate(v=>{v.currentTime=0;v.muted=false;});
  await b.page.locator('video').evaluate(v=>v.play());
  await b.page.waitForFunction(()=>document.querySelector('video').currentTime>3.9);
  await b.page.locator('video').screenshot({path:join(root,'evidence/mp4-playing-middle.png')});
  await b.page.waitForFunction(()=>document.querySelector('video').ended,{timeout:15000});
  record.playback=await b.page.locator('video').evaluate(v=>({ended:v.ended,currentTime:v.currentTime,muted:v.muted,volume:v.volume,error:v.error,readyState:v.readyState}));
  assert.equal(record.playback.ended,true);assert.equal(record.playback.error,null);record.pageErrors=b.errors;assert.deepEqual(b.errors,[]);
  await b.page.locator('video').screenshot({path:join(root,'evidence/mp4-ended.png')});
  await writeFile(join(root,'evidence/media-playback.json'),JSON.stringify(record,null,2)+'\n');
  console.log('PASS: actual MP4 loaded at 1280×720 / 8s, three decoded frames saved, unmuted playback reached ended without media or page errors.');
}finally{await b.close();}
