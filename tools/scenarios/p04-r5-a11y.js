/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — keyboard, focus and the contents rail through the folds. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  /* contents button into a folded section must open it and land on it */
  const jump = await page.evaluate(async () => {
    const b = [...document.querySelectorAll('.dsr__contentsbtn')].find((x) => /source/i.test(x.textContent));
    if (!b) return 'no sources button';
    b.click();
    await new Promise((r) => setTimeout(r, 800));
    const s = document.querySelector('#dsr-evidence');
    const det = s ? s.closest('details') : null;
    const box = s ? s.getBoundingClientRect() : null;
    const host = document.querySelector('.app__dossier').getBoundingClientRect();
    return { opened: det ? det.open : null, visible: box ? (box.top < host.bottom && box.bottom > host.top) : null, focus: document.activeElement.className };
  });
  log('contents -> folded section: ' + JSON.stringify(jump));
  await shot('contents-jump');

  /* keyboard: D focuses the panel, Tab reaches a fold, Enter opens it */
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  await page.evaluate(() => document.getElementById('stage').focus());
  await page.keyboard.press('d');
  await page.waitForTimeout(250);
  log('after D, focus = ' + await page.evaluate(() => document.activeElement.className + ' / ' + document.activeElement.tagName));
  let found = null;
  for (let i = 0; i < 70 && !found; i++) {
    await page.keyboard.press('Tab');
    found = await page.evaluate(() => (document.activeElement.classList.contains('dsr__extsum') ? document.activeElement.textContent.slice(0, 50) : null));
  }
  log('tabbed to a fold summary: ' + JSON.stringify(found));
  if (found) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    log('after Enter, open = ' + await page.evaluate(() => document.activeElement.closest('details').open));
  }
  /* Escape returns to the map */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  log('after Escape, focus = ' + await page.evaluate(() => document.activeElement.id || document.activeElement.className));
  /* focus ring visible on the summary */
  await shot('kbd-fold');
};
