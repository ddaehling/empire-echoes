/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Nothing was deleted: the whole entry, laid end to end, against what a reader
 * now has to travel through to reach the four answers and the question. */
module.exports = async ({ page, log }) => {
  for (const id of ['bengal-presidency', 'kenya', 'british-india']) {
    await page.goto('http://localhost:8777/app/#year=1900&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(2400);
    const rail = await page.evaluate(() => {
      const a = document.querySelector('.app__dossier');
      return { h: Math.round(a.getBoundingClientRect().height), scrollH: a.scrollHeight, chars: a.innerText.length };
    });
    const ids = await page.$$eval('.dsr__idxbtn', (ns) => ns.map((n) => n.dataset.sheet));
    let sheetPx = 0; let sheetChars = 0;
    for (const s of ids) {
      await page.evaluate((k) => document.querySelector('.dsr__idxbtn[data-sheet="' + k + '"]').click(), s);
      await page.waitForTimeout(180);
      const m = await page.evaluate(() => {
        const b = document.querySelector('.cx-sheet__body');
        return { px: b.scrollHeight, chars: b.innerText.length };
      });
      sheetPx += m.px; sheetChars += m.chars;
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }
    log(id + ' :: rail ' + rail.h + 'px · on-page scroll ' + rail.scrollH + 'px ('
      + (rail.scrollH / rail.h).toFixed(1) + ' screenfuls, ' + rail.chars + ' chars)'
      + ' · ' + ids.length + ' sheets ' + sheetPx + 'px / ' + sheetChars + ' chars'
      + ' · WHOLE ENTRY ' + (rail.scrollH + sheetPx) + 'px / ' + (rail.chars + sheetChars) + ' chars');
  }
};
