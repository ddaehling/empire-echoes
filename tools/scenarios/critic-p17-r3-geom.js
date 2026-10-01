/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const geom = async (label) => {
    const r = await page.evaluate(() => {
      const out = [];
      const sel = ['.legend', '.legend__scroll', '.legend__head', '.byline', '.byline__crit', '.stage-note', '.stage'];
      sel.forEach(s => document.querySelectorAll(s).forEach(el => {
        const b = el.getBoundingClientRect();
        out.push({ s, cls: String(el.className).slice(0,80), x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom),
          sh: el.scrollHeight, ch: el.clientHeight, st: el.scrollTop, ovf: getComputedStyle(el).overflowY });
      }));
      out.push({ s: 'VIEWPORT', h: innerHeight, w: innerWidth });
      return out;
    });
    log('### ' + label + '\n' + r.map(o => JSON.stringify(o)).join('\n'));
  };
  await geom('default');
  await page.locator('text=Three things wrong with this rendering').first().click();
  await page.waitForTimeout(700);
  await geom('crit-open');
  await shot('crit-open-full');
  // is criticism 2 and 3 visible?
  const vis = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.byline__crit li, .byline li, [class*="crit"] li')];
    return items.map(li => { const b = li.getBoundingClientRect(); 
      const mid = document.elementFromPoint(Math.round(b.x+10), Math.round(b.y+10));
      return { t: li.innerText.slice(0,60), y: Math.round(b.y), h: Math.round(b.height), topEl: mid ? String(mid.className).slice(0,60) : null };
    });
  });
  log('CRIT ITEM VISIBILITY: ' + JSON.stringify(vis, null, 1));
};
