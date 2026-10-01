/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'clientHeight').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const els = [...document.querySelectorAll('*')].filter(e => {
      const b = e.getBoundingClientRect();
      return b.x > 1000 && b.y > 60 && b.y < 200 && b.width > 200 && b.width < 600;
    }).slice(0,12).map(e => ({ tag:e.tagName, cls:String(e.className).slice(0,90), rect:[Math.round(e.getBoundingClientRect().x),Math.round(e.getBoundingClientRect().y),Math.round(e.getBoundingClientRect().width),Math.round(e.getBoundingClientRect().height)] }));
    return els;
  });
  log('TOPRIGHT', JSON.stringify(r,null,1));
  await shot('legend-el', '.stage__legend');
  const body = await page.evaluate(() => {
    const b = document.querySelector('#legend-body');
    return { ch: b.clientHeight, sh: b.scrollHeight, ov: getComputedStyle(b).overflowY, txt: b.innerText.slice(0,600) };
  });
  log('LEGEND BODY', JSON.stringify(body,null,1));
};
