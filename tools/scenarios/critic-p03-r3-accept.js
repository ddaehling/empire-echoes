/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const tl = 'footer, .tl, [class*="tl-"]';
  // AT2: scrub to 1820
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(900);
  await shot('year1820');
  const lit = await page.evaluate(() => {
    const bands = [...document.querySelectorAll('[class*="spine"] [class*="band"], .tl-spine__band, [class*="phase"]')];
    return bands.map(b => ({ cls: b.className, txt: (b.innerText||'').slice(0,80), aria: b.getAttribute('aria-current'), lit: b.className.includes('is-lit')||b.className.includes('--lit')||b.getAttribute('data-lit') }));
  });
  log('bands@1820:', JSON.stringify(lit).slice(0,2500));
  const cap = await page.evaluate(() => {
    const c = document.querySelector('.tl-spine__caption');
    return c ? c.innerText : null;
  });
  log('caption@1820:', cap);

  // AT3: shift+right from 1856
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1856));
  await page.waitForTimeout(500);
  const expect = await page.evaluate(() => window.BEA.data.nextChangeYear(1856, 1));
  // focus the scrubber
  const sc = await page.$('[role="slider"], input[type="range"], .tl-scrub');
  log('scrubber el:', sc ? await sc.evaluate(n=>n.tagName+'.'+n.className+' role='+n.getAttribute('role')) : 'NONE');
  if (sc) await sc.focus();
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(600);
  const got = await page.evaluate(() => window.BEA.store.getState().year);
  log('AT3 nextChangeYear(1856,1)=', expect, ' after Shift+Right year=', got);

  // arrows
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  log('after ArrowRight:', await page.evaluate(() => window.BEA.store.getState().year));
  await page.keyboard.press('Home');
  await page.waitForTimeout(300);
  log('after Home:', await page.evaluate(() => window.BEA.store.getState().year));
  await page.keyboard.press('End');
  await page.waitForTimeout(300);
  log('after End:', await page.evaluate(() => window.BEA.store.getState().year));
  log('bounds:', JSON.stringify(await page.evaluate(() => window.BEA.data.bounds)));
};
