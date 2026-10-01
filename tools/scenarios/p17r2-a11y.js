/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'focus').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForFunction(() => window.BEA && window.BEA.legend, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  // tab order inside the legend + byline: any duplicate definition switch?
  log('SWITCHES ' + JSON.stringify(await page.evaluate(() => {
    const defBtns = [...document.querySelectorAll('button')].filter(b => /^(claimed|administered|controlled|influenced)$/i.test(b.innerText.replace(/[0-9\s]/g,'')));
    return { count: defBtns.length, where: defBtns.map(b => b.closest('[data-mount]') ? b.closest('[data-mount]').dataset.mount : '?') };
  })));

  // keyboard: reach the fold, the criticism, and a legend row
  const focusables = await page.evaluate(() => {
    const root = document.querySelector('.stage__legend');
    const note = document.querySelector('.stage__note');
    const sel = 'a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"])';
    return { legend: [...root.querySelectorAll(sel)].length, byline: [...note.querySelectorAll(sel)].length };
  });
  log('FOCUSABLES ' + JSON.stringify(focusables));

  // activate a row with the keyboard
  await page.evaluate(() => { const r = document.querySelector('.legend__entry[data-status]'); r.focus(); });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  log('KBD ROLL ' + JSON.stringify(await page.evaluate(() => {
    const b = document.querySelector('.legend__entry[data-status]');
    return { pressed: b.getAttribute('aria-pressed'), expanded: b.getAttribute('aria-expanded'),
      controls: b.getAttribute('aria-controls'), rollExists: !!document.getElementById(b.getAttribute('aria-controls')),
      focusKept: document.activeElement === b || document.activeElement.dataset.focusKey === b.dataset.focusKey };
  })));
  await page.keyboard.press('Enter'); await page.waitForTimeout(600);

  // fold + reopen, both by keyboard
  await page.evaluate(() => document.querySelector('.legend__toggle').focus());
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  log('COMPACT ' + await page.evaluate(() => document.querySelector('.stage__legend').innerText.replace(/\n/g,' | ')));
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  log('BACK ' + await page.evaluate(() => !!document.querySelector('.legend__bodywrap')));

  // announcements
  log('LIVE ' + await page.evaluate(() => (document.getElementById('live-status')||{}).textContent));

  // print stylesheet
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  log('PRINT ' + JSON.stringify(await page.evaluate(() => {
    const l = document.querySelector('.legend'), b = document.querySelector('#legend-byline');
    const body = document.querySelector('.legend__bodywrap');
    const cs = (e) => e ? { overflow: getComputedStyle(e).overflowY, maxH: getComputedStyle(e).maxBlockSize, h: e.getBoundingClientRect().height } : null;
    return { legend: cs(l), byline: cs(b), body: cs(body),
      crit: cs(document.querySelector('.byline__crit-panel')),
      foldHidden: getComputedStyle(document.querySelector('.legend__toggle')).display };
  })));
  await shot('print');
  await page.emulateMedia({ media: 'screen' });
  log('ERRORS ' + JSON.stringify(errs));
};
