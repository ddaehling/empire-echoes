/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(1200);
  // keyboard tab through
  const seq = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    seq.push(await page.evaluate(() => { const a = document.activeElement;
      return (a.tagName||'') + '.' + (a.className||'').toString().slice(0,40) + ' "' + (a.innerText||a.getAttribute('aria-label')||'').replace(/\n/g,'/').slice(0,40) + '"'; }));
  }
  log('TAB ORDER (40):\n' + seq.join('\n'));
  // aria on the dossier host
  const aria = await page.evaluate(() => { const h = document.querySelector('.app__dossier');
    return { role: h.getAttribute('role'), label: h.getAttribute('aria-label'), tabindex: h.getAttribute('tabindex'),
      live: !!document.querySelector('[aria-live]'), h1: [...document.querySelectorAll('.app__dossier h1,.app__dossier h2,.app__dossier h3')].map(n=>n.tagName+':'+n.innerText.slice(0,40)).slice(0,12) }; });
  log('DOSSIER ARIA: ' + JSON.stringify(aria, null, 1));
};
