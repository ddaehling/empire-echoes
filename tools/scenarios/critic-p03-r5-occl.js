/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const rail = document.querySelector('.tl-ax__rail');
    const rb = rail.getBoundingClientRect();
    const out = [];
    // sample along the axis
    for (let f = 0.05; f <= 0.99; f += 0.05) {
      const x = rb.x + rb.width * f, y = rb.y + rb.height/2;
      const top = document.elementFromPoint(x, y);
      out.push(`${f.toFixed(2)} x=${Math.round(x)} -> ${top ? top.tagName + '.' + (typeof top.className==='string'?top.className:'') : 'null'}`);
    }
    const spine = document.querySelector('.tl-spine__track').getBoundingClientRect();
    const so = [];
    for (let f = 0.05; f <= 0.99; f += 0.1) {
      const x = spine.x + spine.width*f, y = spine.y + spine.height*0.8;
      const top = document.elementFromPoint(x,y);
      so.push(`${f.toFixed(2)} -> ${top? top.tagName+'.'+(typeof top.className==='string'?top.className:''):'null'}`);
    }
    const railEl = document.querySelector('.map__rail');
    return { axis: out, spineHits: so, rail: railEl ? railEl.getBoundingClientRect().toJSON() : null,
             railStyle: railEl ? getComputedStyle(railEl).position + ' z:' + getComputedStyle(railEl).zIndex + ' bg:' + getComputedStyle(railEl).backgroundColor : null };
  });
  log(JSON.stringify(r, null, 1));
};
