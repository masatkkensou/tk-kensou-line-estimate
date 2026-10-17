// Prerequisite: Playwright and Chromium. Start the static server before running.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
    await assert.equal(await page.locator('#next').isDisabled(), true);
    const choose = async value => { await page.locator(`.choice:has(input[value="${value}"])`).click(); await page.locator('#next').click(); };
    await choose('6');
    await choose('ceiling');
    await page.locator('#back').click();
    assert.equal(await page.locator('input[value="ceiling"]').isChecked(), true);
    await page.locator('#next').click();
    await choose('standard');
    await choose('bright');
    await choose('none');
    await page.locator('#next').click();
    assert.match(await page.locator('.total').innerText(), /52,800/);
    assert.match(await page.locator('.summary').first().innerText(), /6畳/);
    assert.match(await page.locator('.summary').first().innerText(), /オプションなし/);
    assert.equal(await page.locator('.disclaimer').innerText(), 'これは概算価格です。正式価格は現地確認後のお見積りで確定します。');
    await page.locator('#photo').click();
    assert.equal(await page.locator('#demo-dialog').isVisible(), true);
    await page.locator('#close-dialog').click();
    assert.equal(await page.locator('#demo-dialog').isVisible(), false);
    await page.locator('#back').click();
    await page.locator('.choice:has(input[value="floor"])').click();
    await page.locator('.choice:has(input[value="plates"])').click();
    await page.locator('#next').click();
    assert.match(await page.locator('.total').innerText(), /102,300/);
    await page.locator('#back').click();
    assert.equal(await page.locator('input:checked').count(), 2);
    await page.locator('#next').click();
    await page.locator('#reset').click();
    assert.equal(await page.locator('#step-label').innerText(), 'STEP 1 / 7');
    assert.equal(await page.locator('input:checked').count(), 0);
    assert.equal(await page.locator('#next').isDisabled(), true);
    const largest = await page.evaluate(() => calculateEstimate({ room: '12', scope: 'ceiling', wallpaper: 'select', furniture: 'large2', options: ['floor', 'baseboard', 'plates', 'lighting', 'rail'] }));
    assert.equal(largest.total, 257840);
    const changedPrice = await page.evaluate(() => {
      const original = ESTIMATE_PRICING.rooms[6].walls;
      ESTIMATE_PRICING.rooms[6].walls = 40000;
      const result = calculateEstimate({ room: '6', scope: 'ceiling', wallpaper: 'standard', furniture: 'none', options: [] }).total;
      ESTIMATE_PRICING.rooms[6].walls = original;
      return result;
    });
    assert.equal(changedPrice, 57200);
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: '/tmp/tk-estimate-mobile.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: required flow (¥52,800), back/preserved choices, optional extras (¥102,300), demo dialog, reset, 12畳/SELECT/all extras (¥257,840), centralized price change, responsive widths 320/390/768/1280, no browser errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
