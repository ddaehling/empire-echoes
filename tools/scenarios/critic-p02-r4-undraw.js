/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1865, 1955, 1963]) {
    await page.evaluate(y=>window.BEA.store.dispatch('setYear',y), y); await page.waitForTimeout(800);
    await page.keyboard.press('h'); await page.waitForTimeout(1500);
    const txt = await page.evaluate(()=>document.body.innerText);
    const hit = /confiscat|guarded village|raupatu|no line here|Hanslope/i.test(txt);
    log('YEAR', y, 'undrawable-note present:', hit);
    if (hit) { const i = txt.search(/confiscat|guarded village|no line here|Hanslope/i); log('  ...', txt.slice(Math.max(0,i-400), i+500).replace(/\n+/g,' | ')); }
    const holes = await page.evaluate(()=>{const t=document.body.innerText.match(/(\d+) places? (?:is|are)? ?drawn as coastline/); return t?t[0]:null;});
    log('  holes:', holes);
    await shot('sil-'+y);
    await page.keyboard.press('h'); await page.waitForTimeout(500);
  }
};
