/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — the shell with no dossier open: the column must vanish and the
 * time bar and footer must go back to full width. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  log('closed: ' + JSON.stringify(await page.evaluate(() => {
    const app = document.querySelector('.app');
    const g = (s) => { const n = document.querySelector(s); const b = n.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), t: Math.round(b.top) }; };
    return { dossierState: app.dataset.dossier, cols: getComputedStyle(app).gridTemplateColumns, rows: getComputedStyle(app).gridTemplateRows, time: g('.app__time'), foot: g('.app__foot'), stage: g('.app__stage'), dossier: g('.app__dossier') };
  }), null, 1));
  await shot('closed');
  await page.evaluate(() => { location.hash = '#year=1913&sel=kenya'; });
  await page.waitForTimeout(1200);
  log('open: ' + JSON.stringify(await page.evaluate(() => {
    const app = document.querySelector('.app');
    const g = (s) => { const n = document.querySelector(s); const b = n.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; };
    return { dossierState: app.dataset.dossier, time: g('.app__time'), foot: g('.app__foot'), dossier: g('.app__dossier') };
  })));
  await shot('open');
};
