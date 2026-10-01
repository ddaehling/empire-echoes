/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1857&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const chips = await page.evaluate(() => Array.from(document.querySelectorAll('.app__dossier a, .app__dossier button')).map(b => ({tag:b.tagName, cls:b.className, txt:(b.innerText||'').replace(/\n/g,' ').slice(0,70), act: b.dataset.act||'', href: b.getAttribute('href')||''})));
  log('CONTROLS:', chips.length);
  for (const c of chips.slice(0,60)) log('  ', JSON.stringify(c));
};
