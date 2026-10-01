/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 8 — the dossier measured at one viewport, as a reader meets it.
 *
 * Run once per contract viewport (and again with --dark / --reduced). Reports
 * the rail's geometry, the scroll it asks for, the words and controls above
 * the fold, the type registers, the document-scroll rule (B4), whether the
 * fold's four answers clear the panel's bottom edge, how much live map is left
 * above the panel when it is a bottom sheet, and — round 4's charge — whether
 * any sentence in this panel describes a layout the reader is not in.
 */
const PLACES = ['kenya', 'bengal-presidency', 'nigeria', 'canada'];

module.exports = async ({ page, shot, log }) => {
  for (const id of PLACES) {
    await page.goto('http://localhost:8777/app/#year=1900&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(2400);
    const m = await page.evaluate(() => {
      const aside = document.querySelector('.app__dossier');
      if (!aside) return { missing: true };
      const r = aside.getBoundingClientRect();
      const txt = aside.innerText || '';
      const ctrls = [...aside.querySelectorAll('button,a[href],summary,input,select,[tabindex]:not([tabindex="-1"])')]
        .filter((n) => n.getClientRects().length);
      const sizes = new Set();
      for (const n of aside.querySelectorAll('*')) {
        if (!n.textContent || !n.textContent.trim()) continue;
        if (!n.getClientRects().length) continue;
        sizes.add(getComputedStyle(n).fontSize);
      }
      const fold = aside.querySelector('.dsr__fold');
      const map = document.querySelector('.stage__map');
      const mr = map ? map.getBoundingClientRect() : null;
      const overlap = mr ? Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left))
        * Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top)) : 0;
      /* a bottom sheet: how much drawn map is still uncovered above it */
      const liveMap = mr ? Math.round(Math.max(0, Math.min(r.top, mr.bottom) - mr.top)) : null;
      /* Any sentence that describes a layout. */
      const note = aside.querySelector('.dsr__indexk');
      /* Red links inside this panel, at first paint. */
      const reds = ctrls.filter((n) => {
        const c = getComputedStyle(n).color;
        const mm = c.match(/\d+/g);
        return mm && +mm[0] > 110 && +mm[0] - +mm[1] > 40 && +mm[0] - +mm[2] > 40;
      }).length;
      return {
        rail: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        scrollH: aside.scrollHeight,
        screenfuls: Math.round((aside.scrollHeight / r.height) * 10) / 10,
        chars: txt.length,
        words: txt.trim().split(/\s+/).filter(Boolean).length,
        controls: ctrls.length,
        redControls: reds,
        sizes: [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b)),
        foldBottom: fold ? Math.round(fold.getBoundingClientRect().bottom - r.top) : null,
        foldFits: fold ? fold.getBoundingClientRect().bottom <= r.bottom + 1 : null,
        docScroll: document.documentElement.scrollHeight - innerHeight,
        mapOverlapPx2: Math.round(overlap),
        liveMapAbove: liveMap,
        isSheet: getComputedStyle(aside).position === 'fixed',
        indexNote: note ? note.textContent.trim() : null,
      };
    });
    log(id + ' :: ' + JSON.stringify(m));
  }
  await page.goto('http://localhost:8777/app/#year=1954&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  await shot('kenya-fold');
  await page.evaluate(() => {
    const a = document.querySelector('.app__dossier');
    a.scrollTop = a.scrollHeight;
  });
  await page.waitForTimeout(300);
  await shot('kenya-bottom');
};
