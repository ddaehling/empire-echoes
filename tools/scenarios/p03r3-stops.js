/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  log(JSON.stringify(await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    return [...tl.stops.values()].map(s => ({ y: s.year, kind: s.kind, t: s.title, why: s.why.slice(0, 150) }));
  }), null, 1));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 2020));
  await page.waitForTimeout(150);
  log('2020: ' + JSON.stringify(await page.evaluate(() => ({
    caption: document.querySelector('.tl-spine__caption').innerText,
    seen: document.querySelector('.tl-spine__seen').innerText,
    head: document.querySelector('.tl__changehead').innerText.replace(/\n/g,' | '),
    nothing: (()=>{const n=document.querySelector('.tl__nothing'); return n && !n.hidden ? n.innerText.replace(/\n/g,' | ') : null;})(),
  })), null, 1));
  // definition switch
  for (const d of ['controlled','influenced','claimed']) {
    await page.evaluate((dd) => window.BEA.store.dispatch('setFilter', { def: dd }), d);
    await page.waitForTimeout(250);
    log(d + ' @1913: ' + JSON.stringify(await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1913); return null; })));
    await page.waitForTimeout(200);
    log(d + ' -> ' + JSON.stringify(await page.evaluate(() => ({ count: document.querySelector('.tl__count').textContent, head: document.querySelector('.tl__changehead').innerText.replace(/\n/g,' | ') }))));
  }
};
