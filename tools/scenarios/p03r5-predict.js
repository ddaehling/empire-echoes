/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(3200);
  const led = [];
  await page.evaluate(() => { window.__led = []; });
  await page.evaluate(() => {
    const reg = document.querySelector('.tl').__p03;
    reg.bus.on('ledger:append', (p) => window.__led.push(p));
    reg.bus.on('time:predict', (p) => window.__led.push({ predictOpened: p }));
  });
  await page.click('.tl-rate__ask');
  await page.waitForTimeout(500);
  log('predict card:', await page.evaluate(() => document.querySelector('.tl-pred').innerText.replace(/\n/g,' | ')));
  await shot('01-predict-q1');
  await page.fill('.tl-pred__year', '1935');
  await page.click('.tl-pred__go');
  await page.waitForTimeout(500);
  log('after q1:', await page.evaluate(() => document.querySelector('.tl-pred').innerText.replace(/\n/g,' | ')));
  await shot('02-predict-q2');
  await page.click('.tl-pred__choice[data-band="c"]');
  await page.waitForTimeout(500);
  log('after q2:', await page.evaluate(() => document.querySelector('.tl-pred').innerText.replace(/\n/g,' | ')));
  log('ghost:', await page.evaluate(() => { const g=document.querySelector('.tl-rate__ghost'); return {hidden:g.hidden, label:g.dataset.label, t:g.style.transform}; }));
  log('ledger:', await page.evaluate(() => JSON.stringify(window.__led)));
  await shot('03-predict-done');
  await page.click('.tl-pred__on');
  await page.waitForTimeout(600);
  log('after go:', await page.evaluate(() => ({ hash: location.hash, stop: document.querySelector('.tl__stopcard')?.innerText.replace(/\n/g,' | ') })));
  await shot('04-peak');
  log('errors:', JSON.stringify(errs));
};
