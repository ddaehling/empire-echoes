/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P06 geometry probe: does anything of THIS piece stand where it must not? */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1860));
  await page.waitForTimeout(400);
  await page.click('.ly-bar__open');
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const b = (s) => { const n = document.querySelector(s); if (!n) return null; const x = n.getBoundingClientRect();
      return { x: Math.round(x.x), y: Math.round(x.y), w: Math.round(x.width), h: Math.round(x.height), r: Math.round(x.right), bo: Math.round(x.bottom) }; };
    const over = (a, c) => (!a || !c) ? 0 : Math.max(0, Math.min(a.r, c.r) - Math.max(a.x, c.x)) * Math.max(0, Math.min(a.bo, c.bo) - Math.max(a.y, c.y));
    const map = b('.stage__map canvas');
    const sheetSel = ['.cx-sheet', '.app__dossier', '[data-mount="sheet"]'].find((s) => document.querySelector(s));
    const sheet = b(sheetSel);
    const mine = ['.ly-key', '.ly-caption', '.ly-bar', '.ly-run', '.ly-sheet'].map((s) => ({ s, box: b(s) }));
    // clipped text of mine
    const clipped = [];
    for (const n of document.querySelectorAll('.ly-key__word, .ly-key__note, .ly-run__title, .ly-run__then, .ly-sheet__sent, .ly-run .cx-ask__q, .ly-predict__b')) {
      if (n.scrollWidth > n.clientWidth + 1) clipped.push(n.className + ' :: ' + n.textContent.slice(0, 46));
    }
    // band clipping (the shell's element, our text)
    const say = document.querySelector('.cx-lede__say');
    const bandClip = say ? (say.scrollHeight > say.clientHeight + 1 || say.scrollWidth > say.clientWidth + 1) : null;
    return {
      rail: document.getElementById('app').dataset.rail,
      sheetSel, map, sheet,
      mine: mine.map((m) => ({ s: m.s, box: m.box, overMap: over(m.box, map) })),
      clipped,
      bandClip, bandText: say && say.textContent.slice(0, 90),
      docScroll: document.documentElement.scrollHeight <= document.documentElement.clientHeight,
      focusables: [...document.querySelectorAll('.ly-bar button, .ly-run button, .ly-sheet button, .ly-key button')].length,
    };
  });
  log('GEOM', JSON.stringify(r));
  await shot('sheet-open');
};
