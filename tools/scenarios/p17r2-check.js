/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForFunction(() => window.BEA && window.BEA.legend, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(1200);

  // open the counting notes
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('.legend__det')].find(x => /HOW THESE TOTALS/i.test(x.innerText));
    if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); }
  });
  await page.waitForTimeout(300);
  log('NOTES ' + JSON.stringify(await page.evaluate(() => {
    const d = [...document.querySelectorAll('.legend__det')].find(x => /HOW THESE TOTALS/i.test(x.innerText));
    return d ? d.innerText : null;
  })));
  log('TIMELINE ' + JSON.stringify(await page.evaluate(() => (document.querySelector('.app__time')||{}).innerText||'').then?0:0).slice(0,1));
  log('TL ' + await page.evaluate(() => ((document.querySelector('.app__time')||{}).innerText||'').split('\n').slice(0,4).join(' | ')));

  // criticism figures self-consistency
  await page.evaluate(() => { window.__map.setProjection('mercator'); });
  await page.waitForTimeout(900);
  await page.click('.byline__crit'); await page.waitForTimeout(400);
  log('CRIT ' + await page.evaluate(() => document.querySelector('#legend-criticism').innerText.replace(/\n/g,' ')));
  await shot('crit1913');
  log('ERRORS ' + JSON.stringify(errs));
};
