/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const read = async (l) => {
    const t = await page.evaluate(() => {
      document.querySelectorAll('.legend details').forEach(d => d.open = true);
      const lg = document.querySelector('.legend');
      const txt = lg.innerText;
      const bands = (txt.match(/Broken bands[^\n]*\n(\d+)/) || [])[1];
      const half = (txt.match(/(\d+) units that British control did not fill/) || [])[1];
      const head = txt.split('MARKS')[0];
      const audit = (txt.split('Checked against the shell')[1]||'').slice(0,400);
      return { bands, half, head, audit };
    });
    log('=== ' + l + ' ===\nhead: ' + t.head.replace(/\n+/g,' | ') + '\nbands=' + t.bands + ' half=' + t.half + '\naudit: ' + t.audit);
  };
  await read('claimed(1)');
  await page.keyboard.press('3'); await page.waitForTimeout(1200); await read('controlled(3)');
  await page.keyboard.press('4'); await page.waitForTimeout(1200); await read('influenced(4)');
  await page.keyboard.press('2'); await page.waitForTimeout(1200); await read('administered(2)');
  // year change
  await page.evaluate(() => { location.hash = '#year=1783'; });
  await page.waitForTimeout(1800); await read('1783');
  await page.evaluate(() => { location.hash = '#year=1650'; });
  await page.waitForTimeout(1800); await read('1650');
  await shot('y1650');
  await page.evaluate(() => { location.hash = '#year=2023'; });
  await page.waitForTimeout(1800); await read('2023');
  await shot('y2023');
  await page.evaluate(() => { location.hash = '#year=1200'; });
  await page.waitForTimeout(1800); await read('1200');
  await shot('y1200');
};
