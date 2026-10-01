/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(400);
  const painted = [];
  await page.exposeFunction('__rec', o => painted.push(o));
  await page.evaluate(()=>{ window.BEA.bus.on('ask:paintUnits', p=>window.__rec({n:(p.unitIds||[]).length, reason:p.reason})); window.BEA.bus.on('legend:filter', p=>window.__rec({filter:p.status})); });
  // click Protectorate row
  const rows = page.locator('.legend__entry');
  log('rows: ' + await rows.count());
  await rows.nth(2).click();
  await page.waitForTimeout(1200);
  await shot('filter-protectorate');
  log('events: '+JSON.stringify(painted));
  log('aria-pressed: '+ await page.evaluate(()=>[...document.querySelectorAll('.legend__entry')].slice(0,4).map(b=>b.getAttribute('aria-pressed'))));
  const legendTxt = await page.evaluate(()=>document.querySelector('.legend__totals').innerText);
  log('totals after filter: '+legendTxt.slice(0,200));
  await rows.nth(2).click();
  await page.waitForTimeout(900);
  log('events2: '+JSON.stringify(painted));
  await shot('unfiltered');
  // fold
  await page.evaluate(()=>document.querySelector(".legend__toggle").click());
  await page.waitForTimeout(600);
  await shot('folded');
  log('folded text: '+ await page.evaluate(()=>document.querySelector('[data-mount="legend"]').innerText.slice(0,300)));
};
