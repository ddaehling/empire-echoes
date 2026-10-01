/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => { location.hash = '#year=1947&sel=british-india'; });
  await page.waitForTimeout(1200);
  // find the first because-chip rail and scroll it into the middle of the panel
  const y = await page.evaluate(() => {
    const d = document.querySelector('.app__dossier');
    const w = d.querySelector('.dsr__becausewrap');
    if (!w) return null;
    const top = w.getBoundingClientRect().top - d.getBoundingClientRect().top + d.scrollTop - 120;
    d.scrollTop = Math.max(0, top);
    return d.scrollTop;
  });
  await page.waitForTimeout(600);
  log('scrolled to chips at ' + y);
  await shot('01-because-chips');
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Evidence'); if(b) b.click(); });
  await page.waitForTimeout(1100);
  await shot('02-evidence');
  log('tally: ' + await page.evaluate(() => { const n=document.querySelector('.dsr__srccount'); return n?n.textContent.replace(/\s+/g,' '):'none'; }));
  log('shape: ' + await page.evaluate(() => { const n=document.querySelector('.dsr__shape'); return n?n.textContent.replace(/\s+/g,' '):'none'; }));
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Inside it'); if(b) b.click(); });
  await page.waitForTimeout(1100);
  await shot('03-t11');
};
