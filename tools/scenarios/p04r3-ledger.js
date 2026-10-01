/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'scrollIntoView').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await page.evaluate(() => {
    window.__led = [];
    window.BEA.bus.on('ledger:append', (p) => window.__led.push(p));
  });
  await page.evaluate(() => document.querySelector('#dsr-think').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.click('.dsr__choice[data-value="false"]');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.dsr__ask--toll').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  await page.click('.dsr__ask--toll .dsr__choice[data-value="tens-thousands"]');
  await page.waitForTimeout(500);
  log('LEDGER', JSON.stringify(await page.evaluate(() => window.__led.filter((e) => e.kind !== 'found')), null, 1));
  /* go somewhere else and come back: does it remember? */
  await page.evaluate(() => window.BEA.store.batch((d) => d('select', 'nigeria')));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.BEA.store.batch((d) => d('select', 'kenya')));
  await page.waitForTimeout(400);
  const back = await page.evaluate(() => {
    const t = document.querySelector('.dsr__think');
    t.scrollIntoView({ block: 'start' });
    return t.innerText.replace(/\s+/g, ' ').slice(0, 420);
  });
  await page.waitForTimeout(300);
  await shot('01-remembered');
  log('ON RETURN', back);
  log('tally line:', await page.evaluate(() => (document.querySelector('.dsr__asktally') || {}).innerText));
  const full = await page.evaluate(() => { document.querySelector('.app__dossier').scrollTop = 0; return 1; });
  void full;
  await page.waitForTimeout(200);
  await shot('02-fold');
  await page.evaluate(() => document.querySelector('#dsr-contents').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(250);
  await shot('03-contents');
};
