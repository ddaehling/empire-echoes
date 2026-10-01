/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.legend.openPlate('poster'));
  await page.waitForTimeout(700);
  // pick the first option of each question, type into the open field
  await page.evaluate(() => {
    for (const q of ['projection','colour','year']) {
      const b = document.querySelector(`[data-focus-key^="poster:${q}:"]`);
      if (b) b.click();
    }
  });
  await page.waitForTimeout(500);
  await page.fill('.lplate__text', 'It asks the reader to see one government where there were fifteen legal forms.');
  await page.evaluate(() => document.querySelector('.lplate__text').dispatchEvent(new Event('change', {bubbles:true})));
  await page.waitForTimeout(400);
  await page.click('.lplate__keep');
  await page.waitForTimeout(600);
  await shot('kept');
  const before = await page.evaluate(() => ({
    ls: Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.includes('legend'))),
    kept: document.querySelector('.lplate__kept') ? document.querySelector('.lplate__kept').innerText.replace(/\s+/g,' ').slice(0,400) : null,
    btn: document.querySelector('.lplate__keep').textContent,
  }));
  log('BEFORE RELOAD ' + JSON.stringify(before, null, 1));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.BEA.legend.openPlate('poster'));
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({
    poster: window.BEA.legend.poster,
    pressed: [...document.querySelectorAll('.lplate__opt[aria-pressed="true"]')].map(n=>n.textContent.slice(0,40)),
    text: (document.querySelector('.lplate__text')||{}).value,
    kept: document.querySelector('.lplate__kept') ? document.querySelector('.lplate__kept').innerText.replace(/\s+/g,' ').slice(0,300) : null,
  }));
  log('AFTER RELOAD ' + JSON.stringify(after, null, 1));
  await shot('after-reload');
  log('ERRORS ' + JSON.stringify(errs));
};
