/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const b = page.getByText(/Open the full key/i).first();
  await b.click(); await page.waitForTimeout(1200);
  await shot('plate-open');
  const m = await page.evaluate(() => {
    const R = e => { const r=e.getBoundingClientRect(); return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]; };
    const plate = document.querySelector('.lplate, [class*="lplate"]');
    const sc = plate && Array.from(plate.querySelectorAll('*')).find(e=>e.scrollHeight>e.clientHeight+20);
    const stage = document.querySelector('.app__stage');
    const mp = document.querySelector('.map__plate');
    return { vw:innerWidth, vh:innerHeight, plate: plate?{cls:plate.className,r:R(plate),sh:plate.scrollHeight,ch:plate.clientHeight}:null,
      scroller: sc?{cls:sc.className, sh:sc.scrollHeight, ch:sc.clientHeight}:null,
      stage: stage?R(stage):null, map: mp?R(mp):null,
      text: plate? plate.innerText.slice(0,9000):null };
  });
  log('PLATE ' + JSON.stringify({vw:m.vw,vh:m.vh,plate:m.plate,scroller:m.scroller,stage:m.stage,map:m.map}, null, 1));
  log('TEXT>>>\n' + (m.text||''));
  // scroll the plate to bottom and shoot
  await page.evaluate(() => { const p=document.querySelector('.lplate,[class*="lplate"]'); const sc = p && Array.from(p.querySelectorAll('*')).find(e=>e.scrollHeight>e.clientHeight+20); (sc||p).scrollTop = 99999; });
  await page.waitForTimeout(500); await shot('plate-bottom');
};
