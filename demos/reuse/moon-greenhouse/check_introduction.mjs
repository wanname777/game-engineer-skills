import { createRequire } from 'node:module';
import { writeFile, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../../package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const folder = fileURLToPath(new URL('.', import.meta.url));
const port = 8769;
const origin = `http://127.0.0.1:${port}`;
const server = spawn('python3', ['-u', '-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', folder], { stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((resolve, reject) => {
  server.stdout.on('data', data => { if (data.toString().includes('Serving HTTP')) resolve(); });
  server.on('exit', code => reject(new Error(`HTTP server exited ${code}`)));
  server.on('error', reject);
});
const browser = await chromium.launch({ headless: true });
const expected = [
  '玩家在月球温室内布置三种种植格。每轮只能移动一个种植格，目标是在十轮内让所有植株获得光照。',
  '离线单人，尚未实现联网和排行榜。',
  "<script>alert('seed')</script>"
];
const report = { checkedAt: new Date().toISOString(), node: process.version, browser: await browser.version(), origin, viewports: [], downloads: [], fileMode: null, passed: false };
function check(condition, message) { if (!condition) throw new Error(message); }
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: width === 390, acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    const dialogs = [];
    const requests = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('dialog', dialog => { dialogs.push(dialog.message()); dialog.dismiss(); });
    page.on('request', request => requests.push(request.url()));
    await page.goto(`${origin}/introduction.html`, { waitUntil: 'networkidle' });
    check(await page.title() === '月面温室', 'Page title must match the project.');
    const paragraphs = await page.locator('.reading section p').allTextContents();
    check(JSON.stringify(paragraphs) === JSON.stringify(expected), `Original text differs at ${width}px.`);
    check(await page.locator('script').count() === 0, 'Literal plant label became an executable script.');
    const layout = await page.evaluate(() => {
      const reading = document.querySelector('.reading');
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        columns: getComputedStyle(reading).gridTemplateColumns,
        labelWhiteSpace: getComputedStyle(document.querySelector('section:nth-child(3) p')).whiteSpace,
        labelOverflowWrap: getComputedStyle(document.querySelector('section:nth-child(3) p')).overflowWrap
      };
    });
    check(layout.document <= width && layout.body <= width, `Horizontal overflow at ${width}px.`);
    const links = await page.getByRole('link').all();
    const hitTargets = [];
    for (const link of links) {
      const box = await link.boundingBox();
      hitTargets.push({ text: await link.textContent(), width: box.width, height: box.height });
      check(box.height >= 44 && box.width >= 44, 'A link touch target is too small.');
    }
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => ({ text: document.activeElement.textContent, outlineStyle: getComputedStyle(document.activeElement).outlineStyle, outlineWidth: getComputedStyle(document.activeElement).outlineWidth }));
    check(focused.text.includes('阅读玩法') && focused.outlineStyle === 'solid' && focused.outlineWidth === '3px', 'Reading link lacks visible keyboard focus.');
    await page.keyboard.press('Enter');
    const anchor = await page.evaluate(() => ({ hash: location.hash, activeId: document.activeElement.id, top: document.querySelector('#gameplay').getBoundingClientRect().top }));
    check(anchor.hash === '#gameplay' && anchor.activeId === 'gameplay', 'Reading navigation does not move focus to gameplay.');
    await page.keyboard.press('Tab');
    check((await page.evaluate(() => document.activeElement.textContent)).includes('设计变量 JSON'), 'Keyboard order does not reach token download.');
    const downloadPromise = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    const download = await downloadPromise;
    const downloadedPath = `${folder}/downloaded-${width}-tokens.json`;
    await download.saveAs(downloadedPath);
    check(JSON.stringify(JSON.parse(await readFile(downloadedPath, 'utf8'))) === JSON.stringify(JSON.parse(await readFile(`${folder}/tokens.json`, 'utf8'))), 'Downloaded tokens differ.');
    report.downloads.push({ viewport: width, name: download.suggestedFilename(), contentMatches: true });
    await page.keyboard.press('Tab');
    check((await page.evaluate(() => document.activeElement.textContent)).includes('结构化界面方案'), 'Keyboard order does not reach interface scheme download.');
    const specPromise = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    const specDownload = await specPromise;
    const specPath = `${folder}/downloaded-${width}-interface-spec.json`;
    await specDownload.saveAs(specPath);
    check(JSON.stringify(JSON.parse(await readFile(specPath, 'utf8'))) === JSON.stringify(JSON.parse(await readFile(`${folder}/interface-spec.json`, 'utf8'))), 'Downloaded specification differs.');
    report.downloads.push({ viewport: width, name: specDownload.suggestedFilename(), contentMatches: true });
    if (width === 390) {
      await page.goto(`${origin}/introduction.html`, { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: '阅读玩法' }).tap();
      check(new URL(page.url()).hash === '#gameplay', 'Touch navigation failed.');
    }
    const axe = await new AxeBuilder({ page }).analyze();
    check(axe.violations.length === 0, `Accessibility violations at ${width}px: ${axe.violations.map(v => v.id).join(', ')}`);
    check(errors.length === 0 && dialogs.length === 0, 'Page emitted an error or executed a dialog.');
    check(requests.every(url => url.startsWith(origin)), 'Page requested an external resource.');
    await page.goto(`${origin}/introduction.html`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${folder}/introduction-${width}.png`, fullPage: true });
    report.viewports.push({ width, height: 900, textExact: true, scriptElements: 0, dialogs, errors, layout, hitTargets, keyboardFocus: focused, readingAnchor: anchor, touchNavigation: width === 390 ? 'passed' : 'not applicable', reducedMotion: 'reduce', accessibilityViolations: axe.violations.length, externalRequests: 0, screenshot: `introduction-${width}.png` });
    await context.close();
  }
  const filePage = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await filePage.goto(`file://${folder}/introduction.html`, { waitUntil: 'load' });
  check(JSON.stringify(await filePage.locator('.reading section p').allTextContents()) === JSON.stringify(expected), 'Direct local file reading failed.');
  report.fileMode = { opened: true, textExact: true, horizontalOverflow: await filePage.evaluate(() => document.documentElement.scrollWidth > innerWidth) };
  check(!report.fileMode.horizontalOverflow, 'Direct file has horizontal overflow.');
  report.passed = true;
  await filePage.close();
} finally {
  await writeFile(`${folder}/browser-report.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  server.kill();
}
console.log(JSON.stringify(report, null, 2));
