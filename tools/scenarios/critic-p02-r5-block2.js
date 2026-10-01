/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  await page.keyboard.press('e'); await page.waitForTimeout(1200);
  await page.keyboard.press('p'); await page.waitForTimeout(4000);
  const gb = await page.evaluate(() => {
    const e = document.querySelector('[data-unit="gb-england"]');
    const b = e && e.getBoundingClientRect();
    const el = b && document.elementFromPoint(b.x+b.width/2, b.y+b.height/2);
    return { rect: b&&{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)},
      top: el && (el.className||el.tagName) };
  });
  log('gb-england: ' + JSON.stringify(gb));
  if (gb.rect) {
    await page.mouse.click(gb.rect.x + gb.rect.w/2, gb.rect.y + gb.rect.h/2);
    await page.waitForTimeout(1500);
    log('hash after click: ' + await page.evaluate(()=>location.hash));
    log('sel: ' + await page.evaluate(()=>{const s=document.querySelector('.map__target[aria-selected="true"]'); return s&&s.dataset.unit;}));
    await shot('gb-click');
  }
  // Compare: click India (not under byline)
  const inb = await page.evaluate(() => { const e=document.querySelector('[data-unit="in-bengal-presidency"]')||document.querySelector('[data-unit^="in-"]'); const b=e&&e.getBoundingClientRect(); return {id:e&&e.dataset.unit, rect:b&&{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}}; });
  log('india: ' + JSON.stringify(inb));
  if (inb.rect) { await page.mouse.click(inb.rect.x+inb.rect.w/2, inb.rect.y+inb.rect.h/2); await page.waitForTimeout(1500);
    log('hash after india click: ' + await page.evaluate(()=>location.hash)); await shot('india-click'); }
};
