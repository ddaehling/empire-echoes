/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  for (const s of [18, 4]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + s, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(2600);
    log('step ' + s + '\n' + await page.evaluate(() => {
      const R = t => { const e=document.querySelector(t); if(!e) return '  '+t+' none'; const b=e.getBoundingClientRect(); return '  '+t.padEnd(22)+Math.round(b.width)+'x'+Math.round(b.height)+' @'+Math.round(b.y); };
      return ['.app__lede','.stage__map','.app__sheet','.cx-sheet__head','.cx-sheet__body','.tr-panel','.tr-panel__scroll','.tr-panel__foot','.cl-blk','.app__time'].map(R).join('\n');
    }));
  }
};
