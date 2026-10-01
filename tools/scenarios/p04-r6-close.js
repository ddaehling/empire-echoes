/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Closing, deselecting and the band. The dossier must leave the rail and the
 * one-sentence band exactly as it found them. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const zero = await page.evaluate(() => ({
    stage: document.querySelector('.app').dataset.stage,
    dossier: document.querySelector('.app').dataset.dossier,
    sheet: document.querySelector('.app').dataset.sheet,
    railW: getComputedStyle(document.querySelector('.app')).gridTemplateColumns,
    say: (document.querySelector('.cx-lede__say') || {}).innerText,
    ctas: document.querySelectorAll('.cx-cta').length,
    dossierText: (document.querySelector('.app__dossier') || { innerText: '' }).innerText.length,
  }));
  log('second zero: ' + JSON.stringify(zero));

  await page.goto('http://localhost:8777/app/#year=1900&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.click('[data-act="sheet"][data-sheet="evidence"]');
  await page.waitForTimeout(500);
  const open = await page.evaluate(() => ({
    sheet: document.querySelector('.app').dataset.sheet,
    say: (document.querySelector('.cx-lede__say') || {}).innerText,
    cta: (document.querySelector('.cx-cta') || {}).innerText,
  }));
  log('with a sheet open: ' + JSON.stringify(open));

  /* close the dossier itself — the sheet must go with it and the band must
     hand the sentence back to the shell */
  await page.evaluate(() => { document.querySelector('.dsr__close').click(); });
  await page.waitForTimeout(700);
  const closed = await page.evaluate(() => ({
    dossier: document.querySelector('.app').dataset.dossier,
    sheet: document.querySelector('.app').dataset.sheet,
    say: (document.querySelector('.cx-lede__say') || {}).innerText,
    empty: !!document.querySelector('.dossier--empty'),
    ctas: document.querySelectorAll('.cx-cta').length,
    doc: document.documentElement.scrollHeight + '/' + innerHeight,
  }));
  log('after close: ' + JSON.stringify(closed));
  await shot('closed');
};
