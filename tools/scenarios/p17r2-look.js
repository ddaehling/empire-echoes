/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'slice').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2800);
  await shot('landing');

  const m = await page.evaluate(() => {
    const box = (sel) => { const e = document.querySelector(sel); if (!e) return null;
      const r = e.getBoundingClientRect();
      return { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), ch: e.clientHeight, sh: e.scrollHeight }; };
    return {
      legend: box('.legend'), head: box('.legend__head'), body: box('.legend__bodywrap'),
      marksfix: box('.legend__marksfix'),
      byline: box('#legend-byline'), three: box('.byline__three'),
      bylineText: (document.querySelector('#legend-byline')||{}).innerText,
      marksText: (document.querySelector('.legend__marksfix')||{}).innerText,
      headText: (document.querySelector('.legend__head')||{}).innerText,
      bodyTop: (document.querySelector('.legend__bodywrap')||{}).innerText.slice(0,600),
      fields: [...document.querySelectorAll('#legend-byline [data-field]')].map(e=>e.dataset.field+'='+e.textContent),
    };
  });
  log(JSON.stringify(m, null, 1));
  log('ERRORS ' + JSON.stringify(errs));
};
