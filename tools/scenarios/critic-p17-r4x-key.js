/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const btn = page.locator('button', { hasText: 'Open the full key' }).first();
  log('full key button count:', await page.locator('button', { hasText: 'Open the full key' }).count());
  await btn.click();
  await page.waitForTimeout(1200);
  await shot('key-open');
  const t = await page.evaluate(() => {
    const el = document.querySelector('.legend') || document.body;
    return el.innerText;
  });
  log('LEGEND TEXT AFTER OPEN:\n' + t.slice(0, 8000));
  const r = await page.evaluate(() => {
    const e = document.querySelector('.legend'); const b = e.getBoundingClientRect();
    const st = document.querySelector('.app__stage') || document.querySelector('.stage');
    const sb = st && st.getBoundingClientRect();
    return { legend: [b.x,b.y,b.width,b.height], stage: sb && [sb.x,sb.y,sb.width,sb.height],
      scrollH: e.scrollHeight, clientH: e.clientHeight };
  });
  log('RECTS', JSON.stringify(r));
};
