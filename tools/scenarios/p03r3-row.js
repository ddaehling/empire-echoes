/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  const years = [1947, 1948, 1997, 1998, 1942, 1919, 1930, 1845, 1857, 1812, 1963, 1964, 1956, 1957, 1820];
  for (const y of years) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(90);
    const t = await page.evaluate(() => {
      const tl = document.querySelector('.tl');
      return {
        head: tl.querySelector('.tl__changehead').innerText.replace(/\n/g,' | '),
        cards: [...tl.querySelectorAll('.tl-chg:not([hidden])')].map(n=>n.innerText.replace(/\n/g,' / ')),
        nothing: (()=>{const n=tl.querySelector('.tl__nothing'); return n && !n.hidden ? n.innerText.replace(/\n/g,' | ') : null;})(),
        caption: tl.querySelector('.tl-spine__caption').innerText.replace(/\n/g,' '),
      };
    });
    log(y + ' :: ' + JSON.stringify(t, null, 1));
  }
};
