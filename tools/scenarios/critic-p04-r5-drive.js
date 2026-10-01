/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  // What are the empty-text buttons?
  const empt = await page.evaluate(() => {
    const d = document.getElementById('dossier');
    return [...d.querySelectorAll('button')].map((e,i) => ({ i, cls: e.className, txt: (e.innerText||'').trim().slice(0,40), html: e.outerHTML.slice(0,200), visible: !!(e.offsetWidth||e.offsetHeight), rect: e.getBoundingClientRect().toJSON() })).filter(x => !x.txt);
  });
  log('EMPTY-TEXT BUTTONS:'); empt.forEach(e => log('  ' + JSON.stringify(e)));
  // click the first because chip
  const chip = page.locator('#dossier .dsr-chip').first();
  log('chip text:', (await chip.innerText()).replace(/\n/g,' '));
  await chip.click();
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => ({ hash: location.hash, title: document.querySelector('#dossier h2,#dossier h1,#dossier h3')?.innerText, top: document.getElementById('dossier').innerText.slice(0,500).replace(/\n+/g,' | ') }));
  log('AFTER CHIP:', JSON.stringify(after));
  await shot('after-chip');
  await page.goBack(); await page.waitForTimeout(1200);
  const back = await page.evaluate(() => ({ hash: location.hash, title: document.querySelector('#dossier h2,#dossier h1,#dossier h3')?.innerText, scrolled: (()=>{const s=[...document.querySelectorAll('#dossier *')].find(e=>e.scrollHeight>e.clientHeight+4); return s?s.scrollTop:null;})() }));
  log('AFTER BACK:', JSON.stringify(back));
  await shot('after-back');
};
