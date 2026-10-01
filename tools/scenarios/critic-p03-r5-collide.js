/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{location.hash='#year=1947';}); await page.waitForTimeout(1000);
  const r = await page.evaluate(()=>{
    const row = document.querySelector('.tl__changerow').getBoundingClientRect();
    const card = document.querySelector('.tl-chg');
    const cr = card.getBoundingClientRect();
    const ax  = document.querySelector('.tl-ax__rail').getBoundingClientRect();
    const marks = document.querySelector('.tl-ax__rail').querySelector('svg');
    // does a card cover an axis tick?
    const probe = document.elementFromPoint(ax.x + ax.width*0.45, ax.y + 6);
    return { rowBottom: row.bottom, cardBottom: cr.bottom, cardScrollH: card.scrollHeight, cardClientH: card.clientHeight,
      axTop: ax.y, overlapPx: Math.round(cr.bottom - ax.y),
      topAtAxisTop: probe ? probe.tagName+'.'+(typeof probe.className==='string'?probe.className:'svg') : null,
      trackOverflow: getComputedStyle(document.querySelector('.tl__track')).overflow };
  });
  log(JSON.stringify(r,null,1));
  await shot('collide');
};
