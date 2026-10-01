/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of null (reading 'scrollIntoViewIfNeeded').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const before = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.app__dossier h2, .app__dossier h1')?.innerText, scroll: document.querySelector('.app__dossier').scrollTop}));
  log('BEFORE', JSON.stringify(before));
  // find a because chip
  const chips = await page.evaluate(() => [...document.querySelectorAll('.app__dossier a, .app__dossier button')].map((n,i)=>({i, t:n.innerText.replace(/\s+/g,' ').slice(0,80), cls:n.className.slice(0,60)})).filter(c=>/because|→/i.test(c.t)));
  log('CHIPS', JSON.stringify(chips.slice(0,12)));
  const el = await page.evaluateHandle(() => [...document.querySelectorAll('.app__dossier a, .app__dossier button')].find(n=>/because/i.test(n.innerText)));
  await el.asElement().scrollIntoViewIfNeeded();
  await shot('chip-before');
  await el.asElement().click();
  await page.waitForTimeout(1600);
  const after = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.app__dossier h2, .app__dossier h1')?.innerText, scroll: document.querySelector('.app__dossier').scrollTop, top: document.querySelector('.app__dossier').innerText.slice(0,700)}));
  log('AFTER', JSON.stringify(after));
  await shot('chip-after');
  await page.goBack();
  await page.waitForTimeout(1600);
  const back = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.app__dossier h2, .app__dossier h1')?.innerText, scroll: document.querySelector('.app__dossier').scrollTop}));
  log('BACK', JSON.stringify(back));
  await shot('chip-back');
};
