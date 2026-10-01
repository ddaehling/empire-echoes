/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  for (const y of [1700, 1913, 1955, 1990]) {
    await page.goto('http://localhost:8777/app/#year=' + y);
    await page.waitForTimeout(3000);
    const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(400); }
    await page.keyboard.press('h'); await page.waitForTimeout(1300);
    const txt = await page.evaluate(()=>{
      const ask = document.querySelector('.legend__ask, .legend')?.innerText || '';
      const card = document.querySelector('.map__switch')?.innerText || '';
      return { ask: ask.replace(/\n/g,' | ').slice(0,900), card: card.replace(/\n/g,' | ').slice(0,900) };
    });
    log('=== year ' + y + ' ===');
    log('ASK:', txt.ask);
    log('CARD:', txt.card);
    await shot('sil-' + y);
  }
  log('ERR', JSON.stringify(errs));
};
