/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  for (const preset of ['america', 'informal', 'peak', 'dissolution', 'redirect']) {
    await page.evaluate((p) => window.BEA.bus.emit('ask:compare', { preset: p, reveal: true }), preset);
    await page.waitForTimeout(700);
    log(preset, JSON.stringify(await page.evaluate(() => {
      const d = document.querySelector('.cmp__delta');
      const db = d.getBoundingClientRect();
      const clipped = [];
      for (const e of d.querySelectorAll('.cmp__verdict, .cmp__net, .cmp__guess, .cmp__caution')) {
        const b = e.getBoundingClientRect();
        if (b.bottom > db.bottom + 0.5) clipped.push(e.className + ' overflows by ' + Math.round(b.bottom - db.bottom));
      }
      const firstHead = d.querySelector('.cmp__sec .cx-panel__head');
      const firstRow = d.querySelector('.cmp__row');
      const vis = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return Math.round(db.bottom - b.top); };
      return { deltaH: Math.round(db.height), scrollH: d.scrollHeight, clipped,
        firstHeadVisiblePx: vis(firstHead), firstRowVisiblePx: vis(firstRow),
        figs: [...d.querySelectorAll('.cmp__f')].map(e=>e.textContent).join(' | ') };
    })));
    await shot('delta-' + preset);
  }
};
