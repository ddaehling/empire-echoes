/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const d = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const rect = e => e ? (r => ({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect()) : null;
    const out = {};
    const leg = q('.legend');
    out.legendClass = leg && leg.className;
    out.legendRect = rect(leg);
    out.legendText = leg && leg.innerText;
    const stage = q('.stage') || q('#stage');
    out.stageRect = rect(stage);
    const svg = q('.stage svg') || q('svg');
    out.svgRect = rect(svg);
    // byline
    const by = document.querySelector('[class*="byline"]');
    out.bylineClass = by && by.className;
    out.bylineRect = rect(by);
    out.bylineText = by && by.innerText;
    // stage-note
    const sn = q('.stage-note') || q('#stage-note');
    out.stageNoteRect = rect(sn);
    out.stageNoteText = sn && sn.innerText;
    return out;
  });
  log(JSON.stringify(d, null, 1));
};
