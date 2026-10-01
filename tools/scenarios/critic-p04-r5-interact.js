/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PE '+e.message)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});

  // 1. the PREDICT commit
  const btn = await page.$('text=I think that is false');
  log('predict button found:', !!btn);
  if (btn) {
    await btn.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    await shot('a-before-commit');
    await btn.click(); await page.waitForTimeout(900);
    await shot('b-after-commit');
    const t = await page.evaluate(()=>{
      const n=[...document.querySelectorAll('.dossier *')].find(e=>/Britain partitioned Bengal/.test(e.textContent)&&e.children.length<12);
      return n? n.parentElement.innerText.slice(0,1400):'(not found)';
    });
    log('--- after commit ---\n'+t);
  }
  log('ERRS', JSON.stringify(errs.slice(0,8)));
};
