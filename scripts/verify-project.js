const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('http://localhost:8080/south-atlantic/index.html');
      await page.locator('img').evaluateAll(images => Promise.all(images.filter(i => i.hasAttribute('src')).map(async i => { i.loading = 'eager'; await i.decode(); })));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('h1').count(), 1);
      if (width === 390 || width === 1440) await page.screenshot({ path: `south-atlantic-${width}.png`, fullPage: true });
      await page.locator('.gallery-item').first().click();
      assert.equal(await page.locator('dialog').evaluate(d => d.open), true);
      await page.keyboard.press('ArrowRight');
      assert.match(await page.locator('.photo-counter').innerText(), /^2 \/ 3/);
      await page.keyboard.press('ArrowLeft');
      assert.match(await page.locator('.photo-counter').innerText(), /^1 \/ 3/);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('dialog').evaluate(d => d.open), false);
      assert.equal(await page.locator('.gallery-item').first().evaluate(e => e === document.activeElement), true);
      if (width < 800) {
        await page.locator('.menu-toggle').click();
        assert.equal(await page.locator('#main-nav').isVisible(), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#main-nav').isVisible(), false);
      }
    }
    const links = await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.href).filter(h => h.startsWith(location.origin)));
    for (const href of new Set(links)) assert.equal((await page.request.get(href.split('#')[0])).status(), 200, href);
    assert.deepEqual(errors, []);
    console.log('South Atlantic: five viewports, images, local links, mobile menu and gallery keyboard/focus checks passed.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
