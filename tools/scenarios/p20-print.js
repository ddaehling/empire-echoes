/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20-print — build each printable and look at it in print media. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(900);
  // stub the print dialogue so headless does not stall
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.click('.tp-entry');
  await page.waitForTimeout(1200);

  const packs = [
    ['classroom', 'Print the board sheet', 'board'],
    ['classroom', 'Print the lesson plan', 'lesson'],
    ['classroom', 'Print all twelve with mark schemes', 'questions'],
  ];
  for (const [tab, label, name] of packs) {
    await page.click('#tp-tab-' + tab);
    await page.waitForTimeout(400);
    const ok = await page.evaluate((l) => {
      const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === l);
      if (!b) return false; b.click(); return true;
    }, label);
    log(name + ' button: ' + ok);
    await page.waitForTimeout(400);
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(200);
    await shot('print-' + name);
    await page.emulateMedia({ media: 'screen' });
  }

  // the source booklet and the map, from the pack list
  for (const label of ['The source booklet', 'The map as it stands', 'The evidence ledger']) {
    await page.click('#tp-tab-classroom');
    await page.waitForTimeout(300);
    const ok = await page.evaluate((l) => {
      const li = [...document.querySelectorAll('.tp-packs__i')].find(x => x.textContent.includes(l));
      if (!li) return false; li.querySelector('button').click(); return true;
    }, label);
    log(label + ': ' + ok);
    await page.waitForTimeout(500);
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);
    await shot('print-' + label.replace(/\W+/g, '-'));
    await page.emulateMedia({ media: 'screen' });
  }

  const m = await page.evaluate(() => ({
    printed: window.__printed,
    paper: document.querySelectorAll('.tp-paper').length,
    paperVisibleOnScreen: (() => { const p = document.querySelector('.tp-paper'); return p ? getComputedStyle(p).display : 'none'; })(),
  }));
  log('PRINT STATE ' + JSON.stringify(m));
};
