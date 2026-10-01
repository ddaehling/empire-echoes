/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P18 round-4 drive: keyboard only, a resize across the 62rem band boundary
 * with a comparison open inside a held lesson, and the ways in and out taken
 * in every order. Reports console errors, page errors, failed requests and
 * horizontal overflow, and must print 0 for all four.
 */
const READY = () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready';

module.exports = async ({ page, shot, log }) => {
  const s = () => page.evaluate(() => {
    const app = document.getElementById('app'); const st = window.BEA.store.getState();
    const cmp = document.querySelector('.cmp');
    const lede = document.querySelector('.app__lede');
    return { dock: app.dataset.dock, year: st.year, cmpY: st.compareYear, sel: st.selectedTerritoryId,
      open: !!(cmp && !cmp.hidden), plates: [...document.querySelectorAll('.cmp__year')].map(n=>n.textContent.trim()),
      held: !!(document.querySelector('.cmp__held') && !document.querySelector('.cmp__held').hidden),
      bandDated: /\b(1[5-9]\d\d|20[0-2]\d)\b/.test((lede ? lede.innerText : '').slice(0, 60)),
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      focus: document.activeElement ? (document.activeElement.className || document.activeElement.tagName) : null };
  });

  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(READY); await page.waitForTimeout(1200);

  /* ---- keyboard only ---------------------------------------------------- */
  await page.keyboard.press('v'); await page.waitForTimeout(900);
  log('kbd open: ' + JSON.stringify(await s()));
  // commit the prediction from the keyboard
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  log('kbd commit: ' + JSON.stringify(await s()));
  // move both plates with the arrow keys from the plate that has focus
  await page.evaluate(() => document.querySelector('.cmp__side[data-side="a"]').focus());
  for (const k of ['ArrowLeft', 'ArrowDown', '+', '-', 'Home']) { await page.keyboard.press(k); await page.waitForTimeout(120); }
  log('kbd camera: ' + JSON.stringify(await s()));
  await shot('kbd');
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  log('kbd escape: ' + JSON.stringify(await s()));

  /* ---- a resize walk across 62rem with the comparison up ---------------- */
  await page.keyboard.press('v'); await page.waitForTimeout(900);
  for (const [w, h] of [[1366, 768], [900, 700], [768, 1024], [390, 844], [1024, 640], [1440, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(600);
    const st = await s();
    log(`resize ${w}x${h}: ` + JSON.stringify(st));
  }
  await shot('after-resize-walk');

  /* ---- and out, with the lesson intact ---------------------------------- */
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('.cmp__close').click());
  await page.waitForTimeout(1300);
  log('closed: ' + JSON.stringify(await s()));
  await shot('closed');

  /* ---- reopen, switch comparisons, close by pressing v ------------------ */
  await page.keyboard.press('v'); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelectorAll('.cmp__pick')[3].click());
  await page.waitForTimeout(900);
  log('switched: ' + JSON.stringify(await s()));
  await page.keyboard.press('v'); await page.waitForTimeout(1300);
  log('v closed: ' + JSON.stringify(await s()));

  /* ---- the lesson advancing under an open comparison -------------------- */
  await page.keyboard.press('v'); await page.waitForTimeout(900);
  await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (n) n.click(); });
  await page.waitForTimeout(1400);
  log('next pressed under it: ' + JSON.stringify(await s()));
  await shot('after-next');
};
