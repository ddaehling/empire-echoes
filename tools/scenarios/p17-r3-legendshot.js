/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 r3 — a close crop of the legend panel and the byline. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const legend = await page.$('.stage__legend');
  if (legend) { const b = await legend.boundingBox();
    await page.screenshot({ path: require('path').join(process.env.SHOT_DIR || '/tmp', 'legend-el.png'), clip: b }); }
  await shot('01-legend');
  const rows = await page.evaluate(() => {
    const out = [];
    for (const r of document.querySelectorAll('.legend__marksfix .legend__row')) {
      const rr = r.getBoundingClientRect(); out.push({ h: Math.round(rr.height), t: r.innerText.replace(/\n/g,' ⏎ ') });
    }
    const key = [];
    for (const r of document.querySelectorAll('#legend-body .legend__row, #legend-body .legend__family-head')) {
      const rr = r.getBoundingClientRect(); key.push({ h: Math.round(rr.height), t: r.innerText.replace(/\n/g,' ⏎ ').slice(0,80) });
    }
    const h3 = document.querySelector('#legend-status-h');
    return { marks: out, marksH3: h3 ? null : null,
      headH3: (() => { const e = document.querySelector('.legend__marksfix .legend__h'); return e ? Math.round(e.getBoundingClientRect().height) : null; })(),
      keyH3: (() => { const e = document.querySelector('#legend-status-h'); return e ? Math.round(e.getBoundingClientRect().height) : null; })(),
      key: key.slice(0, 8) };
  });
  log(JSON.stringify(rows, null, 1));
};
