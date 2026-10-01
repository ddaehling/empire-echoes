/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(300);
  await shot('1820');
  const cap = await page.evaluate(() => {
    const c = document.querySelector('.tl-spine__caption');
    const r = c.getBoundingClientRect();
    return { text: c.innerText, clipped: c.scrollHeight > c.clientHeight + 1, h: r.height, sh: c.scrollHeight, ch: c.clientHeight,
      lit: [...document.querySelectorAll('.tl-lane[data-on="true"]')].map(b=>b.dataset.phase) };
  });
  log('1820 caption: ' + JSON.stringify(cap, null, 1));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(250);
  await shot('1947');
  const play = await page.evaluate(() => {
    const b = document.querySelector('.tl-btn--play');
    return { word: b.innerText.trim(), mode: b.dataset.mode, title: b.title, aria: b.getAttribute('aria-label') };
  });
  log('play button: ' + JSON.stringify(play));
  const marks = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.tl-mark:not([hidden])')];
    let bad=0, small=0; for (const b of btns) { const r=b.getBoundingClientRect();
      if (r.width<24||r.height<24) small++;
      const e=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      if (!(e===b||b.contains(e))) bad++; }
    return { n: btns.length, failHitTest: bad, underMin: small };
  });
  log('marks: ' + JSON.stringify(marks));
  const overflow = await page.evaluate(() => ({ bodyScrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
  log('overflow: ' + JSON.stringify(overflow));
};
