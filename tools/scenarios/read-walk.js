/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  const TOUR = process.env.TOUR || 'thirty';
  const out = [];
  for (let s = 1; s <= 26; s++) {
    await page.goto('http://localhost:8777/app/#tour=' + TOUR + '&step=' + s, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const p = document.querySelector('.tr-panel');
      const sc = document.querySelector('.tr-panel__scroll');
      const map = document.querySelector('.stage__map');
      const st = window.BEA && window.BEA.store && window.BEA.store.getState();
      const at = st && st.activeTour;
      const head = (document.querySelector('.tr-panel__head') || {}).innerText || '';
      const b = sc ? sc.getBoundingClientRect() : null;
      const mb = map ? map.getBoundingClientRect() : null;
      return {
        step: at && (at.step ?? at.index),
        beat: (p && (p.getAttribute('data-beat') || p.getAttribute('data-id'))) || null,
        kind: (p && (p.getAttribute('data-kind') || p.getAttribute('data-beat'))) || null,
        cls: p ? p.className : null,
        head: head.replace(/\s+/g,' ').slice(0, 70),
        scrollH: b ? Math.round(b.height) : null, content: sc ? sc.scrollHeight : null,
        mapH: mb ? Math.round(mb.height) : null,
        total: at && (at.total || at.length),
      };
    });
    if (!r.beat && !r.head) { out.push(s + ' <none>'); if (s > 20) break; continue; }
    out.push(s + '  beat=' + r.beat + ' kind=' + r.kind + '  panel ' + r.scrollH + '/' + r.content + '  map ' + r.mapH + '  | ' + r.head);
  }
  log(out.join('\n'));
};
