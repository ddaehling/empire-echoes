/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w9-slice`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the rail sheet's scroller ends where its foot
 * begins. Nothing a student is reading may slide under the sheet's own footer,
 * on any route, at any step this suite samples — the round-9 phone finding,
 * turned from one hardcoded address into a rule.
 *
 * ROUND 2 OF WAVE 9 REWROTE THIS FILE. It used to open exactly one address —
 * `#tour=thirty&step=20`, on a route that has not been the default since wave 8
 * — dump a JSON blob of rectangles and return. No assertion, no failure path,
 * and step 20 of `thirty` is a different surface on every other route, so the
 * measurement did not transfer. The leak it was written for is a LAYOUT rule
 * and layout rules hold everywhere or they are not rules: it is now measured on
 * every route the app publishes, at the surfaces `lib/routes.js::sample` picks
 * BY KIND — the opening beat, a second beat, the gate, a recall, a middle beat
 * and the ending — which is the set of surfaces this leak can appear on.
 */
const routes = require('./lib/routes.js');

module.exports = async ({ page, shot, log }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);
  await page.goto(url, { waitUntil: 'load' });
  const ids = await routes.chosen(page);

  let shot1 = false;
  for (const id of ids) {
    const steps = routes.sample(await routes.stepsOf(page, id));
    for (const st of steps) {
      await routes.open(page, url, id, st.step, 1800);
      const m = await page.evaluate(() => {
        const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
          return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; };
        const body = document.querySelector('.cx-sheet__body');
        const foot = document.querySelector('.cx-sheet__foot');
        return {
          body: body ? Object.assign(box(body), { sh: body.scrollHeight, ch: body.clientHeight }) : null,
          foot: box(foot),
          innerH: window.innerHeight,
          docScrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      const at = id + ' step ' + String(st.step).padStart(2) + ' ' + String(st.kind).padEnd(7);
      if (!m.body) { log(at + ' — no rail sheet on this surface'); continue; }
      if (!shot1) { await shot('slice-' + id + '-' + st.step); shot1 = true; }

      /* S1 — the scroller ends where the foot begins. One pixel of overlap is
         a line of prose sliding under a solid bar. */
      if (m.foot) {
        C.t(at + ' S1 the scroller ends where the foot begins', m.body.bottom <= m.foot.top + 1,
          'body bottom ' + m.body.bottom + ' vs foot top ' + m.foot.top,
          'no overlap');
      }
      /* S2 — and neither of them hangs off the bottom of the window. */
      C.t(at + ' S2 the sheet is inside the window',
        (m.foot ? m.foot.bottom : m.body.bottom) <= m.innerH + 1,
        (m.foot ? 'foot bottom ' + m.foot.bottom : 'body bottom ' + m.body.bottom) + ' vs ' + m.innerH,
        'nothing below the fold that is not scrollable to');
      /* S3 — and nothing pushes the page sideways. */
      C.t(at + ' S3 no horizontal scroll', m.docScrollX <= 0, m.docScrollX, '<= 0');
    }
  }
  C.finish('the rail sheet slice — nothing under the foot, on any route');
};
