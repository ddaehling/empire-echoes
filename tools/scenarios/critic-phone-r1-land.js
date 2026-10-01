/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await shot('cold');
  log('title:', await page.title());
  log('doc scrollHeight/vh:', await page.evaluate(() => document.documentElement.scrollHeight + ' / ' + innerHeight));
  log('body innerText (first 2500):\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 2500));
  // all interactive controls + boxes
  const ctrls = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('button,a[href],input,select,[role="button"],[tabindex]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      out.push({ t: (el.innerText || el.getAttribute('aria-label') || el.value || '').trim().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cls: el.className.toString().slice(0,40) });
    });
    return out;
  });
  log('controls (' + ctrls.length + '):\n' + ctrls.map(c => `  ${c.x},${c.y} ${c.w}x${c.h}  "${c.t}"  .${c.cls}`).join('\n'));
};
