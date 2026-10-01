/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=end&filter=stage:working,pressure:off');
  await page.waitForTimeout(2500);
  const b = page.locator('.cx-sheet__body').first();
  log('close scroll: ' + await b.evaluate(e => e.clientHeight + '/' + e.scrollHeight));
  // is there any expand affordance?
  const aff = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('button,[role=button]').forEach(e=>{
      const t=(e.innerText||e.getAttribute('aria-label')||'').trim();
      if (/expand|full|bigger|read|print|sign|page|close/i.test(t)) { const r=e.getBoundingClientRect(); out.push(`${t.slice(0,50)} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} vis=${r.height>0}`);}
    });
    return out.join('\n');
  });
  log('affordances:\n' + aff);
  // walk the close
  for (let i=0;i<8;i++){
    await b.evaluate((e,i)=>e.scrollTop = i*e.clientHeight*0.92, i);
    await page.waitForTimeout(350);
    await shot('close'+i);
  }
  const txt = await b.evaluate(e=>e.innerText);
  log('CLOSE TEXT length ' + txt.length + '\n' + txt.slice(0, 6000));
};
