/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-parts — where the retrieval card's height goes, on a phone. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [16, 18, 22]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + s, { waitUntil: 'load' });
    await page.waitForTimeout(2400);
    const m = await page.evaluate(() => {
      const qz = document.querySelector('.qz');
      if (!qz) return null;
      const out = [];
      const walk = (n, d) => {
        for (const c of n.children) {
          const r = c.getBoundingClientRect();
          if (r.height < 1) continue;
          out.push({ d, cls: String(c.className).slice(0, 42), tag: c.tagName, h: Math.round(r.height), txt: (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 52) });
          if (d < 1) walk(c, d + 1);
        }
      };
      walk(qz, 0);
      const body = document.querySelector('.cx-sheet__body');
      return { total: Math.round(qz.getBoundingClientRect().height), window: body ? body.clientHeight : null, parts: out };
    });
    if (!m) { log('step ' + s + ': no card'); continue; }
    log('--- step ' + s + ': card ' + m.total + 'px in a ' + m.window + 'px window');
    for (const p of m.parts) log('   ' + '  '.repeat(p.d) + String(p.h).padStart(4) + 'px  ' + p.cls + '  “' + p.txt + '”');
  }
};
