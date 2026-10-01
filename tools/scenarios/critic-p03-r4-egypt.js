/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1882, 1922, 1941, 1942, 1834]) {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(600);
    const cards = await page.evaluate(() => [...document.querySelectorAll('.tl-chg:not(.tl-chg--more)')].map(n => n.innerText.replace(/\n/g,' · ')));
    log('YEAR ' + y);
    cards.forEach(c => log('   ' + c));
  }
  // open the full sheet at 1882 to read all
  await page.evaluate(() => { location.hash = '#year=1882'; });
  await page.waitForTimeout(600);
  const m = await page.$('.tl-chg--more'); if (m && await m.isVisible()) { await m.click(); await page.waitForTimeout(600);
    log('SHEET 1882:', await page.evaluate(()=>[...document.querySelectorAll('.tl-all__row')].map(n=>n.innerText.replace(/\n/g,' · ')).join('\n---\n')));
  }
  // 1919 card 4
  await page.evaluate(() => { location.hash = '#year=1919'; });
  await page.waitForTimeout(600);
  log('1919 card3 text:', await page.evaluate(()=>document.querySelectorAll('.tl-chg:not(.tl-chg--more)')[3]?.innerText.replace(/\n/g,' · ')));
  await page.evaluate(()=>document.querySelectorAll('.tl-chg:not(.tl-chg--more)')[3].click());
  await page.waitForTimeout(600);
  await shot('1919-card3');
  log('open panel:', await page.evaluate(()=>{const b=document.body.innerText; const i=b.indexOf('1919'); return b.slice(-1400).replace(/\n/g,' | ');}));
};
