import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function openPage(path='render.html',viewport={width:1280,height:720}) {
  const server=await createServer({root,logLevel:'error',server:{host:'127.0.0.1',port:4187,strictPort:false}});await server.listen();
  const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(new URL(path,server.resolvedUrls.local[0]).href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.READY===true&&typeof window.render==='function');
  return {page,errors,close:async()=>{await browser.close();await server.close();}};
}
export const capture=async(page,t)=>Buffer.from(await page.evaluate(time=>{window.render(time);return document.querySelector('canvas').toDataURL('image/png').split(',')[1];},t),'base64');
