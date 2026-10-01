/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Failed to execute 'getComputedStyle' on 'Window': parameter 1 is.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const b = document.querySelector('.legend__open');
    const cs = getComputedStyle(b);
    const kids = [...b.children].map(n => { const k=getComputedStyle(n); const r=n.getBoundingClientRect();
      return { c:n.className, h:Math.round(r.height), w:Math.round(r.width), fs:k.fontSize, lh:k.lineHeight, ws:k.whiteSpace, t:n.textContent.slice(0,60) }; });
    const fig = document.querySelector('.legend__figures');
    const fcs = getComputedStyle(fig);
    return { open: { dir: cs.flexDirection, disp: cs.display, h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width), pad: cs.padding, ai: cs.alignItems, fw: cs.flexWrap }, kids,
      fig: { h: Math.round(fig.getBoundingClientRect().height), fs: fcs.fontSize, lh: fcs.lineHeight, t: fig.innerText } };
  });
  log(JSON.stringify(r, null, 1));
};
