/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const base = 'http://localhost:8777/app/';
  for (const s of [7, 16, 18, 22]) {
    await page.goto(base + '#tour=thirty&step=' + s, { waitUntil: 'load' });
    await page.waitForTimeout(2400);
    const m = await page.evaluate(() => {
      const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), ch: e.clientHeight, sh: e.scrollHeight }; };
      const small = [];
      document.querySelectorAll('.cx-sheet button, .cx-sheet a[href], .cx-sheet [role=button], .cx-sheet input, .cx-sheet [role=radio]').forEach((e) => {
        const r = e.getBoundingClientRect();
        if (!r.width) return;
        const label = (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 44);
        small.push({ label, w: Math.round(r.width), h: Math.round(r.height), cls: String(e.className).slice(0, 40), fail: (r.width < 24 || r.height < 24) });
      });
      return {
        title: (document.querySelector('.cx-sheet__title') || {}).textContent,
        eyebrow: (document.querySelector('.cx-sheet__eyebrow') || {}).textContent,
        sheetBody: box('.cx-sheet__body'), qzRoot: box('.qz'),
        controls: small,
      };
    });
    log('--- step ' + s + ' :: ' + m.eyebrow + ' / ' + m.title);
    log('    sheetBody ' + JSON.stringify(m.sheetBody) + '  qz ' + JSON.stringify(m.qzRoot));
    for (const c of m.controls) log('    ' + (c.fail ? 'FAIL 2.5.8 ' : '        ok ') + c.w + 'x' + c.h + '  ' + c.cls + '  “' + c.label + '”');
    await shot('card-' + s);
  }
};
