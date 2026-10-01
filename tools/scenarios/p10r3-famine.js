/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-famine — the new T16 item, driven: commit a wrong number, read the
 *  correction, its range, its reason and its citation. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1943&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  log('opened: ' + await page.evaluate(() => window.BEA.quiz.open('t16-bengal-1943')));
  await page.waitForTimeout(700);
  log('question: ' + (await page.textContent('.cx-ask__q').catch(() => null)));
  await shot('famine-asked');
  log(await page.evaluate(() => {
    const r = document.querySelector('.qz-range');
    if (!r) return 'no range control';
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(r, '0.4');
    r.dispatchEvent(new Event('input', { bubbles: true }));
    const conf = document.querySelector('.qz-conf__o input');
    if (conf) { conf.click(); }
    const c = document.querySelector('.qz__commit');
    if (c) c.click();
    return 'committed 0.4 million';
  }));
  await page.waitForTimeout(1200);
  const ans = await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    return { said: g('.qz__said'), truth: g('.qz__truth'), model: g('.qz__modelhead'), why: g('.qz__why'), src: g('.qz__method') };
  });
  for (const k of Object.keys(ans)) log(k.toUpperCase() + ': ' + ans[k]);
  await shot('famine-answered');
};
