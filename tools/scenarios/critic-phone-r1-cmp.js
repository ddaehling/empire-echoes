/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.goto(page.url().split('#')[0] + '#year=1765&tour=thirty&step=9&filter=stage:working,pressure:off');
  await page.waitForTimeout(2200);
  await shot('beat9');
  // open Tools -> Compare
  const more = page.locator('.bar__more').first();
  if (await more.count()) { await more.click(); await page.waitForTimeout(600); await shot('tools'); }
  const c = page.locator('.cmp__launch').first();
  if (await c.count() && await c.isVisible()) { await c.click(); await page.waitForTimeout(1800); await shot('compare'); }
  else log('compare not visible after Tools');
  const st = await page.evaluate(() => {
    const q=s=>document.querySelector(s);
    return {
      hash: location.hash,
      lede: q('.cx-lede__mark')?.innerText.trim(),
      tl: q('.tl__now')?.innerText.replace(/\n/g,' ').trim().slice(0,60),
      surfaces: [...document.querySelectorAll('.app__sheet, .app__dossier, .cmp, .app__panel')].filter(e=>e.getBoundingClientRect().height>10).map(e=>e.className.toString().slice(0,30)),
      cmpYears: [...document.querySelectorAll('.cmp [class*=year], .cmp__year')].map(e=>e.innerText.trim()).slice(0,8),
      body: document.body.innerText.slice(0,1200)
    };
  });
  log(JSON.stringify(st,null,1));
};
