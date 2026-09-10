const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('http://localhost:8080/');
      if (width <= 800) await page.locator('.menu-toggle').click();
      await page.locator('.business-menu summary').click();
      assert.equal(await page.locator('.business-menu-column a').count(), 14);
      assert.equal(await page.locator('.business-menu-panel').isVisible(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (width === 1440) await page.screenshot({ path: 'business-menu-desktop.png' });
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.business-menu').evaluate(e => e.open), false);
      await page.locator('.business-menu summary').click();
      await page.locator('.business-menu-intro a').click();
      assert.equal(new URL(page.url()).pathname, '/empresarial/index.html');
      assert.equal(await page.locator('.directory-card').count(), 14);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if ([390, 1440].includes(width)) await page.screenshot({ path: `business-directory-${width}.png`, fullPage: true });
    }
    const links = await page.locator('.directory-card').evaluateAll(anchors => anchors.map(a => a.href));
    for (const href of links) {
      await page.goto(href);
      assert.equal(await page.locator('.business-wayfinding').count(), 1, href);
      assert.equal(await page.locator('.all-business-services').getAttribute('href') !== null, true);
    }
    await page.goto('http://localhost:8080/empresarial/index.html');
    const allLinks = await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.href).filter(h => h.startsWith(location.origin)));
    for (const href of new Set(allLinks)) assert.equal((await page.request.get(href.split('#')[0])).status(), 200, href);
    assert.deepEqual(errors, []);
    console.log('Business navigation passed: four widths, 14 service destinations, directory links, keyboard and mobile menu.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
