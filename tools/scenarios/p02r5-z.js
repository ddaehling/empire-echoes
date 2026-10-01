/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  log(JSON.stringify(await page.evaluate(() => {
    const b = document.querySelector('.byline');
    const m = document.querySelector('.map');
    const chain = (n) => { const o = []; while (n && n !== document.body) { const cs = getComputedStyle(n); o.push({ cls: String(n.className).slice(0,40), tag: n.tagName, pos: cs.position, z: cs.zIndex, mount: n.getAttribute && n.getAttribute('data-mount') }); n = n.parentElement; } return o; };
    return { byline: b ? { rect: b.getBoundingClientRect().toJSON(), chain: chain(b) } : null,
             map: m ? { rect: m.getBoundingClientRect().toJSON(), chain: chain(m), cls: m.className } : null };
  }), null, 1));
};
