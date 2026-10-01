/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await fixGrid(page, log);
  // T6: seal vs crown
  for (const [id, y] of [['british-india',1800],['british-india',1900],['kenya',1955],['jamaica',1700]]) {
    await page.evaluate(([i,yy]) => { location.hash = `#year=${yy}&sel=${i}`; }, [id,y]);
    await page.waitForTimeout(800);
    const s = await page.evaluate(()=>{
      const d=document.querySelector('#dossier');
      const h=d.querySelector('h2');
      const mark=h&&h.parentElement?h.parentElement.querySelector('svg,[class*=seal],[class*=crest],[class*=mark]'):null;
      return { head:h?h.textContent.trim().slice(0,40):null, mark: mark? (mark.getAttribute('aria-label')||mark.className.baseVal||mark.className||mark.tagName):null,
               markTitle: mark? (mark.querySelector('title')?.textContent||''):'' };
    });
    log(`T6 ${id}@${y}:`, JSON.stringify(s));
  }
  // attribution gate
  await page.evaluate(() => { location.hash = '#year=1955&sel=kenya'; });
  await page.waitForTimeout(1200);
  const g = page.locator('#dossier button', { hasText: 'To argue a case to other historians' }).first();
  log('gate buttons:', await g.count());
  if (await g.count()) {
    await g.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await shot('gate-before');
    await g.click(); await page.waitForTimeout(700); await shot('gate-after');
    const t = await page.evaluate(()=>{const d=document.querySelector('#dossier').innerText;const i=d.indexOf('Elkins');return d.slice(i-200,i+1100).replace(/\n+/g,' | ');});
    log('gate result:', t);
  }
  // sections nav
  const nav = page.locator('#dossier button', { hasText: 'sections' }).first();
  if (await nav.count()) { await nav.click(); await page.waitForTimeout(500); await shot('sections-nav'); log('sections nav clicked'); }
};
