/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  log('title:', await page.title());
  const txt = await page.evaluate(() => document.body.innerText);
  log('BODY TEXT:\n' + txt.slice(0, 4000));
  // find legend-ish nodes
  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[class*="legend"],[id*="legend"],[class*="byline"],[id*="byline"],[class*="stage-note"]').forEach(el => {
      out.push({ tag: el.tagName, id: el.id, cls: el.className && el.className.toString().slice(0,120), text: (el.innerText||'').slice(0,400) });
    });
    return out;
  });
  log('LEGEND NODES: ' + JSON.stringify(info, null, 1).slice(0, 6000));
};
