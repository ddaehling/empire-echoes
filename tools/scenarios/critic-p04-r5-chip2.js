/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>{if(!/frameSpan/.test(e.message))errs.push('PE '+e.message)});
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  // scroll to Plassey chip and click
  const b = await page.$('.dossier button:has-text("Plassey")');
  await b.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const st0 = await page.evaluate(()=>document.querySelector('.app__dossier').scrollTop);
  log('url before', page.url(), 'scrollTop', st0);
  await b.click(); await page.waitForTimeout(2000);
  log('url after', page.url());
  log('head after', await page.evaluate(()=>document.querySelector('.dossier').innerText.slice(0,300).replace(/\n/g,' | ')));
  await shot('after-plassey-chip');
  await page.goBack(); await page.waitForTimeout(1800);
  log('url back', page.url());
  log('head back', await page.evaluate(()=>document.querySelector('.dossier').innerText.slice(0,200).replace(/\n/g,' | ')));
  log('scrollTop back', await page.evaluate(()=>document.querySelector('.app__dossier').scrollTop));
  await shot('after-back');
  log('ERRS', JSON.stringify(errs.slice(0,5)));
};
