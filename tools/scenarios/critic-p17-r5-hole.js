/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1957', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  await page.keyboard.press('h'); await page.waitForTimeout(1800);
  const openPlate = async () => {
    if (!await page.evaluate(() => !!document.querySelector('.lplate__crit'))) {
      const b = page.locator('button', { hasText: /Open the full key/i }).first();
      if (await b.count()) await b.click(); else await page.getByText(/Three things wrong/i).first().click();
      await page.waitForTimeout(1200);
    }
  };
  const o1 = await page.evaluate(() => ({
    byline: (document.querySelector('[class*="byline"]')||{}).innerText?.replace(/\n+/g,' | '),
    legend: (document.querySelector('[class*="legend__panel"], .legend')||{}).innerText?.replace(/\n+/g,' | ').slice(0,1200),
  }));
  log('SILENCE-1957 BYLINE: '+o1.byline);
  log('SILENCE-1957 LEGEND: '+o1.legend);
  await shot('sil1957');
  await openPlate();
  const c = await page.evaluate(() => (document.querySelector('.lplate__crit')||{}).innerText?.replace(/\n+/g,' | '));
  log('CRIT: '+c);
  // hunt the hole legend wording
  const holeWords = await page.evaluate(() => {
    const hits=[]; document.querySelectorAll('*').forEach(e=>{ if(e.children.length===0){const t=(e.textContent||'').trim(); if(/no record|no data|bare paper|destroyed|withheld|survive/i.test(t)) hits.push(t.slice(0,220));}});
    return [...new Set(hits)].slice(0,25);
  });
  log('HOLEWORDS: '+JSON.stringify(holeWords,null,1));
  await shot('sil1957-plate');
};
