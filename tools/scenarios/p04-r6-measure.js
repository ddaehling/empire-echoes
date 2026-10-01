/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 6 — the editorial measurement.
 * Selects three territories and measures the dossier as a reader meets it:
 * how tall its scroll is, how many screenfuls that is, how many characters,
 * how many controls, how many type sizes, and where the strongest assets sit.
 */
const PLACES = ['bengal-presidency', 'kenya', 'british-india'];

module.exports = async ({ page, shot, log }) => {
  const out = {};
  for (const id of PLACES) {
    await page.goto('http://localhost:8777/app/#year=1900&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const m = await page.evaluate(() => {
      const aside = document.querySelector('.app__dossier');
      const app = document.querySelector('.app');
      if (!aside) return { missing: true };
      const r = aside.getBoundingClientRect();
      const art = aside.querySelector('.dossier');
      const txt = (aside.innerText || '');
      const ctrls = [...aside.querySelectorAll('button,a[href],summary,input,select,[tabindex]:not([tabindex="-1"])')]
        .filter((n) => n.offsetParent !== null || n.getClientRects().length);
      const sizes = new Set();
      for (const n of aside.querySelectorAll('*')) {
        if (!n.textContent || !n.textContent.trim()) continue;
        if (!n.getClientRects().length) continue;
        sizes.add(getComputedStyle(n).fontSize);
      }
      const depth = (sel) => {
        const n = aside.querySelector(sel);
        if (!n) return null;
        const b = n.getBoundingClientRect();
        return {
          fromTop: Math.round(b.top - r.top + aside.scrollTop),
          pct: Math.round(((b.top - r.top + aside.scrollTop) / Math.max(1, aside.scrollHeight)) * 100),
        };
      };
      const foldBottom = (() => {
        const f = aside.querySelector('.dsr__fold');
        return f ? Math.round(f.getBoundingClientRect().bottom) : null;
      })();
      return {
        stage: app ? app.dataset.stage : null,
        sheet: app ? app.dataset.sheet : null,
        rail: { w: Math.round(r.width), h: Math.round(r.height) },
        scrollH: aside.scrollHeight,
        screenfuls: +(aside.scrollHeight / Math.max(1, r.height)).toFixed(1),
        chars: txt.length,
        words: txt.trim().split(/\s+/).filter(Boolean).length,
        controls: ctrls.length,
        fontSizes: [...sizes].sort(),
        nFontSizes: sizes.size,
        sections: aside.querySelectorAll('.dsr__contentsbtn').length,
        tocLabel: (aside.querySelector('.dsr__toc') || {}).innerText || null,
        cxClasses: {
          panel: aside.querySelectorAll('.cx-panel').length,
          ask: aside.querySelectorAll('.cx-ask').length,
          more: aside.querySelectorAll('.cx-more').length,
          fig: aside.querySelectorAll('.cx-fig').length,
          src: aside.querySelectorAll('.cx-src').length,
          note: aside.querySelectorAll('.cx-note').length,
        },
        depths: {
          why: depth('#dsr-why'),
          think: depth('#dsr-think'),
          testimony: depth('#dsr-testimony'),
          actors: depth('#dsr-actors'),
          contents: depth('#dsr-contents'),
        },
        foldBottom,
        railBottom: Math.round(r.bottom),
        lede: (document.querySelector('.cx-lede__say') || {}).innerText || null,
        ledeMark: (document.querySelector('.cx-lede__mark') || {}).innerText || null,
      };
    });
    out[id] = m;
    log(id + ' :: ' + JSON.stringify(m));
  }
  await shot('dossier');
};
