/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const ids = await page.evaluate(() => window.BEA.data.territories.map(t => t.id));
  const years = [1700, 1800, 1900, 1955, 2000];
  const bad = [];
  for (const y of years) {
    for (const id of ids) {
      await page.evaluate((a) => { location.hash = '#year=' + a[0] + '&sel=' + a[1]; }, [y, id]);
      await page.waitForTimeout(60);
      const r = await page.evaluate(() => {
        const d = document.querySelector('.app__dossier');
        const e = d.querySelector('[data-block="ended"]');
        return { over: e ? Math.round(e.getBoundingClientRect().bottom - d.getBoundingClientRect().bottom) : null };
      });
      if (r.over == null || r.over > 0) bad.push(y + ' ' + id + ' over=' + r.over);
    }
  }
  log('checked ' + (ids.length * years.length) + ' dossier renders across ' + years.join(', '));
  log('fold overflow failures: ' + bad.length);
  bad.slice(0, 25).forEach(b => log('  ' + b));
  // the house-style footer
  await page.evaluate(() => { location.hash = '#year=1800&sel=saint-lucia'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Words'); if(b) b.click(); });
  await page.waitForTimeout(1100);
  await shot('words-saint-lucia');
  log('words block: ' + await page.evaluate(() => { const n = document.querySelector('.dsr__style'); return n ? n.textContent.replace(/\s+/g,' ').slice(0, 400) : 'NONE'; }));
};
