/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.locator('.legend__toggle').first().click();
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => {
    const e = document.querySelector('.legend'); const w = document.querySelector('.legend__bodywrap');
    const cs = getComputedStyle(w);
    return { legH: Math.round(e.getBoundingClientRect().height), legOvf: getComputedStyle(e).overflowY, legSh: e.scrollHeight, legCh: e.clientHeight,
      bwH: Math.round(w.getBoundingClientRect().height), bwSh: w.scrollHeight, bwCh: w.clientHeight, bwOvf: cs.overflowY, bwFlex: cs.flex, bwMinH: cs.minHeight };
  });
  log('BEFORE: ' + JSON.stringify(before));
  // try scrolling inside
  await page.evaluate(() => { const w = document.querySelector('.legend__bodywrap'); w.scrollTop = 900; const e=document.querySelector('.legend'); e.scrollTop=900; });
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => { const w=document.querySelector('.legend__bodywrap'); const e=document.querySelector('.legend'); return { bwSt: w.scrollTop, legSt: e.scrollTop }; });
  log('AFTER programmatic scroll: ' + JSON.stringify(after));
  // wheel over the legend
  const box = await page.locator('.legend').first().boundingBox();
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(400);
  const after2 = await page.evaluate(() => { const w=document.querySelector('.legend__bodywrap'); return { bwSt: w.scrollTop }; });
  log('AFTER wheel: ' + JSON.stringify(after2));
  await shot('mob-after-scroll');
  // last visible row?
  const last = await page.evaluate(() => {
    const e = document.querySelector('.legend'); const b = e.getBoundingClientRect();
    const rows = [...document.querySelectorAll('.legend__row, .legend__family-head')];
    const vis = rows.filter(r => { const rb = r.getBoundingClientRect(); return rb.bottom <= b.bottom + 1 && rb.top >= b.top; });
    return { total: rows.length, visible: vis.length, lastVisible: vis.length ? vis[vis.length-1].innerText.slice(0,60) : null };
  });
  log('ROWS: ' + JSON.stringify(last));
};
