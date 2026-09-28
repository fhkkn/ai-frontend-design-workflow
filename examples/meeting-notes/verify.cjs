// Optional verification: install Playwright and start the local server first.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  const base = process.env.DEMO_URL || 'http://127.0.0.1:8765';
  const screenshots = path.join(__dirname, 'screenshots');
  fs.mkdirSync(screenshots, { recursive: true });
  const results = [];
  const errors = [];
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  async function check(name, fn) { await fn(); results.push(name); }
  try {
    for (const width of [360, 390, 640, 768, 900, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base);
      await check(`No page overflow at ${width}px`, async () => {
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      });
      if (width === 390 || width === 1440) await page.screenshot({ path: path.join(screenshots, `after-${width === 390 ? 'mobile' : 'desktop'}.png`), fullPage: true });
    }
    await check('Search and empty-state recovery', async () => {
      await page.locator('#search').fill('不存在的记录');
      assert.match(await page.locator('#note-list').innerText(), /没有匹配/);
      await page.locator('#search').fill('内容');
      assert.equal(await page.locator('.note-item').count(), 1);
      await page.locator('#search').fill('');
      assert.equal(await page.locator('.note-item').count(), 3);
    });
    await check('New note, empty title validation, save and reload', async () => {
      await page.locator('#new-note').click();
      await page.locator('#title').fill(' ');
      await page.locator('#save').click();
      assert.match(await page.locator('#feedback').innerText(), /请填写/);
      await page.locator('#title').fill('验收示例记录');
      await page.locator('#body').fill('这是一条用于验证持久化的虚构记录。');
      await page.locator('#save').click();
      assert.match(await page.locator('#save-state').innerText(), /已保存到本机/);
      await page.reload();
      assert.equal(await page.locator('#title').inputValue(), '验收示例记录');
      assert.match(await page.locator('#body').inputValue(), /验证持久化/);
    });
    await check('Cancel then discard unsaved changes', async () => {
      await page.locator('#title').fill('未保存修改');
      page.once('dialog', d => d.dismiss());
      await page.locator('.note-item').nth(1).click();
      assert.equal(await page.locator('#title').inputValue(), '未保存修改');
      page.once('dialog', d => d.accept());
      await page.locator('.note-item').nth(1).click();
      await page.locator('.note-item').first().click();
      assert.equal(await page.locator('#title').inputValue(), '验收示例记录');
    });
    await check('Discard new draft without leaving a ghost record', async () => {
      await page.locator('#new-note').click();
      await page.locator('.note-item').first().click();
      page.once('dialog', d => d.accept());
      await page.locator('.note-item').nth(1).click();
      assert.equal(await page.locator('.note-item').count(), 4);
    });
    await check('Keyboard focus, save, long title and body on mobile', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('#title').fill('用于检查移动端排版的长标题'.repeat(5));
      await page.locator('#body').fill('长内容与输入校验。\n'.repeat(40));
      await page.locator('#body').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'save');
      await page.keyboard.press('Enter');
      assert.match(await page.locator('#save-state').innerText(), /已保存到本机/);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    });
    await check('Storage write failure reports recovery guidance', async () => {
      await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Simulated storage failure'); }; });
      await page.locator('#body').fill('保存失败时仍保留编辑内容');
      await page.locator('#save').click();
      assert.match(await page.locator('#feedback').innerText(), /复制内容备份/);
      assert.equal(await page.locator('#body').inputValue(), '保存失败时仍保留编辑内容');
    });
    await check('Corrupted stored data falls back with notice', async () => {
      const isolated = await browser.newContext();
      await isolated.addInitScript(() => { Storage.prototype.getItem = () => '{broken'; });
      const fallback = await isolated.newPage();
      await fallback.goto(base);
      assert.equal(await fallback.locator('.note-item').count(), 3);
      assert.match(await fallback.locator('#feedback').innerText(), /无法读取/);
      await isolated.close();
    });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ browser: browser.version(), checks: results, pageErrors: errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
