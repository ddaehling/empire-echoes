/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const openPlate = async () => {
    const open = await page.evaluate(() => !!document.querySelector('.lplate__crit'));
    if (!open) {
      const b = page.locator('button', { hasText: /Open the full key/i }).first();
      if (await b.count()) await b.click();
      else await page.getByText(/Three things wrong/i).first().click();
      await page.waitForTimeout(1000);
    }
  };
  const crit = async (tag) => {
    await openPlate();
    const t = await page.evaluate(() => {
      const ol = document.querySelector('.lplate__crit');
      return ol ? ol.innerText.replace(/\n+/g,' | ') : 'NO .lplate__crit';
    });
    log('### ' + tag + '\n' + t + '\n');
  };
  await crit('mercator-claimed');
  await shot('plate-open');
  await page.keyboard.press('p'); await page.waitForTimeout(1300); await crit('equalearth-claimed');
  await page.keyboard.press('3'); await page.waitForTimeout(1100); await crit('ee-controlled');
  await page.keyboard.press('w'); await page.waitForTimeout(1300); await crit('ee-controlled-weight');
  await page.keyboard.press('w'); await page.waitForTimeout(500);
  await page.keyboard.press('s'); await page.waitForTimeout(1300); await crit('ee-controlled-stitch');
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('4'); await page.waitForTimeout(1100); await crit('ee-influenced');
  // the poster exercise
  const poster = await page.evaluate(() => {
    const s = document.querySelector('#legend-poster-h') || [...document.querySelectorAll('h3')].find(h=>/poster|1886/i.test(h.textContent));
    if (!s) return 'NO POSTER SECTION';
    let box = s.closest('section') || s.parentElement;
    return box.innerText.slice(0,2500);
  });
  log('### POSTER\n' + poster);
  await shot('poster');
};
