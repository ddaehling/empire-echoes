/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(800);
  const btns = await page.evaluate(() => [...document.querySelectorAll('.time__slot button')].map(b=>b.textContent.trim().slice(0,40)+' | vis='+(b.offsetParent!==null)));
  log('buttons: '+JSON.stringify(btns,null,1));
  const more = await page.$('.time__slot button:has-text("more")');
  log('more?', !!more);
  if (more) {
    await more.scrollIntoViewIfNeeded().catch(()=>{});
    await more.click({force:true});
    await page.waitForTimeout(700);
    await shot('expanded');
    const t = await page.evaluate(()=>document.querySelector('.time__slot').innerText);
    log('len after expand: '+t.length);
    log(t.slice(0,300));
  }
  // definition keys
  for (const k of ['2','3','4','1']) {
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press(k);
    await page.waitForTimeout(800);
    const head = await page.evaluate(()=>document.querySelector('.time__slot').innerText.split('\n').slice(7,14).join(' | '));
    log('key '+k+' -> '+head);
  }
  await shot('def4');
};
