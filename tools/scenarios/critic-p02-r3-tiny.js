/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3000);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(500); }
  const want = ['gibraltar','malta','ascension','barbados','aden','singapore','hong-kong'];
  const info = await page.evaluate((want) => {
    const out = [];
    const opts = [...document.querySelectorAll('.map__targets [role="option"]')];
    out.push({ total: opts.length, plateW: document.querySelector('.map__plate')?.clientWidth });
    for (const w of want) {
      const hit = opts.filter(o => (o.getAttribute('data-unit')||'').includes(w));
      for (const h of hit.slice(0,2)) {
        const r = h.getBoundingClientRect();
        const cs = getComputedStyle(h);
        out.push({ unit: h.getAttribute('data-unit'), w: Math.round(r.width), h: Math.round(r.height),
          x: Math.round(r.x), y: Math.round(r.y), tabindex: h.tabIndex,
          label: (h.getAttribute('aria-label')||'').slice(0,200),
          pe: cs.pointerEvents, vis: cs.visibility, disp: cs.display });
      }
      if (!hit.length) out.push({ unit: w, MISSING: true });
    }
    return out;
  }, want);
  log(JSON.stringify(info, null, 1));
  // click test: elementFromPoint at each centre
  const clickTest = await page.evaluate((want) => {
    const res = [];
    for (const w of want) {
      const o = [...document.querySelectorAll('.map__targets [role="option"]')].find(e=>(e.getAttribute('data-unit')||'').includes(w));
      if (!o) { res.push([w,'MISSING']); continue; }
      const r = o.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
      res.push([w, top ? (top.getAttribute('data-unit') || top.className || top.tagName) : 'null']);
    }
    return res;
  }, want);
  log('elementFromPoint:', JSON.stringify(clickTest));
  log('ERR', JSON.stringify(errs));
};
