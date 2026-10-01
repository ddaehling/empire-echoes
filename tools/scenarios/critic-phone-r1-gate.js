/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1800);
  await page.goto(page.url().split('#')[0] + '#year=1816&tour=thirty&step=5&filter=stage:working,pressure:off');
  await page.waitForTimeout(2000);
  const sheet = page.locator('.cx-sheet__body');
  await sheet.evaluate(e => e.scrollTop = e.scrollHeight);
  await page.waitForTimeout(500);
  await shot('gate-bottom');
  const html = await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    const out = [];
    b.querySelectorAll('button, input, [role=radio], label').forEach(e => {
      const r = e.getBoundingClientRect();
      out.push(`${e.tagName}.${e.className.toString().slice(0,40)} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(e.innerText||e.value||'').trim().slice(0,40)}"`);
    });
    return out.join('\n');
  });
  log('gate controls:\n' + html);
};
