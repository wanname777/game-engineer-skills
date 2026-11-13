import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir,mkdtemp,readFile,writeFile,rename,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { root,openPage,capture } from './browser.mjs';
import { DUR,FPS,WIDTH,HEIGHT,ACTS,SOUND_EVENTS,makeAudioSamples } from '../src/timeline.js';
const stem='lunar-garden';
const hash=x=>createHash('sha256').update(x).digest('hex');
export function run(command,args) {
  return new Promise((resolve,reject)=>{const child=spawn(command,args,{stdio:['ignore','pipe','pipe']});let out='';child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>out+=d);child.on('error',reject);child.on('close',code=>code===0?resolve(out):reject(new Error(`${command} exited ${code}\n${out.slice(-6000)}`)));});
}
const b=await openPage();const temp=await mkdtemp(join(tmpdir(),'lunar-garden-frames-'));
try {
  const styleTimes=[0.8,4.1,7.4];
  for(const [i,t] of styleTimes.entries())await writeFile(join(root,`${stem}-style-${i+1}.png`),await capture(b.page,t));
  await writeFile(join(root,`${stem}-cover.png`),await capture(b.page,7.4));
  const times=[0.8,2.4,3.2,4.1,5.4,7.4];
  const frames=[];for(const t of times)frames.push({time:t,image:'data:image/png;base64,'+(await capture(b.page,t)).toString('base64')});
  const sheet=await b.page.evaluate(async frames=>{
    const c=document.createElement('canvas');c.width=1280;c.height=594;const ctx=c.getContext('2d');ctx.fillStyle='#f4f0e4';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#173f34';ctx.font='600 22px "PingFang SC",sans-serif';ctx.fillText('月面花园 / LUNAR GARDEN — ORIGINAL 8s FILM',24,35);
    for(let i=0;i<frames.length;i++){const im=new Image();im.src=frames[i].image;await im.decode();const x=20+(i%3)*420,y=58+Math.floor(i/3)*267;ctx.drawImage(im,x,y,400,225);ctx.fillStyle='#173f34';ctx.font='500 14px sans-serif';ctx.fillText(`${frames[i].time.toFixed(1)}s / ${i<2?'ORBIT':i<4?'LAND':'BLOOM'}`,x+6,y+247);}
    return c.toDataURL('image/png').split(',')[1];
  },frames);
  await writeFile(join(root,`${stem}-contact-sheet.png`),Buffer.from(sheet,'base64'));
  if(process.argv.includes('--styles')){console.log('Generated three style frames, cover, and six-frame contact sheet.');}
  else {
    const repeatedSeekPixels=[];
    for(const t of styleTimes){const a=await capture(b.page,t);for(const other of [7.9,0,5.2,2.3])await b.page.evaluate(x=>window.render(x),other);const z=await capture(b.page,t);if(!a.equals(z))throw new Error('Seek pixel mismatch');repeatedSeekPixels.push({time:t,first:hash(a),repeat:hash(z),identical:true});}
    console.log(`Rendering ${DUR*FPS} original frames at ${WIDTH}×${HEIGHT} / ${FPS} fps`);
    for(let i=0;i<DUR*FPS;i++){await writeFile(join(temp,`frame-${String(i).padStart(5,'0')}.png`),await capture(b.page,i/FPS));if(i%60===0||i===DUR*FPS-1)console.log(`Captured ${i+1}/${DUR*FPS}`);}
    const rate=48000,samples=makeAudioSamples(rate),wav=Buffer.alloc(44+samples.length*2);
    wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);
    let peak=0,squares=0;for(let i=0;i<samples.length;i++){const value=samples[i]*0.8;peak=Math.max(peak,Math.abs(value));squares+=value*value;wav.writeInt16LE(Math.round(value*32767),44+i*2);}
    const audio=join(temp,'soundtrack.wav');await writeFile(audio,wav);
    const video=join(temp,`${stem}.mp4`);
    const encodeLog=await run(ffmpegInstaller.path,['-hide_banner','-y','-framerate',String(FPS),'-i',join(temp,'frame-%05d.png'),'-i',audio,'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar',String(rate),'-movflags','+faststart','-t',String(DUR),video]);
    const verify=await run(ffmpegInstaller.path,['-hide_banner','-i',video,'-vf','blackdetect=d=0.04:pix_th=0.10','-af','volumedetect','-f','null','-']);
    const m=verify.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/),duration=m?Number(m[1])*3600+Number(m[2])*60+Number(m[3]):null;
    const decodedFrames=Number([...verify.matchAll(/frame=\s*(\d+)/g)].at(-1)?.[1]);
    const fps=Number(verify.match(/Video: h264[^\n]*?([\d.]+) fps/)?.[1]);
    const maxVolume=Number(verify.match(/max_volume:\s*([-\d.]+) dB/)?.[1]);
    const meanVolume=Number(verify.match(/mean_volume:\s*([-\d.]+) dB/)?.[1]);
    const blackFrames=[...verify.matchAll(/black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)/g)].map(m=>({start:Number(m[1]),end:Number(m[2]),duration:Number(m[3])}));
    const metrics={duration,fps,decodedFrames,maxVolumeDb:maxVolume,meanVolumeDb:meanVolume,blackFrames,pageErrors:b.errors};
    if(Math.abs(duration-DUR)>1/FPS||fps!==FPS||decodedFrames!==DUR*FPS||maxVolume>=0||!Number.isFinite(meanVolume)||meanVolume<-45||blackFrames.length||b.errors.length)throw new Error('Export validation failed: '+JSON.stringify(metrics));
    await rename(video,join(root,`${stem}.mp4`));await writeFile(join(root,`${stem}-soundtrack.wav`),wav);
    await writeFile(join(root,'evidence/encode.log'),encodeLog);await writeFile(join(root,`${stem}-validation.log`),verify);
    const files=['src/timeline.js','src/renderer.js','src/preview.js','scripts/render-motion.mjs','scripts/check.mjs','brief.json'];
    const sourceHashes=Object.fromEntries(await Promise.all(files.map(async p=>[p,hash(await readFile(join(root,p)))])));
    const contract=await b.page.evaluate(()=>({duration:window.DUR,source:window.__MOTION_SOURCE,ready:window.READY}));
    const meta={title:'月面花园 / Lunar Garden',original:true,renderedAt:new Date().toISOString(),width:WIDTH,height:HEIGHT,duration,fps,frames:decodedFrames,codec:'H.264 / yuv420p',audioCodec:'AAC',contract,acts:ACTS,soundEvents:SOUND_EVENTS,sourceHashes,environment:{node:process.version,platform:process.platform,arch:process.arch,ffmpegPath:ffmpegInstaller.path},validation:{repeatedSeekPixels,blackFrames,pageErrors:b.errors,audio:{sampleRate:rate,channels:1,samples:samples.length,peakLinear:peak,rmsLinear:Math.sqrt(squares/samples.length),maxVolumeDb:maxVolume,meanVolumeDb:meanVolume,clipping:false}},sourceEvidence:[{level:'Read first-party project specification',source:'/Users/bytedance/Documents/coding/game_engineer/.agents/skills/create-motion-showreel/SKILL.md'},{level:'Actual local execution',source:'evidence/check-results.json + lunar-garden-validation.log'},{level:'Original generated assets',source:'src/renderer.js + src/timeline.js'}],artifacts:{video:`${stem}.mp4`,audio:`${stem}-soundtrack.wav`,cover:`${stem}-cover.png`,styles:styleTimes.map((_,i)=>`${stem}-style-${i+1}.png`),contactSheet:`${stem}-contact-sheet.png`,preview:'index.html'},humanReview:{visual:'Pending actual visual inspection',audio:'Not claimed: automatic audio metrics only'}};
    await writeFile(join(root,`${stem}-metadata.json`),JSON.stringify(meta,null,2)+'\n');
    console.log(`Verified ${duration}s / ${fps}fps / ${decodedFrames} frames, no black intervals; audio peak ${maxVolume}dBFS, mean ${meanVolume}dBFS.`);
    console.log(`Saved ${join(root,`${stem}.mp4`)}`);
  }
}finally{await b.close();await rm(temp,{recursive:true,force:true});}
