/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const readout = async () => page.evaluate(() => {
    const c = document.querySelector('.map__plate');
    const panel = document.querySelector('.mapdef, .map-def, [class*=def]');
    return { aria: c && c.getAttribute('aria-label'), proj: document.querySelector('.map')?.dataset.projection, def: document.querySelector('.map')?.dataset.definition };
  });
  log('init', JSON.stringify(await readout()));
  await shot('def1-claimed');
  for (const k of ['2','3','4','1']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(900);
    log('after key '+k, JSON.stringify(await readout()));
    await shot('def-'+k);
  }
  // projection toggle
  const toggles = await page.evaluate(() => [...document.querySelectorAll('button,[role=button]')].map(b=>({t:(b.innerText||'').trim().slice(0,40), cls:b.className, al:b.getAttribute('aria-label')})).filter(x=>/proj|mercator|equal|globe/i.test(x.t+x.cls+(x.al||''))));
  log('projection controls:', JSON.stringify(toggles));
};
