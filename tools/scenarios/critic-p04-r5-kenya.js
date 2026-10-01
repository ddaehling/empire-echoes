/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>{if(!/frameSpan/.test(e.message))errs.push('PE '+e.message)});
  await page.goto('http://localhost:8777/app/#year=1954&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  await page.evaluate(()=>document.querySelectorAll('.dossier details').forEach(d=>d.open=true));
  await page.waitForTimeout(500);
  const t = await page.evaluate(()=>document.querySelector('.dossier').innerText);
  log('LEN', t.length);
  log(t.slice(0,4200));
  const i = t.indexOf('SILENCE')>=0?t.indexOf('SILENCE'):t.search(/destroyed|Hanslope|burn/i);
  log('--- silence ---\n'+(i<0?'(none)':t.slice(Math.max(0,i-400), i+1400)));
  log('ERRS', JSON.stringify(errs.slice(0,4)));
};
