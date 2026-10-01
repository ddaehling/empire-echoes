/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = '#tour=period&step=6'; });
  await page.waitForTimeout(2600);
  log(JSON.stringify(await page.evaluate(() => {
    const body = document.querySelector('.cx-sheet__body');
    const kinds = body ? [...body.children].map(c => c.className + '') : [];
    const win = document.querySelector('[data-read-window], .tr-panel__scroll, .cl-close__scroll');
    return {
      read: document.getElementById('app').getAttribute('data-read'),
      beatwork: document.getElementById('app').getAttribute('data-beatwork'),
      tourfit: document.documentElement.getAttribute('data-tour-fit'),
      sheetId: document.getElementById('app').getAttribute('data-sheet-id') || null,
      bodyKids: kinds,
      bodyOverflow: body && getComputedStyle(body).overflowY,
      bodyCH: body && body.clientHeight, bodySH: body && body.scrollHeight,
      win: win && (win.className + ' ' + win.clientHeight + '/' + win.scrollHeight),
      hasTrPanel: !!document.querySelector('.app__sheet .tr-panel'),
      panelClasses: [...document.querySelectorAll('.app__sheet .tr-panel, .app__sheet .qz, .app__sheet .cl-close')].map(e=>e.className+''),
    };
  }), null, 1));
};
