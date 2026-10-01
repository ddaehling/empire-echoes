/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  await page.keyboard.press('2');
  await page.waitForTimeout(1000);
  log('band:', JSON.stringify(await page.evaluate(() => ({
    mark: (document.querySelector('.cx-lede__mark')||{}).textContent,
    say: (document.querySelector('.cx-lede__say')||{}).textContent,
    clipped: (() => { const e=document.querySelector('.cx-lede__say'); return e.scrollHeight > e.clientHeight+1; })(),
    cta: (()=>{const c=document.querySelector('.cx-cta'); return c&&!c.hidden?c.textContent.trim():null;})(),
  }))));
  const cta = await page.$('.cx-cta:not([hidden])');
  if (cta) { await cta.click(); await page.waitForTimeout(800); }
  log('sheet:', JSON.stringify(await page.evaluate(() => ({
    t: (document.querySelector('.cx-sheet__title')||{}).textContent,
    e: (document.querySelector('.cx-sheet__eyebrow')||{}).textContent,
    chips: document.querySelectorAll('.tl-defsw__chip').length,
    sh: (document.querySelector('.cx-sheet__body')||{}).scrollHeight,
  }))));
  await shot('def');
};
