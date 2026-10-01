/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 ROUND 6 — keyboard only. Every legend control reachable, focus visible,
   and its spoken name is the name a speech-input user can read off the screen. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(1500);

  const seen = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const a = document.activeElement; if (!a) return null;
      const cs = getComputedStyle(a); const b = a.getBoundingClientRect();
      return { cls: a.className || a.tagName, text: (a.textContent || '').trim().slice(0, 40),
        inLegend: !!a.closest('.legend, .byline, #legend-byline'),
        outline: cs.outlineWidth + ' ' + cs.outlineStyle, box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] };
    });
    if (f && f.inLegend) seen.push(Object.assign({ stop: i + 1 }, f));
    if (seen.length && seen[seen.length - 1].stop < i - 6) break;
  }
  log('legend controls reached by Tab: ' + seen.length);
  for (const s of seen) log('   tab ' + s.stop + '  .' + s.cls + '  "' + s.text + '"  outline=' + s.outline + '  ' + JSON.stringify(s.box));

  /* the route opens the sheet and returns focus somewhere sane */
  const ok = await page.evaluate(async () => {
    const r = document.querySelector('.legend__route'); if (!r) return 'no route';
    r.focus(); return document.activeElement === r ? 'route focusable' : 'route NOT focusable';
  });
  log(ok);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => ({
    sheet: document.getElementById('app').dataset.sheet,
    focus: (document.activeElement.className || document.activeElement.tagName) + ' :: ' + (document.activeElement.textContent || '').trim().slice(0, 50),
  }));
  log('after Enter on the route: ' + JSON.stringify(after));
  await shot('after-route-enter');

  /* every entry in the sheet is operable by keyboard and toggles aria-expanded */
  const ent = await page.evaluate(async () => {
    const b = document.querySelector('.legend__entry'); if (!b) return 'no entry';
    b.focus(); const before = b.getAttribute('aria-expanded');
    b.click(); await new Promise(r => setTimeout(r, 500));
    const now = document.querySelector('.legend__entry');
    return { label: b.getAttribute('aria-label'), before, after: now ? now.getAttribute('aria-expanded') : null };
  });
  log('entry toggle: ' + JSON.stringify(ent));
};
