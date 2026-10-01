/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const seq = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const d = await page.evaluate(() => {
      const a = document.activeElement; if (!a) return null;
      const b = a.getBoundingClientRect();
      const inLegend = !!a.closest('.legend'); const inByline = !!a.closest('.byline');
      return { tag: a.tagName, cls: String(a.className).slice(0,50), t: (a.innerText||a.getAttribute('aria-label')||'').slice(0,60).replace(/\n/g,' '),
        inLegend, inByline, y: Math.round(b.y), h: Math.round(b.height), w: Math.round(b.width),
        offscreen: b.height === 0 || b.width === 0 };
    });
    seq.push(d);
    if (d && (d.inLegend || d.inByline)) { /* keep going */ }
  }
  log('TAB SEQUENCE:\n' + seq.map((d,i)=>i+': '+JSON.stringify(d)).join('\n'));
  await shot('kbd-focus');
};
