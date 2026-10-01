/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1800);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1800);
  const tree = await page.evaluate(() => {
    const out = [];
    const walk = (el, d) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (d > 6) return;
      out.push('  '.repeat(d) + `${el.tagName.toLowerCase()}.${el.className.toString().split(/\s+/).slice(0,3).join('.')} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}]` + (el.scrollHeight > el.clientHeight+4 ? ` SCROLLS(${el.clientHeight}/${el.scrollHeight})` : ''));
      [...el.children].forEach(c => walk(c, d+1));
    };
    walk(document.body, 0);
    return out.join('\n');
  });
  log(tree);
};
