/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 6 — drive the staged dossier: fold, index, sheet, question. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2800);
  await shot('01-fold');

  const aside = page.locator('.app__dossier');
  await aside.evaluate((n) => { n.scrollTop = n.scrollHeight; });
  await page.waitForTimeout(400);
  await shot('02-page-foot');

  // the index
  const rows = await page.$$eval('.dsr__idxrow .dsr__idxbtn', (ns) => ns.map((n) => n.textContent.trim()));
  log('index rows: ' + JSON.stringify(rows));

  // open the promoted asset
  await page.click('[data-act="sheet"][data-sheet="testimony"]');
  await page.waitForTimeout(600);
  const sheet = await page.evaluate(() => {
    const s = document.querySelector('.app__sheet');
    const b = document.querySelector('.cx-sheet__body');
    const app = document.querySelector('.app');
    const r = s ? s.getBoundingClientRect() : null;
    const map = document.querySelector('.stage__map svg, .stage__map canvas, .stage__map > *');
    const mr = map ? map.getBoundingClientRect() : null;
    return {
      appSheet: app.dataset.sheet, appDossier: app.dataset.dossier,
      rect: r ? { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) } : null,
      title: (document.querySelector('.cx-sheet__title') || {}).textContent,
      eyebrow: (document.querySelector('.cx-sheet__eyebrow') || {}).textContent,
      bodyScrollH: b ? b.scrollHeight : null, bodyH: b ? Math.round(b.getBoundingClientRect().height) : null,
      chars: b ? b.innerText.length : 0,
      srcs: b ? b.querySelectorAll('.src').length : 0,
      asks: b ? b.querySelectorAll('.cx-ask').length : 0,
      map: mr ? { w: Math.round(mr.width), h: Math.round(mr.height) } : null,
      docScroll: document.documentElement.scrollHeight + '/' + innerHeight,
    };
  });
  log('sheet(testimony): ' + JSON.stringify(sheet));
  await shot('03-sheet-testimony');

  // the attribution gate lives in there — press one choice
  const choice = await page.$('.cx-sheet__body [data-act="ask"][data-kind="purpose"]');
  log('gate present in sheet: ' + !!choice);
  if (choice) {
    await choice.click();
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => ({
      state: (document.querySelector('.cx-sheet__body [data-ask="purpose"]') || {}).dataset,
      verdict: (document.querySelector('.cx-sheet__body .dsr__askverdict') || {}).textContent,
      stillOpen: document.querySelector('.app').dataset.sheet,
      ledger: (window.BEA && window.BEA.dossierLedger) ? window.BEA.dossierLedger.all().length : null,
    }));
    log('after gate: ' + JSON.stringify(after));
    await shot('04-sheet-gate-answered');
  }

  // close, then a reference section
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.click('[data-act="sheet"][data-sheet="evidence"]');
  await page.waitForTimeout(600);
  log('sheet(evidence): ' + JSON.stringify(await page.evaluate(() => ({
    title: (document.querySelector('.cx-sheet__title') || {}).textContent,
    chars: (document.querySelector('.cx-sheet__body') || { innerText: '' }).innerText.length,
    srcs: document.querySelectorAll('.cx-sheet__body .src').length,
  }))));
  await shot('05-sheet-evidence');

  // a because-chip from the page still navigates
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const chip = await page.$('.app__dossier .dsr-chip');
  if (chip) {
    const before = await page.evaluate(() => location.hash);
    await chip.click();
    await page.waitForTimeout(900);
    log('chip nav: ' + before + ' -> ' + (await page.evaluate(() => location.hash))
      + ' name=' + (await page.$eval('.dsr__name', (n) => n.textContent)));
    await shot('06-after-chip');
  } else log('chip: NONE');
};
