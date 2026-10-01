/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const ids = require('/tmp/tids.json');
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>{if(!/frameSpan/.test(e.message))errs.push('PE '+e.message)});
  page.on('console',m=>{if(m.type()==='error'&&!/frameSpan/.test(m.text()))errs.push('CE '+m.text())});
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  // rapid year scrub with dossier open
  for (let y=1880; y<=1980; y+=4) { await page.evaluate(yy=>{location.hash='#year='+yy+'&sel=kenya';}, y); await page.waitForTimeout(45); }
  await page.waitForTimeout(800);
  log('after scrub text len', await page.evaluate(()=>document.querySelector('.dossier').innerText.length));
  await shot('after-scrub');
  // rapid selection thrash
  for (let i=0;i<40;i++){ await page.evaluate(id=>{location.hash='#year=1913&sel='+id;}, ids[i*6%ids.length]); await page.waitForTimeout(40); }
  await page.waitForTimeout(900);
  log('after thrash len', await page.evaluate(()=>document.querySelector('.dossier').innerText.length));
  await shot('after-thrash');
  // sections jump
  const j = await page.$('.dossier button:has-text("sections")');
  if (j) { await j.click(); await page.waitForTimeout(600); await shot('sections-open');
    log('sections panel:', await page.evaluate(()=>document.querySelector('.dossier').innerText.slice(0,400).replace(/\n+/g,' | '))); }
  log('ERRS', errs.length, JSON.stringify(errs.slice(0,6)));
};
