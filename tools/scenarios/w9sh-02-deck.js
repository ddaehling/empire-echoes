/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const M = () => {
  const band = document.querySelector('.app__time'), tl = document.querySelector('.tl');
  const deck = document.querySelector('.tl__deck'), body = document.querySelector('.tl__body');
  const rr = e => e ? [Math.round(e.getBoundingClientRect().x), Math.round(e.getBoundingClientRect().y), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)] : null;
  const kids = (el) => el ? [...el.children].filter(c => c.getBoundingClientRect().height > 0).map(c => ({
    c: c.className || c.tagName, r: rr(c), sh: c.scrollHeight, txt: (c.textContent || '').trim().slice(0, 40) })) : [];
  const tlcs = tl && getComputedStyle(tl);
  return {
    band: rr(band), tl: rr(tl), tlPad: tlcs && [tlcs.paddingTop, tlcs.paddingBottom],
    tlClient: tl && tl.clientHeight, tlScroll: tl && tl.scrollHeight,
    tlRows: tlcs && tlcs.gridTemplateRows,
    deck: rr(deck), deckScroll: deck && deck.scrollHeight,
    body: rr(body), bodyScroll: body && body.scrollHeight,
    deckKids: kids(deck), bodyKids: kids(body),
    stage: document.documentElement.getAttribute('data-stage'),
  };
};
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.store.dispatch('setPlaying', false));
  for (const level of ['plate', 'working', 'apparatus']) {
    await page.evaluate(l => window.BEA.bus.emit('ask:stage', { level: l }), level);
    await page.waitForTimeout(1100);
    log('--- ' + level + ' --- ' + JSON.stringify(await page.evaluate(M)));
  }
  await shot('apparatus-band', '.app__time');
};
