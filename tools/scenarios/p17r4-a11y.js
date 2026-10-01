/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'focus').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — themes, tab order, keyboard, and a scrub for console health. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);

  // tab order: where is the byline's criticism control?
  log('TAB ORDER:', JSON.stringify(await page.evaluate(() => {
    const all = [...document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(e => e.offsetParent !== null || e.getClientRects().length);
    const out = [];
    all.forEach((e, i) => {
      const inLegend = !!e.closest('.stage__legend');
      const inByline = !!e.closest('#legend-byline');
      const inPlate = !!e.closest('#legend-plate');
      if (inLegend || inByline || inPlate) out.push({ stop: i + 1, where: inPlate ? 'plate' : inByline ? 'byline' : 'key', t: (e.textContent||'').trim().slice(0, 34) });
    });
    return { total: all.length, mine: out };
  })));

  // duplicate control names anywhere in the app
  log('DUPLICATE NAMES:', await page.evaluate(() => {
    const n = [...document.querySelectorAll('button')].filter(b => /three things wrong/i.test(b.textContent||''));
    return n.length + ' :: ' + n.map(b => (b.className||'') ).join(' | ');
  }));

  // keyboard: reach the open control and press it, then Escape
  await page.evaluate(() => document.querySelector('.legend__open').focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  log('after Enter, plate open:', await page.evaluate(() => !!document.querySelector('#legend-plate')));
  log('focus now:', await page.evaluate(() => document.activeElement.className));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  log('after Escape, plate open:', await page.evaluate(() => !!document.querySelector('#legend-plate')),
      'focus:', await page.evaluate(() => document.activeElement.className));

  // a scrub with the plate open
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(500);
  const t0 = Date.now();
  for (let y = 1750; y <= 1980; y += 10) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
  }
  await page.waitForTimeout(900);
  log('scrub of 24 years with the plate open took ms:', Date.now() - t0);
  log('plate still coherent:', await page.evaluate(() => {
    const r = document.querySelector('.lplate__rule .legend__figures');
    const c = document.querySelectorAll('.lplate__col--a .legend__entry').length;
    return { fig: r && r.innerText.replace(/\s+/g,' '), rows: c };
  }));
  await shot('after-scrub');
};
