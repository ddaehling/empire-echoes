/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b2-anatomy.js — what actually fills the beat scroller, block by block. */
const STEP = process.env.STEP || '11';
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=' + (process.env.ROUTE || 'core') + '&step=' + STEP, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  const m = await page.evaluate(() => {
    const sc = document.querySelector('.tr-panel__scroll');
    if (!sc) return { err: 'no scroller' };
    const kids = [];
    const walk = (el, d) => {
      for (const c of el.children) {
        const r = c.getBoundingClientRect();
        kids.push({ d, cls: String(c.className).split(/\s+/)[0], h: Math.round(r.height), txt: (c.textContent || '').trim().slice(0, 34) });
        if (d < 2 && r.height > 160) walk(c, d + 1);
      }
    };
    walk(sc, 0);
    return { win: sc.clientHeight, content: sc.scrollHeight, kids };
  });
  log('STEP ' + STEP + ' window ' + m.win + ' content ' + m.content);
  for (const k of (m.kids || [])) log('  '.repeat(k.d) + String(k.h).padStart(5) + 'px  ' + k.cls.padEnd(22) + ' ' + k.txt);
};
