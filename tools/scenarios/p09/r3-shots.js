/**
 * P09 round 3 — look at it. Opens the sheet, answers both earlier asks, then
 * shoots the counterparty recount sealed and open, plus a picked row.
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.mechanism, null, { timeout: 20000 });
  await page.waitForTimeout(900);

  const to = (sel) => page.evaluate((s) => {
    const n = document.querySelector(s);
    if (!n) return false;
    const pane = n.closest('.cx-sheet__body');
    if (!pane) { n.scrollIntoView(); return true; }
    pane.scrollTop = Math.max(0, pane.scrollTop + n.getBoundingClientRect().top - pane.getBoundingClientRect().top - 8);
    return true;
  }, sel);

  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { reveal: true }));
  await page.waitForTimeout(500);
  await page.evaluate(async () => {
    const a = document.querySelector('.mx-pp .mx-ch');
    if (a) { a.click(); await new Promise(r => setTimeout(r, 400)); }
  });
  await page.waitForTimeout(400);

  await to('.mx-cp');
  await page.waitForTimeout(250);
  await shot('cp-sealed');

  await page.evaluate(async () => {
    const b = document.querySelector('.mx-cp .mx-ch');
    if (b) { b.click(); await new Promise(r => setTimeout(r, 500)); }
  });
  await page.waitForTimeout(400);
  await to('.mx-cp');
  await page.waitForTimeout(250);
  await shot('cp-open');

  await page.evaluate(() => {
    const p = document.querySelector('.cx-sheet__body');
    if (p) p.scrollTop += 520;
  });
  await page.waitForTimeout(250);
  await shot('cp-audit');

  await page.evaluate(async () => {
    const m = document.querySelector('.mx-cp__more .cx-more');
    if (m) m.click();
  });
  await page.waitForTimeout(300);
  await to('.mx-cp__rows');
  await page.waitForTimeout(250);
  await shot('cp-rows');

  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { row: 'conquest' }));
  await page.waitForTimeout(700);
  await to('.mx-d');
  await page.waitForTimeout(250);
  await shot('detail-conquest');

  const errs = await page.evaluate(() => (window.__errs || []).length);
  log('page errors: ' + errs);
};
