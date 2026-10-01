/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => { location.hash = '#year=1930&sel=british-india'; });
  await page.waitForTimeout(1200);
  const g = await page.evaluate(() => {
    const d = document.querySelector('.app__dossier');
    const t = document.querySelector('.app__time');
    const e = d.querySelector('[data-block="ended"]');
    return { clientH: d.clientHeight, scrollH: d.scrollHeight, timeTop: Math.round(t.getBoundingClientRect().top),
      endedBottom: e ? Math.round(e.getBoundingClientRect().bottom) : null, panelBottom: Math.round(d.getBoundingClientRect().bottom),
      docScroll: document.documentElement.scrollHeight, win: innerHeight };
  });
  log('GEOM ' + JSON.stringify(g));
  await shot('01-india-1930');
  // scroll to the house-style footer
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Words'); if(b) b.click(); else document.querySelector('.app__dossier').scrollTop = 99999; });
  await page.waitForTimeout(1000);
  await shot('02-words');
  await page.evaluate(() => { location.hash = '#year=1955&sel=kenya'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Who was here'); if(b) b.click(); });
  await page.waitForTimeout(1000);
  await shot('03-kenya-actors');
  await page.evaluate(() => { location.hash = '#year=1609&sel=bermuda'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Who was here'); if(b) b.click(); });
  await page.waitForTimeout(1000);
  await shot('04-bermuda-actors');
  await page.evaluate(() => { location.hash = '#year=1830&sel=ascension'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Who was here'); if(b) b.click(); });
  await page.waitForTimeout(1000);
  await shot('05-ascension-actors');
};
