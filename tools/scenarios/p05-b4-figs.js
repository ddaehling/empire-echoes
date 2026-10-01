/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-figs.js — every {{fig:}} token resolves, and the check block follows a reveal. */
module.exports = async ({ page, log, shot }) => {
  // 1. the compensation beat: the figures appear only after the order is right
  await page.goto('http://localhost:8777/app/#tour=core&step=5', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const read = () => page.evaluate(() => ({
    marks: [...document.querySelectorAll('.tr-q')].map(n => n.getAttribute('data-fig') + '=' + (n.textContent || '').trim()),
    bare: [...document.querySelectorAll('.tr-q--bare')].map(n => n.textContent),
    rows: [...document.querySelectorAll('.tr-figs__row')].map(n => n.getAttribute('data-fig')),
    warrants: [...document.querySelectorAll('.tr-figs .wq__w')].map(n => n.dataset.status + ' :: ' + (n.textContent || '').trim().slice(0, 70)),
    defects: [...document.querySelectorAll('.tr-figs .wq__defect')].map(n => (n.textContent || '').slice(0, 60)),
    leftovers: (document.querySelector('.tr-panel') || {}).textContent ? ((document.querySelector('.tr-panel').textContent.match(/\{\{fig:[a-z0-9-]+\}\}/g)) || []) : [],
  }));
  log('compensation, before ' + JSON.stringify(await read()));
  await page.evaluate(() => {
    const order = [...document.querySelectorAll('.tr-order__pool li button, .tr-order__btn')];
    return order.length;
  });
  const YEARS = { 'Parliament ends the British slave trade': 1807, "Bussa's rebellion in Barbados": 1816, 'The Abolition Act takes effect': 1834, '£1.72m paid to Barbadian slave-owners': 1836, 'Apprenticeship ends; full freedom': 1838 };
  for (let i = 0; i < 8; i++) {
    const n = await page.evaluate((Y) => {
      const bs = [...document.querySelectorAll('.tr-order__btn')].filter(b => !b.disabled);
      if (!bs.length) return 0;
      bs.sort((a, b) => (Y[(a.textContent || '').trim()] || 9999) - (Y[(b.textContent || '').trim()] || 9999));
      bs[0].click(); return bs.length;
    }, YEARS);
    await page.waitForTimeout(300);
    if (!n) break;
  }
  await page.waitForTimeout(800);
  log('compensation, after  ' + JSON.stringify(await read()));
  await shot('compensation-figs');

  // 2. the loop's Bengal figure, with its range reason and its dispute control
  await page.goto('http://localhost:8777/app/#tour=core&step=6', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  log('loop                 ' + JSON.stringify(await read()));
  const d = await page.evaluate(() => {
    const b = document.querySelector('.tr-figs__disgo');
    if (!b) return null;
    b.click();
    const body = document.querySelector('.tr-figs__disbody');
    return { label: (b.textContent || '').trim(), expanded: b.getAttribute('aria-expanded'), text: body ? (body.textContent || '').trim().slice(0, 220) : null };
  });
  log('dispute              ' + JSON.stringify(d));
  await shot('loop-figs');

  // 3. Amritsar
  await page.goto('http://localhost:8777/app/#tour=core&step=11', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  log('amritsar             ' + JSON.stringify(await read()));
};
