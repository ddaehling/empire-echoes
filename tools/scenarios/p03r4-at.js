/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  // AT2: 1820 lights three
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(350);
  log('AT2 lit lanes:', await page.evaluate(() => [...document.querySelectorAll('.tl-lane[data-on=true]')].map(b => b.dataset.phase).join(',')));
  log('AT2 caption:', await page.evaluate(() => document.querySelector('.tl-spine__caption').innerText.replace(/\n/g,' ')));

  // AT3: Shift+Right from 1856
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1856));
  await page.waitForTimeout(250);
  await page.focus('.tl-ax__rail');
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(400);
  const at3 = await page.evaluate(() => ({ landed: window.BEA.store.getState().year, expect: window.BEA.data.nextChangeYear(1856, 1) }));
  log('AT3:', JSON.stringify(at3));
  // how often do they differ across the whole axis?
  log('AT3 divergence:', await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03; const d = window.BEA.data;
    let diff = 0, n = 0, sample = [];
    for (let y = d.bounds.min; y < d.bounds.max; y++) {
      const a = p.nextChange(y, 1), b = d.nextChangeYear(y, 1);
      if (a == null && b == null) continue; n++;
      if (a !== b) { diff++; if (sample.length < 6) sample.push([y, a, b]); }
    }
    return JSON.stringify({ years: n, differ: diff, sample });
  }));

  // AT4: contested markers
  log('AT4 marks:', await page.evaluate(() => {
    const ms = [...document.querySelectorAll('.tl-mark:not([hidden])')];
    return JSON.stringify({ count: ms.length, allLabelled: ms.every(m => (m.getAttribute('aria-label')||'').length > 30), first: ms[0] && ms[0].getAttribute('aria-label').slice(0, 120) });
  }));

  // uncertainty totals at 1947 / 1948
  log('uncertain counts:', await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    return JSON.stringify([1931, 1947, 1948].map(y => { const u = p.uncertain.find(x => x.year === y); return [y, u ? u.reasons.length : 0]; }));
  }));

  // AT1: spine present with tours killed
  log('AT1 spine present:', await page.evaluate(() => !!document.querySelector('.tl-spine__track')));

  // definition switch
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.BEA.bus.emit('map:setDefinition', 'controlled'));
  await page.waitForTimeout(500);
  await shot('defswitch-1913');
  log('def switch:', await page.evaluate(() => { const e = document.querySelector('.tl__defswitch'); return e && !e.hidden ? e.innerText.replace(/\n/g, ' | ') : 'HIDDEN'; }));

  // uncertainty popover with overflow affordance
  await page.evaluate(() => window.BEA.bus.emit('map:setDefinition', 'claimed'));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(300);
  const warn = await page.locator('.tl__warn').isVisible();
  if (warn) { await page.click('.tl__warn'); await page.waitForTimeout(500); await shot('uncertain-1947'); }
  log('pop text head:', await page.evaluate(() => { const e = document.querySelector('.tl__pop'); return e && !e.hidden ? e.innerText.slice(0, 300).replace(/\n/g,' | ') : 'HIDDEN'; }));
  log('drawer note:', await page.evaluate(() => { const e = document.querySelector('.tl__drawer-more'); return e && !e.hidden ? e.textContent : 'hidden'; }));
  log('geom:', await page.evaluate(() => { const r = e => e ? JSON.stringify(e.getBoundingClientRect()) : null; return r(document.querySelector('#stage')); }));
};
