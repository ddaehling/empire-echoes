/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const ready = () => page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(()=>{});
  await ready(); await page.waitForTimeout(1200);
  log('start hash:', page.url(), 'len', await page.evaluate(()=>history.length));
  await page.evaluate(() => window.BEA.store.act.setYear(1858));
  await page.waitForTimeout(700);
  log('after setYear 1858:', page.url(), 'len', await page.evaluate(()=>history.length));
  await page.keyboard.press('4'); await page.waitForTimeout(700);
  log('after def4:', page.url(), 'len', await page.evaluate(()=>history.length));
  await page.evaluate(() => window.BEA.store.act.select('india'));
  await page.waitForTimeout(900);
  log('after select:', page.url(), 'len', await page.evaluate(()=>history.length));
  await page.goBack({ waitUntil: 'commit' }).catch(e=>log('goBack err', e.message));
  await page.waitForTimeout(2500);
  log('after back:', page.url(), 'boot=', await page.evaluate(()=>document.documentElement.dataset.boot).catch(()=>'?'));
  log('bg:', await page.evaluate(()=>getComputedStyle(document.body).backgroundColor).catch(()=>'?'));
  log('body text:', await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,300)).catch(()=>'?'));
  await shot('back-1');
  await page.waitForTimeout(3000);
  await shot('back-2');
  log('after back +3s:', page.url(), 'boot=', await page.evaluate(()=>document.documentElement.dataset.boot).catch(()=>'?'));
  log('state:', await page.evaluate(()=>JSON.stringify(window.BEA?.store?.getState?.()??{},(k,v)=>v instanceof Set?[...v]:v).slice(0,300)).catch(()=>'?'));
};
