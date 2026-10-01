/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(1600);
  const g = await page.evaluate(() => {
    const d = document.querySelector('.app__dossier');
    const time = document.querySelector('.app__time');
    const map = document.querySelector('.stage__map');
    return { clientH: d.clientHeight, scrollH: d.scrollHeight,
      timeTop: Math.round(time.getBoundingClientRect().top), mapTop: map.getBoundingClientRect().top,
      mapH: Math.round(map.getBoundingClientRect().height),
      docScrollH: document.documentElement.scrollHeight, win: innerHeight,
      buttons: [...document.querySelectorAll('.app__dossier button')].length };
  });
  log('GEOM ' + JSON.stringify(g));
  const fold = await page.evaluate(() => {
    const q = s => { const n = document.querySelector(s); return n ? Math.round(n.getBoundingClientRect().bottom) : null; };
    return { status: q('[data-block="status"]'), taken: q('[data-block="taken"]'), ended: q('[data-block="ended"]'),
      franchise: !!document.querySelector('.dsr__franchise'), win: innerHeight };
  });
  log('FOLD ' + JSON.stringify(fold));
  await shot('01-top');
  await page.mouse.move(1150, 450);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(500);
  log('WHEELED ' + JSON.stringify(await page.evaluate(() => ({
    dossierScrollTop: document.querySelector('.app__dossier').scrollTop,
    docScrollTop: document.documentElement.scrollTop,
    timeTop: Math.round(document.querySelector('.app__time').getBoundingClientRect().top) }))));
  await shot('02-wheeled');
  const labels = await page.$$eval('.dsr__railbtn', ns => ns.map(n => n.textContent));
  log('rail: ' + labels.join(' | '));
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Evidence'); if(b) b.click(); });
  await page.waitForTimeout(1000);
  log('AFTER RAIL ' + JSON.stringify(await page.evaluate(() => ({ st: document.querySelector('.app__dossier').scrollTop, doc: document.documentElement.scrollTop }))));
  await shot('03-rail-evidence');
};
