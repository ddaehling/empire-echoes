/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 r3 — phone. The legend starts folded; expand it, then open the criticism. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForTimeout(2600);
  const probe = () => {
    const st = document.querySelector('.app__stage').getBoundingClientRect();
    const by = document.querySelector('#legend-byline');
    const lg = document.querySelector('.stage__legend');
    const b = by && by.getBoundingClientRect(), l = lg && lg.getBoundingClientRect();
    return {
      stage: { y: Math.round(st.y), h: Math.round(st.height) },
      byline: b && { y: Math.round(b.y), h: Math.round(b.height) },
      legend: l && { y: Math.round(l.y), h: Math.round(l.height) },
      overlap: b && l ? b.bottom > l.top + 1 : null,
      pastStage: l ? l.bottom > st.bottom + 1 : null,
      clipped: (() => { const p = document.querySelector('#legend-criticism');
        if (!p || p.hidden) return null;
        const pr = p.getBoundingClientRect();
        const host = document.querySelector('#legend-byline').getBoundingClientRect();
        return { critH: Math.round(pr.height), hostH: Math.round(host.height),
                 scrolls: p.scrollHeight > p.clientHeight + 2 || document.querySelector('#legend-byline').scrollHeight > document.querySelector('#legend-byline').clientHeight + 2 }; })(),
      keySwatch: (() => { const bd = document.querySelector('#legend-body'); if (!bd) return 0;
        const panel = document.querySelector('.legend'); if (!panel) return 0;
        const br = bd.getBoundingClientRect(), pr = panel.getBoundingClientRect();
        const top = Math.max(br.top, pr.top), bot = Math.min(br.bottom, pr.bottom);
        let n = 0; for (const s of bd.querySelectorAll('.legend__row .sym')) { const r = s.getBoundingClientRect();
          if (r.height > 4 && r.top >= top - 2 && r.bottom <= bot + 2 && r.top >= 0 && r.bottom <= innerHeight) n++; }
        return n; })(),
      text: (document.querySelector('.stage__legend') || {}).innerText,
    };
  };
  log('folded:', JSON.stringify(await page.evaluate(probe)));
  await shot('01-mobile-folded');
  const t = await page.$('.legend__toggle');
  if (t) { await t.click(); await page.waitForTimeout(600); }
  log('expanded:', JSON.stringify(await page.evaluate(probe)));
  await shot('02-mobile-expanded');
  await page.click('.byline__crit');
  await page.waitForTimeout(600);
  log('crit:', JSON.stringify(await page.evaluate(probe)));
  await shot('03-mobile-crit');
  log('errors:', errs.length ? JSON.stringify(errs.slice(0, 8)) : 'none');
};
