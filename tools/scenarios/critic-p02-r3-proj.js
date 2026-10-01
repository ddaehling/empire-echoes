/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3200);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(400); }
  const canadaBox = async () => await page.evaluate(() => {
    const o = [...document.querySelectorAll('.map__targets [role="option"]')].find(e=>e.getAttribute('data-unit')==='ca-nunavut' || e.getAttribute('data-unit')==='ca-ontario');
    if (!o) return null; const r = o.getBoundingClientRect();
    return { unit:o.getAttribute('data-unit'), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) };
  });
  log('before:', JSON.stringify(await canadaBox()));
  log('proj btn:', await page.evaluate(()=>document.querySelector('.map__proj')?.innerText.replace(/\n/g,' | ')));
  await shot('proj-A');
  await page.keyboard.press('p');
  await page.waitForTimeout(2500);
  log('after:', JSON.stringify(await canadaBox()));
  log('proj btn:', await page.evaluate(()=>document.querySelector('.map__proj')?.innerText.replace(/\n/g,' | ')));
  await shot('proj-B');
  // selection preserved?
  await page.evaluate(()=>{ location.hash = location.hash + '&sel=barbados'; });
  await page.waitForTimeout(900);
  const before = await page.evaluate(()=>document.querySelector('.map__targets [aria-selected="true"]')?.getAttribute('data-unit'));
  await page.keyboard.press('p'); await page.waitForTimeout(2200);
  const after = await page.evaluate(()=>document.querySelector('.map__targets [aria-selected="true"]')?.getAttribute('data-unit'));
  log('sel before/after proj:', before, after);
};
