/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.keyboard.press('w'); await page.waitForTimeout(1600);
  const r = await page.evaluate(()=>({
    byline: document.querySelector('.byline')?.innerText,
    legend: document.querySelector('.legend')?.innerText,
    note: document.querySelector('.stage__note')?.innerText
  }));
  log('BYLINE>>>\n'+r.byline);
  log('LEGEND>>>\n'+r.legend);
  log('NOTE>>>\n'+r.note);
  await shot('weight-full');
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Three things wrong/i.test(x.innerText)); b&&b.click(); });
  await page.waitForTimeout(1200);
  const t = await page.evaluate(()=>document.querySelector('.lplate')?.innerText||'');
  const i = t.indexOf('THREE THINGS WRONG');
  log('CRIT>>>\n' + t.slice(i, i+1600));
};
