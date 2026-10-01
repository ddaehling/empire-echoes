/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const cover = async (tag) => {
    const r = await page.evaluate(() => {
      const c = document.querySelector('.map__plate').getBoundingClientRect();
      const by = document.querySelector('.byline'); const b = by && by.getBoundingClientRect();
      const ov = b ? Math.max(0, Math.min(b.bottom,c.bottom)-Math.max(b.top,c.top)) * Math.max(0, Math.min(b.right,c.right)-Math.max(b.left,c.left)) : 0;
      const inTop = document.elementFromPoint(c.x+c.width/2, c.y+c.height/2);
      return { plate:{w:Math.round(c.width),h:Math.round(c.height)}, byline:b&&{w:Math.round(b.width),h:Math.round(b.height),y:Math.round(b.y)}, coverPct: Math.round(100*ov/(c.width*c.height)), centreTop: inTop && (inTop.className||inTop.tagName) };
    });
    log(tag+': '+JSON.stringify(r));
  };
  await cover('landing');
  // try FOLD
  const fold = await page.$('.legend__toggle');
  log('fold button: ' + (fold ? await fold.innerText() : 'none'));
  if (fold) { await fold.click(); await page.waitForTimeout(1200); await cover('after fold'); await shot('mob-folded'); }
  // try E
  await page.keyboard.press('e'); await page.waitForTimeout(1500); await cover('after E'); await shot('mob-E');
  // tap centre of plate
  const c = await page.evaluate(()=>{const b=document.querySelector('.map__plate').getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2};});
  await page.mouse.click(c.x, c.y); await page.waitForTimeout(1200);
  log('hash after centre tap: ' + await page.evaluate(()=>location.hash));
  await shot('mob-tap');
};
