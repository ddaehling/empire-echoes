/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1600);
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=3&filter=stage:working,pressure:off');
  await page.waitForTimeout(1800);
  await shot('beat3');
  // tab order: how many tabs to reach Next?
  const order = [];
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => {
      const e = document.activeElement; if (!e) return 'none';
      const r = e.getBoundingClientRect();
      return `${e.tagName}.${e.className.toString().split(/\s+/)[0]} "${(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,32)}" @${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`;
    });
    order.push(i + ': ' + a);
  }
  log('TAB ORDER:\n  ' + order.join('\n  '));
  await shot('focus');
};
