/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('a-1366-landing');
  const m = await page.evaluate(() => {
    const r = e => e ? (b=>({y:Math.round(b.y),h:Math.round(b.height),bot:Math.round(b.bottom)}))(e.getBoundingClientRect()) : null;
    const leg=document.querySelector('.legend'), by=document.querySelector('.byline'), st=document.querySelector('.app__stage');
    const bw=document.querySelector('#legend-body');
    return { legend:r(leg), byline:r(by), stage:r(st), body:r(bw), legText: leg&&leg.innerText };
  });
  log(JSON.stringify(m, null, 1));
  // open full key
  const b = page.locator('button', { hasText: 'Open the full key' });
  log('fullkey buttons:', await b.count());
  if (await b.count()) { await b.first().click(); await page.waitForTimeout(1200); await shot('b-1366-key'); }
  const kt = await page.evaluate(() => {
    const h = [...document.querySelectorAll('div,section,aside')].find(e=>e.innerText&&e.innerText.includes('THREE THINGS WRONG')&&e.innerText.length<12000);
    return h ? { cls: h.className, scroll: h.scrollHeight, client: h.clientHeight, len: h.innerText.length } : null;
  });
  log('KEY PANEL', JSON.stringify(kt));
};
