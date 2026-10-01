/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const IDS = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
module.exports = async ({ page, shot, log, url }) => {
  for (const id of IDS) {
    await page.goto(url + '#year=1900', { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const box = await page.evaluate((id) => {
      const el = document.querySelector(`.map__target[data-unit="${id}"]`);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const top = document.elementFromPoint(b.x+b.width/2, b.y+b.height/2);
      return { x:b.x+b.width/2, y:b.y+b.height/2, w:b.width, top: top? (top.tagName+'.'+(top.className.baseVal||top.className)).slice(0,50):null };
    }, id);
    if (!box) { log('ABSENT ' + id); continue; }
    await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(800);
    const sel = await page.evaluate(() => ({u:document.querySelector('.map__target[aria-selected="true"]')?.dataset.unit || null, h:location.hash}));
    log(`${id}: at ${Math.round(box.x)},${Math.round(box.y)} top=${box.top} -> ${JSON.stringify(sel)}`);
  }
  await shot('last');
};
