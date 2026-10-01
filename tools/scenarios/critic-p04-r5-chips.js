/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PE '+e.message));
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const before = page.url();
  const chip = await page.$('.dossier a:has-text("British India, 1757"), .dossier button:has-text("British India, 1757")');
  log('chip found', !!chip);
  const chips = await page.evaluate(()=>[...document.querySelectorAll('.dossier a,.dossier button')].filter(n=>/→/.test(n.textContent)).slice(0,8).map(n=>({t:n.textContent.trim().slice(0,50), tag:n.tagName, href:n.getAttribute('href')})));
  log('chips', JSON.stringify(chips,null,1));
  // click the first because-chip
  const target = await page.$('.dossier [class*=chip] a, .dossier a[href*="sel="]');
  if (target) {
    log('clicking', await target.evaluate(n=>n.textContent.trim().slice(0,60)+' | '+n.getAttribute('href')));
    await target.click(); await page.waitForTimeout(1800);
    log('url after', page.url());
    log('heading after', await page.evaluate(()=>document.querySelector('.dossier').innerText.slice(0,180).replace(/\n/g,' | ')));
    await shot('after-chip');
    await page.goBack(); await page.waitForTimeout(1500);
    log('url after back', page.url());
    log('heading after back', await page.evaluate(()=>document.querySelector('.dossier').innerText.slice(0,180).replace(/\n/g,' | ')));
    log('scrollTop after back', await page.evaluate(()=>document.querySelector('.app__dossier').scrollTop));
  } else log('NO CHIP LINK FOUND');
  log('ERRS', JSON.stringify(errs.slice(0,5)));
};
