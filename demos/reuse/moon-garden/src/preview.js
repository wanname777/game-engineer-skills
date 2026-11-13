import { DUR,FPS,makeAudioSamples,clamp } from './timeline.js';
import { installRenderContract } from './renderer.js';
const canvas=document.querySelector('canvas');await installRenderContract(canvas);
const controls=Object.fromEntries(['play','previous','next','speed','sound','time','seek'].map(id=>[id,document.getElementById(id)]));
let time=0,playing=false,speed=1,startTime=0,startWall=0,enabled=false,audioContext,buffer,source;
function stopAudio(){if(source){source.stop();source.disconnect();source=null;}}
async function startAudio(){
  stopAudio();if(!enabled||!playing)return;
  if(!audioContext){audioContext=new AudioContext();const samples=makeAudioSamples(audioContext.sampleRate);buffer=audioContext.createBuffer(1,samples.length,audioContext.sampleRate);buffer.copyToChannel(samples,0);}
  await audioContext.resume();if(!playing||!enabled)return;
  source=audioContext.createBufferSource();source.buffer=buffer;source.playbackRate.value=speed;
  const gain=audioContext.createGain();gain.gain.value=0.8;source.connect(gain);gain.connect(audioContext.destination);source.start(0,time);
}
function update(t){time=clamp(t,0,DUR);window.render(time);controls.seek.value=String(time);controls.time.textContent=`${time.toFixed(2)} / ${DUR.toFixed(2)} s`;}
function pause(){playing=false;controls.play.textContent='播放';controls.play.setAttribute('aria-label','播放动画');stopAudio();}
function frame(wall){if(!playing)return;const t=startTime+(wall-startWall)/1000*speed;update(t);if(t>=DUR){pause();return;}requestAnimationFrame(frame);}
function play(){if(time>=DUR)update(0);playing=true;startTime=time;startWall=performance.now();controls.play.textContent='暂停';controls.play.setAttribute('aria-label','暂停动画');startAudio();requestAnimationFrame(frame);}
controls.play.addEventListener('click',()=>playing?pause():play());
controls.seek.addEventListener('input',()=>{pause();update(Number(controls.seek.value));});
controls.previous.addEventListener('click',()=>{pause();update(time-1/FPS);});
controls.next.addEventListener('click',()=>{pause();update(time+1/FPS);});
controls.speed.addEventListener('change',()=>{const active=playing;pause();speed=Number(controls.speed.value);if(active)play();});
controls.sound.addEventListener('click',()=>{enabled=!enabled;controls.sound.textContent=`声音：${enabled?'开':'关'}`;controls.sound.setAttribute('aria-pressed',String(enabled));if(enabled)startAudio();else stopAudio();});
document.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',()=>{pause();update(Number(button.dataset.time));}));
window.previewState=()=>({time,playing,speed,audioEnabled:enabled});
update(0);
