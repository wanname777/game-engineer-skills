import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const base = new URL(option('--url', 'https://wanname777.github.io/game-engineer-skills/'));
const out = resolve(option('--output', '/tmp/youzao-live-verification'));
await mkdir(out, { recursive: true });
const report = { url: base.href, checkedAt: new Date().toISOString(), viewports: [], reusedExamples: [], passed: false };
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, hasTouch: width === 390 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = new URL(base); url.searchParams.set('verify', Date.now().toString());
    const response = await page.goto(url.href, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle('游造 · 游戏创作工作台');
    await page.getByLabel('对象名称', { exact: true }).fill('线上验收飞船');
    await page.getByLabel('版本名称', { exact: true }).fill('独立浏览器线上验收');
    await page.getByRole('button', { name: '保存版本', exact: true }).click();
    await expect(page.locator('.ds-status')).toContainText('已保存');
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.ds-objects').getByRole('button', { name: '线上验收飞船', exact: true }).click();
    await expect(page.getByLabel('对象名称', { exact: true })).toHaveValue('线上验收飞船');
    await page.screenshot({ path: resolve(out, `design-${width}.png`), fullPage: true });
    await page.getByRole('tab', { name: /动画放映室/ }).click();
    await page.waitForFunction(() => window.READY === true);
    await page.getByRole('button', { name: '查看穿越轨道风格帧' }).click();
    await expect(page.getByLabel('动画时间', { exact: true })).toHaveValue('6.5');
    const movieUrl = await page.getByRole('link', { name: /下载发布短片/ }).getAttribute('href');
    const movie = await page.request.get(movieUrl);
    expect(movie.ok()).toBe(true);
    const bytes = await movie.body();
    expect(bytes.subarray(4, 8).toString()).toBe('ftyp');
    await page.getByRole('tab', { name: /项目驾驶舱/ }).click();
    await page.getByLabel('项目名称', { exact: true }).fill('线上独立验收');
    await page.getByRole('button', { name: /生成 PRD 与决策/ }).click();
    await expect(page.getByLabel('PRD 草稿内容')).toContainText('线上独立验收');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(errors).toEqual([]);
    report.viewports.push({ width, mainResponse: response.status(), saveAndReload: true, timelineSeek: true, mp4Bytes: bytes.length, projectPrd: true, pageErrors: errors });
    await context.close();
  }
  for (const [name, heading] of [['moon-greenhouse', '月面温室'], ['moon-garden', '月面花园']]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const response = await page.goto(new URL(`reuse/${name}/`, base).href, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    report.reusedExamples.push({ name, response: response.status(), headingVisible: true });
    await page.close();
  }
  report.passed = true;
} finally {
  await browser.close();
  await writeFile(resolve(out, 'live-report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));
