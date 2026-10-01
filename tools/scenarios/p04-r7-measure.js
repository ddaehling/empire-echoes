/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 7 — the dossier measured as a reader meets it, at one viewport.
 * Run once per contract viewport. Reports the rail's geometry, the scroll it
 * asks for, the words and controls above the fold, the type registers, the
 * document-scroll rule (B4), and whether the fold's four answers clear the
 * panel's bottom edge. Also opens every sheet and reads the testimony tally,
 * so the editorial change is measured and not asserted.
 */
const PLACES = ['kenya', 'bengal-presidency', 'nigeria', 'canada'];

module.exports = async ({ page, shot, log }) => {
  const out = [];
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
      const bel = (sel) => {
        const n = aside.querySelector(sel);
        if (!n) return null;
        const b = n.getBoundingClientRect();
        return Math.round(b.bottom - r.top);
      };
      const promo = aside.querySelector('[data-block="actors-promo"] .dsr__promoline');
      const tz = aside.querySelector('[data-block="testimony-promo"]');
      /* Does any part of the panel stand on the plate? (rule B5, from this
         piece's side: the rail compresses, it never covers.) */
      const map = document.querySelector('.stage__map');
      const mr = map ? map.getBoundingClientRect() : null;
      const overlap = mr ? Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left))
        * Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top)) : 0;
      return {
        rail: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) },
        scrollH: aside.scrollHeight,
        screenfuls: Math.round((aside.scrollHeight / r.height) * 10) / 10,
        chars: txt.length,
        words: txt.trim().split(/\s+/).filter(Boolean).length,
        controls: ctrls.length,
        sizes: [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b)),
        foldBottom: bel('.dsr__fold'),
        railH: Math.round(r.height),
        docScroll: document.documentElement.scrollHeight - innerHeight,
        mapOverlapPx2: Math.round(overlap),
        top6: promo ? promo.textContent : null,
        testEyebrow: tz ? (tz.querySelector('.dsr__eyebrow') || {}).textContent : null,
        testAuthors: tz ? (tz.querySelector('.dsr__promoline') || {}).textContent : null,
        testSay: tz ? (tz.querySelector('.dsr__promosay') || {}).textContent : null,
      };
    });
    /* the testimony sheet: the split, counted */
    const tally = await page.evaluate(async () => {
      const b = document.querySelector('[data-act="sheet"][data-sheet="testimony"]');
      if (!b) return null;
      b.click();
      await new Promise((r) => setTimeout(r, 350));
      const t = document.querySelector('.cx-sheet__body .dsr__testtally');
      const box = document.querySelector('.cx-sheet__body');
      const rr = box ? box.getBoundingClientRect() : null;
      return {
        tally: t ? t.textContent : null,
        sheet: rr ? { w: Math.round(rr.width), h: Math.round(rr.height) } : null,
        first: (document.querySelector('.cx-sheet__body .src__speaker') || {}).textContent || null,
      };
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    m.sheet = tally;
    log(id + ' :: ' + JSON.stringify(m));
    out.push(m);
  }
  await page.goto('http://localhost:8777/app/#year=1954&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  await shot('kenya-fold');
  await page.evaluate(() => document.querySelector('[data-act="sheet"][data-sheet="testimony"]').click());
  await page.waitForTimeout(500);
  await shot('kenya-testimony');
};
