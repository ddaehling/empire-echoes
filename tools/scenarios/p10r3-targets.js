/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-targets — WCAG 2.2 SC 2.5.8 over every control this module draws, in
 *  every card it can draw, at 390x844. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1943&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const ids = await page.evaluate(() => window.BEA.quiz.items().map((i) => i.id + '|' + i.kind));
  let bad = 0, n = 0;
  const scan = async (label) => {
    const rs = await page.evaluate(() => [...document.querySelectorAll('.qz button, .qz a[href], .qz input, .qz textarea, .qz [role=button]')]
      .map((e) => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), cls: String(e.className).slice(0, 34), txt: (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) }; })
      .filter((x) => x.w > 0 && x.h > 0));
    for (const r of rs) { n++; if (r.w < 24 || r.h < 24) { bad++; log('  FAIL ' + label + '  ' + r.w + 'x' + r.h + '  ' + r.cls + '  “' + r.txt + '”'); } }
  };
  for (const spec of ids) {
    const [id] = spec.split('|');
    await page.evaluate((i) => window.BEA.quiz.open(i), id);
    await page.waitForTimeout(220);
    await scan(spec);
    /* and after an answer, where the evidence row and the next row live */
    await page.evaluate(() => {
      const c = document.querySelector('.qz__commit');
      const inp = document.querySelector('.qz-opt input, .qz-conf__o input');
      if (inp) inp.click();
      const ta = document.querySelector('.qz-ta');
      if (ta) { ta.value = 'a sentence long enough to open the commit control'; ta.dispatchEvent(new Event('input', { bubbles: true })); }
      const r = document.querySelector('.qz-range');
      if (r) { r.dispatchEvent(new Event('input', { bubbles: true })); }
      if (c && c.getAttribute('aria-disabled') !== 'true') c.click();
    });
    await page.waitForTimeout(320);
    await scan(spec + ' (answered)');
  }
  await page.evaluate(() => window.BEA.quiz.schedule());
  await page.waitForTimeout(400);
  await scan('the done panel');
  log((bad ? 'FAIL ' : 'PASS ') + bad + ' of ' + n + ' controls under 24x24 across ' + ids.length + ' cards');
  await shot('done-panel');
};
