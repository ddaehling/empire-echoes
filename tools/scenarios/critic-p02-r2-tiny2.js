/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const IDS = ['gibraltar','malta','ascension','barbados','singapore','hk-hong-kong-island'];
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  const r = await page.evaluate((IDS) => {
    const all = [...document.querySelectorAll('.map__target')].map(e=>e.dataset.unit);
    const out = { adenLike: all.filter(u=>/aden|yemen|ye-/.test(u)), total: all.length };
    out.cover = {};
    for (const id of IDS) {
      const el = document.querySelector(`.map__target[data-unit="${id}"]`);
      if (!el) { out.cover[id]='absent'; continue; }
      const b = el.getBoundingClientRect();
      const top = document.elementFromPoint(b.x+b.width/2, b.y+b.height/2);
      out.cover[id] = { rect:[Math.round(b.x),Math.round(b.y)], top: top ? (top.tagName+'.'+(top.className.baseVal||top.className)).slice(0,80) : null,
        topIsTarget: top === el, hidden: getComputedStyle(el).pointerEvents + '/' + getComputedStyle(el).visibility };
    }
    return out;
  }, IDS);
  log(JSON.stringify(r, null, 1));
  // keyboard: focus the listbox and arrow through
  await page.evaluate(() => document.querySelector('.map__target[tabindex="0"]')?.focus());
  await page.waitForTimeout(300);
  log('focused: ' + await page.evaluate(() => document.activeElement?.getAttribute('aria-label')));
  for (let i=0;i<3;i++){ await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250);
    log('after arrow ' + (i+1) + ': ' + await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))); }
  await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  log('enter -> ' + await page.evaluate(()=>location.hash));
  await shot('kbd');
};
