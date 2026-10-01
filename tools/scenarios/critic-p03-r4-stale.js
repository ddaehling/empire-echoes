/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1607, 1842, 1765]) {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(700);
    const rep = await page.evaluate(() => [...document.querySelectorAll('.tl-chg')].map((n,i) => {
      const r = n.getBoundingClientRect();
      const cs = getComputedStyle(n);
      return { i, vis: (r.width>0 && r.height>0 && cs.visibility!=='hidden' && cs.display!=='none' && cs.opacity!=='0'), rect: [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], hidden: n.hasAttribute('hidden'), parent: n.parentElement.className, txt: n.innerText.replace(/\n/g,' ').slice(0,70) };
    }));
    log('YEAR ' + y + '\n' + rep.map(r => `  vis=${r.vis} hid=${r.hidden} rect=${r.rect} par=${r.parent} :: ${r.txt}`).join('\n'));
    await shot('year' + y);
  }
  // click the "open the other" at 1842
  await page.evaluate(() => { location.hash = '#year=1842'; });
  await page.waitForTimeout(700);
  const more = await page.$('.tl-chg--more');
  if (more) { const vis = await more.isVisible(); log('more btn visible at 1842:', vis, await more.innerText()); if (vis) { await more.click(); await page.waitForTimeout(600); await shot('1842-more-open'); log('after open:', await page.evaluate(()=>[...document.querySelectorAll('.tl-chg')].filter(n=>n.offsetParent).length + ' visible cards')); } }
};
