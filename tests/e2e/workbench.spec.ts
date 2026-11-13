import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function downloadedText(page: Page, action: () => Promise<void>) {
  const received = page.waitForEvent('download');
  await action();
  const download = await received;
  const path = await download.path();
  expect(path).toBeTruthy();
  return { name: download.suggestedFilename(), text: await readFile(path!, 'utf8') };
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  (page as Page & { runtimeErrors: string[] }).runtimeErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect((page as Page & { runtimeErrors: string[] }).runtimeErrors).toEqual([]);
});

for (const [workspace, title] of [['design', '设计工作室'], ['motion', '动画放映室'], ['project', '项目驾驶舱']] as const) {
  test(`${title}在目标设备可读、可操作且没有可访问性问题`, async ({ page }, testInfo) => {
    await page.goto(`/#${workspace}`);
    await expect(page.getByRole('tab', { name: new RegExp(title) })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel', { name: new RegExp(title) })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    expect(overflow).toBe(false);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${workspace}.png`), fullPage: true });
  });
}

test('导航键盘和技能工具箱形成完整可访问路径', async ({ page }) => {
  await page.goto('/');
  const firstTab = page.getByRole('tab', { name: /设计工作室/ });
  await firstTab.focus();
  await firstTab.press('ArrowRight');
  await expect(page).toHaveURL(/#motion$/);
  await expect(page.getByRole('tab', { name: /动画放映室/ })).toBeFocused();
  await page.getByRole('button', { name: /技能工具箱/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('article')).toHaveCount(6);
  await expect(dialog.getByRole('link', { name: /源文件/ })).toHaveCount(6);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('场景真实修改、键盘移动、快照独立和刷新恢复', async ({ page }) => {
  await page.goto('/#design');
  const ship = page.getByRole('button', { name: /^选择快递飞船，方向键移动$/ });
  await ship.click();
  const before = await page.locator('#ds-object-x').inputValue();
  await ship.focus();
  await ship.press('ArrowRight');
  await expect(page.locator('#ds-object-x')).toHaveValue(String(Number(before) + 2));
  await page.getByLabel('对象名称', { exact: true }).fill('月面邮差');
  await page.getByLabel('版本名称', { exact: true }).fill('验收版本 A');
  await page.getByRole('button', { name: '保存版本', exact: true }).click();
  await expect(page.locator('.ds-status')).toContainText('已保存');
  await page.getByLabel('对象名称', { exact: true }).fill('尚未保存的修改');
  await page.reload();
  await page.locator('.ds-objects').getByRole('button', { name: '月面邮差', exact: true }).click();
  await expect(page.getByLabel('对象名称', { exact: true })).toHaveValue('月面邮差');
  await expect(page.locator('#ds-object-x')).toHaveValue(String(Number(before) + 2));
  await page.getByRole('button', { name: '复制当前版本', exact: true }).click();
  await expect(page.locator('.ds-status')).toContainText('已复制');
  await expect(page.locator('#ds-version-history option')).toHaveCount(3);
});

test('介绍页忠实于输入、主题导出一致、空内容不可导出', async ({ page, context }) => {
  await page.goto('/#design');
  await page.locator('#ds-tab-theme').click();
  await page.getByRole('button', { name: /午夜/ }).click();
  const tokens = await downloadedText(page, () => page.getByRole('button', { name: /下载设计变量/ }).click());
  const parsed = JSON.parse(tokens.text);
  expect(parsed.name).toContain('午夜');
  const themePaper = await page.locator('.design-studio').evaluate(el => getComputedStyle(el).getPropertyValue('--ds-paper').trim());
  expect(parsed.colors.paper).toBe(themePaper);
  await page.locator('#ds-tab-document').click();
  const gameplayInput = '# 月面温室\n\n每轮移动一个种植格。\n\n## 标签\n<script>window.__plant = 1</script>\n*尚未实现联网*';
  await page.getByLabel('玩法文档', { exact: true }).fill(gameplayInput);
  await page.getByRole('button', { name: '生成介绍页', exact: true }).click();
  const html = await downloadedText(page, () => page.getByRole('button', { name: /下载介绍页 HTML/ }).click());
  expect(html.text).toContain('&lt;script&gt;');
  expect(html.text).toContain('*尚未实现联网*');
  const output = await context.newPage();
  await output.setContent(html.text);
  await expect(output.getByRole('heading', { name: '月面温室', exact: true })).toBeVisible();
  await expect(output.getByText('<script>window.__plant = 1</script>', { exact: true })).toBeVisible();
  expect(await output.evaluate(() => Reflect.get(window, '__plant'))).toBeUndefined();
  expect(await output.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
  await output.close();
  await page.getByLabel('玩法文档', { exact: true }).fill('');
  await expect(page.getByRole('button', { name: '生成介绍页', exact: true })).toBeDisabled();
});

test('损坏的本地存储可恢复，保存不可用时给出明确反馈', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('youzao.design.versions.v1', '{invalid');
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'youzao.design.versions.v1') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.goto('/#design');
  await expect(page.getByLabel('对象名称', { exact: true })).toBeVisible();
  await expect(page.locator('.ds-status')).toContainText('格式无效');
  await page.getByLabel('对象名称', { exact: true }).fill('保留当前设计');
  await page.getByRole('button', { name: '保存版本', exact: true }).click();
  await expect(page.locator('.ds-status')).toContainText(/保存失败|无法保存|未能保存/);
  await expect(page.getByLabel('对象名称', { exact: true })).toHaveValue('保留当前设计');
});

test('需求、技术决定和人工修改进入独立交接包', async ({ page }) => {
  await page.goto('/#project');
  await page.getByLabel('项目名称', { exact: true }).fill('月面温室');
  await page.getByLabel(/第一版用什么判断有用/).fill('十轮内让所有植株获得光照');
  await page.getByLabel(/这轮的时间与不做范围/).fill('两周；离线单人；不做账号和排行榜');
  await page.getByRole('button', { name: /生成 PRD 与决策/ }).click();
  const prd = page.getByLabel('PRD 草稿内容');
  await expect(prd).toContainText('月面温室');
  const edited = `${await prd.inputValue()}\n## 人工补充\n保留十轮限制。`;
  await prd.fill(edited);
  const brief = await downloadedText(page, () => page.getByRole('button', { name: /下载 PRD/ }).click());
  expect(brief.text).toContain('\n## 人工补充\n保留十轮限制。');
  expect(brief.text).not.toContain('\\n');
  await page.getByRole('button', { name: /技术选型/ }).click();
  await page.getByLabel('私密密钥需求').selectOption('server');
  await expect(page.locator('.project-option').first().getByRole('heading')).toHaveText('网页 + 轻量服务');
  await page.getByLabel('采用理由或需要保留的取舍').fill('密钥必须留在服务端，接受备份维护。');
  await page.getByRole('button', { name: /生成 ADR/ }).click();
  const adr = await downloadedText(page, () => page.getByRole('button', { name: /下载 ADR/ }).click());
  expect(adr.text).toContain('网页 + 轻量服务');
  expect(adr.text).toContain('密钥必须留在服务端');
  await page.getByRole('button', { name: /上下文恢复/ }).click();
  await page.getByLabel('下一次会话的具体任务').fill('从当前源码核对十轮限制，然后实现下一项任务。');
  await page.getByRole('button', { name: /生成交接包/ }).click();
  const pack = await downloadedText(page, () => page.getByRole('button', { name: /下载交接包/ }).click());
  expect(pack.text).toContain('保留十轮限制。');
  expect(pack.text).toContain('网页 + 轻量服务');
  expect(pack.text).toContain('未读取真实Git');
  expect(pack.text).toContain('从当前源码核对十轮限制');
});

test('依赖和证据阻止虚报完成，刷新后恢复进度，重开前置使下游失效', async ({ page }) => {
  await page.goto('/#project');
  await page.getByRole('button', { name: /交付看板/ }).click();
  const scope = page.locator('.project-task').filter({ has: page.getByRole('heading', { name: '确认首版边界', exact: true }) });
  const route = page.locator('.project-task').filter({ has: page.getByRole('heading', { name: '搭建一次配送循环', exact: true }) });
  await expect(route.getByRole('button', { name: /登记验收/ })).toBeDisabled();
  await scope.getByRole('button', { name: /登记验收/ }).click();
  await expect(page.getByRole('status')).toContainText('步骤');
  await scope.getByLabel('实际步骤与结果').fill('已在实际PRD核对目标、成功标准与不做范围。');
  await scope.getByRole('button', { name: /登记验收/ }).click();
  await expect(route.getByRole('button', { name: /登记验收/ })).toBeEnabled();
  await route.getByLabel('实际步骤与结果').fill('演示中核对完整路径；本条为人工记录，不是自动测试结果。');
  await route.getByRole('button', { name: /登记验收/ }).click();
  const tasks = await downloadedText(page, () => page.getByRole('button', { name: /下载任务与证据/ }).click());
  expect(JSON.parse(tasks.text).tasks[1].evidence.note).toContain('本条为人工记录');
  await page.reload();
  await page.getByRole('button', { name: /交付看板/ }).click();
  await expect(route.getByRole('button', { name: '重新打开' })).toBeVisible();
  await expect(route).toContainText('原始输入未保存在本机');
  await scope.getByRole('button', { name: '重新打开' }).click();
  await expect(route.getByRole('button', { name: /登记验收/ })).toBeDisabled();
  await expect(route).toContainText('等待前置');
});

test('硬约束禁止采用不合格技术路线，过期ADR不可下载', async ({ page }) => {
  await page.goto('/#project');
  await page.getByRole('button', { name: /技术选型/ }).click();
  await page.getByLabel('私密密钥需求').selectOption('server');
  const staticOption = page.locator('.project-option').filter({ has: page.getByRole('heading', { name: '静态网页', exact: true }) });
  await expect(staticOption.getByRole('button')).toBeDisabled();
  await expect(page.getByRole('button', { name: /下载 ADR/ })).toBeDisabled();
  await page.getByRole('button', { name: /生成 ADR/ }).click();
  await expect(page.getByRole('button', { name: /下载 ADR/ })).toBeEnabled();
  await page.getByLabel('保存需求').selectOption('shared');
  await expect(page.getByRole('button', { name: /下载 ADR/ })).toBeDisabled();
  await page.getByRole('button', { name: /上下文恢复/ }).click();
  await page.getByRole('button', { name: /生成交接包/ }).click();
  const pack = await downloadedText(page, () => page.getByRole('button', { name: /下载交接包/ }).click());
  expect(pack.text).toContain('跨设备共享');
  expect(pack.text).toContain('选择：网页 + 轻量服务');
});

test('动画可乱序确定性回放、播放与逐帧、真实MP4可下载', async ({ page }) => {
  await page.goto('/#motion');
  await page.waitForFunction(() => Reflect.get(window, 'READY') === true);
  const hashes = await page.evaluate(() => {
    const render = Reflect.get(window, 'render') as (time: number) => void;
    const canvas = document.querySelector('.motion-canvas-wrap canvas') as HTMLCanvasElement;
    render(6.5); const first = canvas.toDataURL();
    render(1); render(12); render(6.5);
    return [first, canvas.toDataURL()];
  });
  expect(hashes[0]).toBe(hashes[1]);
  await page.getByRole('button', { name: '查看穿越轨道风格帧' }).click();
  await expect(page.getByLabel('动画时间', { exact: true })).toHaveValue('6.5');
  await page.getByRole('button', { name: '下一帧', exact: true }).click();
  expect(Number(await page.getByLabel('动画时间', { exact: true }).inputValue())).toBeGreaterThan(6.5);
  await page.getByRole('button', { name: '播放动画', exact: true }).click();
  await expect(page.getByRole('button', { name: '暂停动画', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  await page.getByLabel('播放速度', { exact: true }).selectOption('2');
  await expect(page.getByLabel('播放速度', { exact: true })).toHaveValue('2');
  const href = await page.getByRole('link', { name: /下载发布短片/ }).getAttribute('href');
  expect(href).toBeTruthy();
  const response = await page.request.get(href!);
  expect(response.ok()).toBe(true);
  const bytes = await response.body();
  expect(bytes.length).toBeGreaterThan(100_000);
  expect(bytes.subarray(4, 8).toString()).toBe('ftyp');
});

test('换题材设计示例保留原文与安全标签，真实文件可下载', async ({ page }) => {
  await page.goto('/reuse/moon-greenhouse/');
  await expect(page.getByRole('heading', { name: '月面温室', exact: true })).toBeVisible();
  await expect(page.getByText("<script>alert('seed')</script>", { exact: true })).toBeVisible();
  expect(await page.locator('script').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const tokenResponse = await page.request.get('/reuse/moon-greenhouse/tokens.json');
  expect(tokenResponse.ok()).toBe(true);
  expect(JSON.parse(await tokenResponse.text()).colors).toBeTruthy();
});

test('换题材动画示例提供独立时间轴和真正八秒MP4', async ({ page }) => {
  await page.goto('/reuse/moon-garden/');
  await expect(page.getByRole('heading', { name: '月面花园', exact: true })).toBeVisible();
  await page.waitForFunction(() => Reflect.get(window, 'READY') === true);
  await page.getByRole('button', { name: '开花 · 7.4s' }).click();
  await expect(page.getByLabel('任意拖动时间轴')).toHaveValue('7.4');
  await page.getByRole('button', { name: '播放动画', exact: true }).click();
  await expect(page.getByRole('button', { name: '暂停动画', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const response = await page.request.get('/reuse/moon-garden/lunar-garden.mp4');
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(4, 8).toString()).toBe('ftyp');
});
