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
  for (const w of ['hk-hong-kong-island','hk-kowloon','hk-new-territories','singapore']) {
    const box = await page.evaluate((w) => {
      const o = [...document.querySelectorAll('.map__targets [role="option"]')].find(e=>e.getAttribute('data-unit')===w);
      if (!o) return null; const r = o.getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 };
    }, w);
    if (!box) { log(w,'no target'); continue; }
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(500);
    await page.mouse.click(box.x, box.y); await page.waitForTimeout(800);
    const t = await page.evaluate(()=>document.querySelector('.map__tip')?.innerText || '(no tip)');
    log('=== ' + w + ' ===\n' + t);
  }
  await shot('hk');
};
