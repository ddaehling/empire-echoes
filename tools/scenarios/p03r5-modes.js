/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(3200);
  await shot('01-landing');
  log('rate visible:', await page.evaluate(() => { const n=document.querySelector('.tl-rate__plot'); const r=n.getBoundingClientRect(); return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height)}); }));
  log('spine lanes:', await page.evaluate(() => [...document.querySelectorAll('.tl-lane')].map(b=>b.dataset.phase+':'+b.dataset.on).join(' ')));
  log('track:', await page.evaluate(() => { const t=document.querySelector('.tl__track'); return JSON.stringify({cw:t.clientWidth, sw:t.scrollWidth, cards:t.querySelectorAll('.tl-chg:not([hidden])').length, more:document.querySelector('.tl-chg--more').innerText.replace(/\n/g,' ')}); }));
  // open a card -> is the row still there? is the spine still there?
  await page.click('.tl__track .tl-chg:not([hidden])');
  await page.waitForTimeout(600);
  log('with drawer open:', await page.evaluate(() => { const t=document.querySelector('.tl__track'); const s=document.querySelector('.tl-spine'); const h=document.querySelector('.tl__changehead');
    return JSON.stringify({ trackW:t.clientWidth, headVisible: h.getBoundingClientRect().height>0, headText:h.innerText.replace(/\n/g,' ').slice(0,90), spineH: Math.round(s.getBoundingClientRect().height), mapH: Math.round(document.querySelector('#stage').getBoundingClientRect().height) }); }));
  await shot('02-drawer-open');
  log('errors:', JSON.stringify(errs));
};
