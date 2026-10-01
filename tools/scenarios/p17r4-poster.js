/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — the criticism column and the transfer exercise on a second map. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.click('.byline__crit');
  await page.waitForTimeout(800);
  await shot('crit-col', '#legend-plate');
  log('crit text:', (await page.evaluate(() => document.querySelector('#legend-criticism').innerText)).replace(/\s+/g,' ').slice(0, 900));
  await page.evaluate(() => window.BEA.legend.openPlate('poster'));
  await page.waitForTimeout(600);
  await shot('poster', '#legend-plate');
  // answer the three
  await page.evaluate(() => {
    const clickIn = (qid, idx) => {
      const g = [...document.querySelectorAll('.lplate__q')].find(x => (x.querySelector('.lplate__q-h')||{}).id === 'pq-' + qid);
      if (g) g.querySelectorAll('.lplate__opt')[idx].click();
    };
    clickIn('projection', 1);   // a wrong one first
  });
  await page.waitForTimeout(400);
  log('after wrong pick:', (await page.evaluate(() => (document.querySelector('.lplate__because')||{}).innerText || 'none')).slice(0,200));
  await shot('poster-wrong', '#legend-plate');
  await page.evaluate(() => {
    const clickIn = (qid, idx) => {
      const g = [...document.querySelectorAll('.lplate__q')].find(x => (x.querySelector('.lplate__q-h')||{}).id === 'pq-' + qid);
      if (g) g.querySelectorAll('.lplate__opt')[idx].click();
    };
    clickIn('projection', 0); clickIn('colour', 0); clickIn('year', 0);
  });
  await page.waitForTimeout(500);
  const ledger = [];
  await page.evaluate(() => { window.__led = []; window.BEA.bus.on('ledger:append', p => window.__led.push(p)); });
  await page.click('.lplate__keep');
  await page.waitForTimeout(500);
  log('ledger:', JSON.stringify(await page.evaluate(() => window.__led)).slice(0, 500));
  log('kept:', (await page.evaluate(() => (document.querySelector('.lplate__kept')||{}).innerText || 'none')).replace(/\s+/g,' ').slice(0,700));
  await page.evaluate(() => { const c = document.querySelector('.lplate__col--b'); c.scrollTop = c.scrollHeight; });
  await shot('poster-kept', '#legend-plate');
  void ledger;
};
