const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const ext = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(__dirname, 'artifacts'), {recursive:true});
const target = 'https://blog.example.com/article?q=1';
const redirect = 'https://www.bing.com/ck/a?u=a1' + Buffer.from(target).toString('base64url');
const fixture = `<!doctype html><html><head><meta charset="utf-8"><title>Bing fixture</title></head><body><ol id="b_results">
<li class="b_algo" id="one"><h2><a href="${redirect}">博客中的文章</a></h2><p>测试摘要</p></li>
<li class="b_algo" id="two"><h2><a href="https://www.example.com/other">同站另一页</a></h2></li>
<li class="b_algo" id="safe"><h2><a href="https://notexample.com/">其他网站</a></h2></li>
</ol></body></html>`;
test('extension acceptance: scopes, management, dynamic DOM, persistence, concurrency', { timeout: 120000 }, async () => {
  assert.ok(fs.existsSync(path.join(ext, 'manifest.json')), 'extension manifest must exist');
  const context = await chromium.launchPersistentContext('', { channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`] });
  try {
    const sw = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const id = new URL(sw.url()).host;
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://www.bing.com/**', r => r.fulfill({ contentType: 'text/html', body: fixture }));
    await page.goto('https://www.bing.com/search?q=fixture');
    await page.locator('#one .bb-trigger').waitFor();
    assert.equal(await page.locator('.bb-trigger').count(), 3);
    await page.locator('#one .bb-trigger').click();
    await page.getByRole('button', { name: '仅此页面', exact: false }).click();
    await page.locator('#one').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#two').isVisible(), true);
    const manager = await context.newPage();
    await manager.goto(`chrome-extension://${id}/options.html`);
    await manager.getByRole('button', { name: '删除规则' }).click();
    await page.locator('#one').waitFor({ state: 'visible' });
    // Exact host only; sibling host remains.
    await page.locator('#one .bb-trigger').click();
    await page.getByRole('button', { name: '当前子域名', exact: false }).click();
    await page.locator('#one').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#two').isVisible(), true);
    // Add overlapping domain rule through real options form.
    await manager.getByLabel('网址或域名').fill('blog.example.com');
    await manager.getByLabel('屏蔽范围').selectOption('domain');
    await manager.getByRole('button', { name: '添加规则', exact: true }).click();
    await page.locator('#two').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#safe').isVisible(), true);
    await manager.getByLabel('搜索规则').fill('host:');
    await manager.getByRole('button', { name: '删除规则' }).click();
    assert.equal(await page.locator('#one').isVisible(), false);
    await manager.getByLabel('搜索规则').fill('');
    await page.reload();
    await page.locator('#one').waitFor({ state: 'hidden' });
    await page.evaluate(() => {
      const li = document.createElement('li'); li.className = 'b_algo'; li.id = 'late';
      li.innerHTML = '<h2><a href="https://new.example.com/new">动态结果</a></h2>';
      document.querySelector('#b_results').append(li);
    });
    await page.locator('#late').waitFor({ state: 'hidden' });
    await page.locator('#late a').evaluate(a => a.href = 'https://safe.org/');
    await page.locator('#late').waitFor({ state: 'visible' });
    await manager.getByRole('button', { name: '删除规则' }).click();
    await page.locator('#one').waitFor({ state: 'visible' });
    await page.locator('#two').waitFor({ state: 'visible' });
    // Race requests originate in two independent extension pages.
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${id}/popup.html`);
    const results = await Promise.all(Array.from({ length: 12 }, (_, i) => (i % 2 ? manager : popup).evaluate(async n => {
      return chrome.runtime.sendMessage({ action: 'add', rule: { type: 'host', value: `test${n}.example.org` } });
    }, i)));
    assert.ok(results.every(r => r.ok));
    assert.equal(await sw.evaluate(async () => (await chrome.storage.local.get('rules')).rules.length), 12);
    await popup.getByLabel('网址或域名').fill('popup.example.net');
    await popup.getByRole('button', { name: '添加规则', exact: true }).click();
    await popup.getByRole('status').filter({ hasText: '已添加' }).waitFor();
    await manager.getByLabel('搜索规则').fill('popup.example.net');
    await manager.getByRole('button', { name: '删除规则' }).waitFor();
    await manager.getByLabel('网址或域名').fill('com.cn');
    await manager.getByRole('button', { name: '添加规则', exact: true }).click();
    await manager.getByRole('status').filter({ hasText: '完整网站域名' }).waitFor();
    assert.deepEqual(errors, []);
    await manager.screenshot({ path: path.join(__dirname, 'artifacts/manager.png'), fullPage: true });
    await page.locator('#one .bb-trigger').click();
    await page.screenshot({ path: path.join(__dirname, 'artifacts/result-menu.png'), fullPage: true });
    console.log('PASS: real MV3 load, all scopes, restoration, dynamic DOM, reload, 12 concurrent writes, popup, validation');
  } finally { await context.close(); }
});
