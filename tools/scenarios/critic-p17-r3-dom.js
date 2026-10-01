/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const dump = async (label) => {
    const r = await page.evaluate(() => {
      const lg = document.querySelector('.legend');
      if (!lg) return 'no legend';
      const walk = (el, d) => {
        if (d > 4) return '';
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        let s = '  '.repeat(d) + el.tagName + '.' + String(el.className).slice(0,60) +
          ` [y=${Math.round(b.y)} h=${Math.round(b.height)} sh=${el.scrollHeight} ch=${el.clientHeight} st=${el.scrollTop} ovf=${cs.overflowY} disp=${cs.display}]` + '\n';
        for (const c of el.children) s += walk(c, d+1);
        return s;
      };
      return walk(lg, 0);
    });
    log('### ' + label + '\n' + r);
  };
  await dump('default');
  await page.locator('text=Three things wrong with this rendering').first().click();
  await page.waitForTimeout(800);
  await dump('crit-open');
};
