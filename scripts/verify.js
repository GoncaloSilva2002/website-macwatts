const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith('http://localhost:8080') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const report = JSON.parse(fs.readFileSync('clone-report.json', 'utf8'));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of report.pages) {
      await page.goto(`http://localhost:8080/${file}`, { waitUntil: 'load' });
      await page.locator('img').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
      await page.waitForFunction(() => [...document.images].every(img => img.complete));
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        broken: [...document.images].filter(img => img.hasAttribute('src') && !img.naturalWidth).map(img => img.src),
      }));
      if (state.overflow || state.broken.length) errors.push({ width, file, ...state });
    }
    await page.goto('http://localhost:8080/', { waitUntil: 'load' });
    await page.locator('img').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
    await page.waitForFunction(() => [...document.images].every(img => img.complete));
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode().catch(() => {}))));
    await page.waitForTimeout(200);
    await page.screenshot({ path: `preview-${width}.png`, fullPage: true });
    assert.equal(await page.locator('h1').count(), 1);
    const links = await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.href).filter(href => href.startsWith(location.origin)));
    for (const href of new Set(links)) {
      const response = await page.request.get(href.split('#')[0]);
      assert.equal(response.status(), 200, href);
    }
    if (width === 390) {
      const toggle = page.locator('.menu-toggle');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await page.waitForTimeout(350);
      assert.ok(await page.locator('header nav.is-open').isVisible());
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      await toggle.click();
      await page.locator('.business-menu summary').click();
      await page.locator('.business-menu-intro a').click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(new URL(page.url()).pathname, '/empresarial/index.html');
    }
    await page.goto('http://localhost:8080/residencial/index.html');
    assert.equal(await page.locator('h1').count(), 1);
    const question = page.locator('.faq-items details').first();
    await question.locator('summary').click();
    assert.equal(await question.evaluate(el => el.open), true);
    await question.locator('summary').click();
    assert.equal(await question.evaluate(el => el.open), false);
    if (width === 390) {
      await page.locator('.menu-toggle').click();
      await page.locator('#main-nav a[href="#solar"]').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      assert.equal(new URL(page.url()).hash, '#solar');
    }
  }
  await page.goto('http://localhost:8080/contactos/index.html');
  assert.equal(await page.locator('input[type=email]').evaluate(input => input.checkValidity()), false);
  await browser.close();
  fs.writeFileSync('verification-report.json', JSON.stringify({ pages: report.pages.length, viewports: [1440, 390], errors }, null, 2));
  console.log(JSON.stringify({ pages: report.pages.length, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
