/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2600);
  await shot('01');
  const box = await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
      return { y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), ch: e.clientHeight, sh: e.scrollHeight }; };
    const st = document.querySelector('.app__stage').getBoundingClientRect();
    const l = g('.stage__legend') || { w: 0, h: 0 }, b = g('#legend-byline') || { w: 0, h: 0 };
    return { stage: { w: Math.round(st.width), h: Math.round(st.height) },
      legend: g('.legend') || g('.legend--compact'), slot: l, byline: b,
      body: g('.legend__bodywrap'), marks: g('.legend__marksfix'),
      coverPct: Math.round(((l.w * l.h) + (b.w * b.h)) / (st.width * st.height) * 1000) / 10,
      text: (document.querySelector('.stage__legend') || {}).innerText };
  });
  log(JSON.stringify(box, null, 1));
  // open the criticism too
  const has = await page.evaluate(() => !!document.querySelector('.byline__crit'));
  if (has) { await page.click('.byline__crit'); await page.waitForTimeout(500); await shot('02-crit'); }
  log('ERRORS ' + JSON.stringify(errs));
};
