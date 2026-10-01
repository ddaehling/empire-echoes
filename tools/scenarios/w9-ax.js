/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w9-ax`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: BRIEF, "accessibility is part of correctness".
 * Every actor eyebrow — the small capitals that name a person on the beat that
 * introduces them — clears WCAG AA (4.5:1) against the well it actually sits
 * on, on every route, in light and in whatever theme the harness is given.
 *
 * ROUND 2 OF WAVE 9 REWROTE THIS FILE. It used to measure exactly one element
 * at `#tour=period&step=3` — a retired route — and print "PASS AA" or "FAIL AA"
 * into the log without asserting anything, so the process exited 0 either way
 * and `tools/acceptance.js` called it green. It also measured whichever
 * eyebrow happened to be first in the document; a contrast rule that checks one
 * of eleven is not a contrast rule.
 */
const routes = require('./lib/routes.js');

/* sRGB relative luminance, WCAG 2.x. */
function lum(c) {
  const p = String(c).match(/[\d.]+/g);
  if (!p || p.length < 3) return null;
  const [r, g, b] = p.slice(0, 3).map(Number).map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (fg, bg) => {
  const a = lum(fg); const b = lum(bg);
  if (a == null || b == null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

module.exports = async ({ page, shot, log }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);
  await page.goto(url, { waitUntil: 'load' });
  const ids = await routes.chosen(page);

  let measured = 0;
  let shotDone = false;
  for (const id of ids) {
    const steps = await routes.stepsOf(page, id);
    for (const st of steps.filter((s) => s.kind === 'beat')) {
      await routes.open(page, url, id, st.step, 1400);
      const found = await page.evaluate(() => {
        const out = [];
        for (const e of document.querySelectorAll('.tr-actor__eyebrow')) {
          if (!e.offsetParent) continue;
          const s = getComputedStyle(e);
          /* THE WELL IT ACTUALLY SITS ON, not the nearest transparent parent.
             Walk up until something paints. */
          let n = e; let bg = 'rgba(0, 0, 0, 0)';
          while (n && n !== document.documentElement) {
            const c = getComputedStyle(n).backgroundColor;
            if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { bg = c; break; }
            n = n.parentElement;
          }
          out.push({ fg: s.color, bg, size: parseFloat(s.fontSize), weight: s.fontWeight,
            text: (e.textContent || '').trim().slice(0, 40) });
        }
        return out;
      });
      for (const f of found) {
        measured++;
        const r = ratio(f.fg, f.bg);
        /* WCAG large text is >= 18.66px bold or >= 24px. An eyebrow is neither
           in this app, so the bar is 4.5 and it is stated rather than assumed. */
        const large = f.size >= 24 || (f.size >= 18.66 && Number(f.weight) >= 700);
        const want = large ? 3 : 4.5;
        C.t(id + ' step ' + st.step + ' AX ' + JSON.stringify(f.text),
          r != null && r >= want,
          (r == null ? 'unreadable colours ' + f.fg + ' on ' + f.bg : r.toFixed(2) + ':1')
          + ' at ' + f.size + 'px',
          'WCAG AA, ' + want + ':1');
        if (!shotDone) { await shot('actor-' + id + '-' + st.step); shotDone = true; }
      }
    }
  }
  C.t('AX0 there were actor eyebrows to measure', measured > 0, measured + ' measured',
    'at least one, or this check is asserting nothing');
  C.finish('actor eyebrow contrast, on every route');
};
