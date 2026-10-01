/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1200);
  const m = async (tag) => {
    const r = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const b = (s) => { const e = q(s); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.x), Math.round(x.y), Math.round(x.width), Math.round(x.height)]; };
      const sign = q('.cl-sign'), time = q('.app__time');
      let ov = 0;
      if (sign && time) { const a = sign.getBoundingClientRect(), z = time.getBoundingClientRect(); ov = Math.max(0, Math.min(a.bottom, z.bottom) - Math.max(a.top, z.top)); }
      return { compose: sign ? (sign.dataset.compose || '') : null, sign: b('.cl-sign'), time: b('.app__time'), overlapPx: Math.round(ov), pos: sign ? getComputedStyle(sign).position : null };
    });
    log(tag + ' ' + JSON.stringify(r));
  };
  await m('before focus');
  await page.evaluate(() => { const f = document.querySelector('.cl-sign__field'); if (f) { f.scrollIntoView(); f.focus(); } });
  await page.waitForTimeout(700);
  await m('after focus ');
  await shot('compose');
};
