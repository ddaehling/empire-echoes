/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 6 — the sheet: geometry, staging, and the routes between the three. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2800);

  const geom = () => page.evaluate(() => {
    const r = (n) => { if (!n) return null; const b = n.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const sheet = document.querySelector('.app__sheet');
    const body = document.querySelector('.cx-sheet__body');
    const host = document.querySelector('.lsheet');
    return {
      sheetOpen: !!(sheet && !sheet.hidden),
      sheet: r(sheet), body: r(body),
      kind: host ? host.dataset.kind : null,
      title: (document.querySelector('.cx-sheet__title') || {}).textContent,
      scrollH: body ? body.scrollHeight : 0,
      canvas: r(document.querySelector('.stage__map canvas')),
      docScroll: document.documentElement.scrollHeight <= innerHeight,
      panels: [...document.querySelectorAll('.lsheet .cx-panel')].length,
      heads: [...document.querySelectorAll('.lsheet .cx-panel__head')].map(n => n.textContent.trim().slice(0, 46)),
      mores: [...document.querySelectorAll('.lsheet .cx-more')].map(n => n.textContent.trim()),
      terms: !!document.getElementById('legend-terms'),
      crit: [...document.querySelectorAll('.lplate__crit > li strong')].map(n => n.textContent.trim()),
      appStage: document.getElementById('app').dataset.stage,
      appSheet: document.getElementById('app').dataset.sheet,
    };
  });

  await page.click('.legend__route');
  await page.waitForTimeout(600);
  log('KEY ' + JSON.stringify(await geom(), null, 1));
  await shot('key');

  await page.evaluate(() => window.BEA.legend.openPlate('criticism'));
  await page.waitForTimeout(500);
  log('CRIT ' + JSON.stringify(await geom(), null, 1));
  await shot('crit');

  await page.evaluate(() => window.BEA.legend.openPlate('poster'));
  await page.waitForTimeout(500);
  const p = await geom();
  log('POSTER ' + JSON.stringify({ kind: p.kind, title: p.title, panels: p.panels, mores: p.mores, canvas: p.canvas, scrollH: p.scrollH }, null, 1));
  await shot('poster');

  /* the roll of places inside the sheet still works from the delegated click */
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(450);
  const painted = await page.evaluate(() => new Promise((res) => {
    const off = window.BEA.bus.on('ask:paintUnits', (p) => { off(); res({ n: p.unitIds ? p.unitIds.length : null, reason: p.reason }); });
    const btn = document.querySelector('.lsheet .legend__entry[data-status]');
    btn.click();
    setTimeout(() => res({ n: null, reason: 'no event' }), 1200);
  }));
  await page.waitForTimeout(400);
  log('ROLL ' + JSON.stringify(painted) + ' rollOpen=' + await page.evaluate(() => !!document.querySelector('.lsheet .legend__roll')));

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const c = await geom();
  log('CLOSED ' + JSON.stringify({ sheetOpen: c.sheetOpen, appSheet: c.appSheet, canvas: c.canvas, focus: await page.evaluate(() => document.activeElement && document.activeElement.className) }));
  log('ERRORS ' + JSON.stringify(errs));
};
