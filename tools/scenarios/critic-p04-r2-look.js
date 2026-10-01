/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const f = await page.$('.legend__toggle'); if (f) { await f.click(); await page.waitForTimeout(400); }
  const blocks = await page.evaluate(() => [...document.querySelectorAll('.dossier [data-block]')].map(n=>n.dataset.block));
  log('BLOCKS: ' + blocks.join(', '));
  for (const b of ['misconception','why','vocab','words','evidence','contested','silence','consequences','actors']) {
    const ok = await page.evaluate((bb) => { const n = document.querySelector('[data-block="'+bb+'"]'); if(!n) return null; n.scrollIntoView({block:'start'}); return true; }, b);
    if (!ok) { log('no block ' + b); continue; }
    await page.waitForTimeout(450);
    await shot('block-' + b);
  }
};
