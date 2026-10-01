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
  await page.evaluate(() => { location.hash = '#year=1900&sel=kenya'; });
  await page.waitForTimeout(1600);
  await fixGrid(page, log);
  await shot('kenya-1900');
  // a11y basics
  const a = await page.evaluate(() => {
    const d = document.querySelector('#dossier');
    const heads = [...d.querySelectorAll('h1,h2,h3,h4,h5')].map(h=>h.tagName+':'+h.textContent.trim().slice(0,40));
    const noName = [...d.querySelectorAll('button,a[href]')].filter(b=>!(b.textContent.trim()||b.getAttribute('aria-label'))).length;
    return { role: d.getAttribute('role'), aria: d.getAttribute('aria-label'), live: d.getAttribute('aria-live'),
             headings: heads.slice(0,25), headingCount: heads.length, unnamedControls: noName,
             tabbables: d.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])').length };
  });
  log('a11y:', JSON.stringify(a, null, 1));
  // keyboard: tab into the dossier
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  const f = await page.evaluate(()=>{const e=document.activeElement; return e.tagName+' | '+(e.textContent||'').trim().slice(0,60)+' | inDossier='+!!e.closest('#dossier');});
  log('focus after 3 tabs:', f);
  // Escape closes?
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  log('hash after Escape:', await page.evaluate(()=>location.hash));
  await shot('after-escape');
};
