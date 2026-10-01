/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P18 r3 — drive the surface as a student would, at phone and desktop. */
module.exports = async ({ page, log, shot }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  const go = async (w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1700);
  };

  for (const [w, h] of [[390, 844], [1366, 768]]) {
    await go(w, h);
    // the way in, by pointer
    await page.evaluate(() => window.BEA.store.dispatch('setYear', 1914));
    await page.waitForTimeout(500);
    // in the sheet band the masthead's strips are a panel behind one control
    await page.evaluate(() => { const m = document.getElementById('bar-more'); if (m && !m.hidden) m.click(); });
    await page.waitForTimeout(400);
    const reach = await page.evaluate(() => {
      const b = document.querySelector('.cmp__launch');
      if (!b || b.hidden) return { ok: false, why: 'no launcher' };
      const r = b.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { ok: !!top && (top === b || b.contains(top)), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], hit: top && top.className.toString().slice(0, 30) };
    });
    t(`${w} the launcher is hit-testable`, reach.ok, JSON.stringify(reach));
    if (reach.ok) await page.click('.cmp__launch');
    await page.waitForTimeout(900);
    const ask = await page.evaluate(() => ({ phase: (document.querySelector('.cmp') || { dataset: {} }).dataset.phase, q: (document.querySelector('.cx-ask__q') || {}).textContent, choices: document.querySelectorAll('.cmp__choice').length }));
    t(`${w} the question comes first`, ask.phase === 'ask' && ask.choices >= 2, `phase ${ask.phase}, ${ask.choices} choices: "${(ask.q || '').slice(0, 60)}…"`);
    await shot(`${w}-ask`);
    await page.click('.cmp__choice');
    await page.waitForTimeout(900);
    // press a row, then confirm it is on screen and both plates ring it
    /* The map-to-list wire: this is exactly what _pickOn does after a press on
       either plate — find the row, press it, scroll it into view. Under a
       sticky pair of plates that lands the row behind them unless
       scroll-margin-block-start is right, which is what this measures. */
    const pressed = await page.evaluate(async () => {
      const rows = [...document.querySelectorAll('.cmp__row')];
      const r = rows[Math.min(6, rows.length - 1)];
      if (!r) return null;
      const plates = document.querySelector('.cmp__plates').getBoundingClientRect();
      r.click();
      r.scrollIntoView({ block: 'nearest' });
      await new Promise(x => setTimeout(x, 400));
      const q = r.getBoundingClientRect();
      return {
        name: r.querySelector('.cmp__row-name').textContent,
        pressed: r.getAttribute('aria-pressed'),
        onScreen: q.top >= 0 && q.bottom <= window.innerHeight && q.top >= plates.bottom - 1,
        rect: [Math.round(q.x), Math.round(q.y), Math.round(q.height)],
        platesBottom: Math.round(plates.bottom),
        lede: (document.querySelector('.cx-lede') || {}).textContent.replace(/\s+/g, ' ').trim().slice(0, 120),
      };
    });
    t(`${w} a row scrolled to from the map clears the sticky plates`, pressed && pressed.pressed === 'true' && pressed.onScreen,
      pressed ? `"${pressed.name}" pressed=${pressed.pressed}, row top y=${pressed.rect[1]}, plates end at y=${pressed.platesBottom}` : 'no rows');
    t(`${w} the band names the place`, pressed && new RegExp(pressed.name.split(' ')[0]).test(pressed.lede), pressed && pressed.lede);
    await shot(`${w}-row`);
    // Only what changed
    await page.click('.cmp__toggle');
    await page.waitForTimeout(600);
    const diffOnly = await page.evaluate(() => ({ pressed: document.querySelector('.cmp__toggle').getAttribute('aria-pressed'), hash: location.hash }));
    t(`${w} "only what changed" round-trips to the address`, diffOnly.pressed === 'true' && /cmpd:1/.test(diffOnly.hash), diffOnly.hash);
    // escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    const closed = await page.evaluate(() => ({ open: !!document.querySelector('.cmp:not([hidden])'), cy: window.BEA.store.getState().compareYear, hash: location.hash }));
    t(`${w} Escape closes and cleans the address`, !closed.open && closed.cy === null, `open=${closed.open}, compareYear=${closed.cy}, hash ${closed.hash}`);
    await page.waitForTimeout(400);
    const clean = await page.evaluate(() => location.hash);
    t(`${w} no orphan cmp keys left behind`, !/cmp[abgdr]?:/.test(clean), clean);
  }
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> P18 DRIVE BROKEN' : '>>> drive holds');
};
