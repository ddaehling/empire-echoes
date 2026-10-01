/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await shot('01-top');
  const m = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier');
    const fold = document.querySelector('.dsr__fold');
    const art = document.querySelector('.dossier');
    return {
      host: Math.round(host.getBoundingClientRect().height),
      over: Math.round(fold.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom),
      rail: art.querySelector('.dsr__rail') ? art.querySelector('.dsr__rail').scrollWidth + '/' + art.querySelector('.dsr__rail').clientWidth : null,
      contents: art.querySelectorAll('.dsr__contentsbtn').length,
    };
  });
  log('LAYOUT', JSON.stringify(m));
  await page.evaluate(() => document.querySelector('#dsr-think').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await shot('02-think');
  await page.click('.dsr__choice[data-value="false"]');
  await page.waitForTimeout(400);
  await shot('03-answered');
  await page.evaluate(() => { const n = document.querySelector('#dsr-evidence'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(300);
  await shot('04-evidence');
  await page.evaluate(() => window.BEA.store.batch((d) => d('select', 'jersey')));
  await page.waitForTimeout(400);
  await page.evaluate(() => { const n = document.querySelector('#dsr-actors'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(250);
  await shot('05-jersey-actors');
  log('jersey defect:', await page.evaluate(() => {
    const n = document.querySelector('.dsr__missing');
    return n ? n.innerText.replace(/\s+/g, ' ').slice(0, 160) : 'NONE';
  }));
  log('errors', errs.length, JSON.stringify(errs.slice(0, 3)));
};
