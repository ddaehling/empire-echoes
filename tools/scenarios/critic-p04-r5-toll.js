/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of null (reading 'scrollIntoViewIfNeeded').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const html = await page.evaluate(()=>{
    const b=document.querySelector('button[data-key*=":toll:"]');
    if(!b) return '(none)';
    let n=b; for(let i=0;i<5&&n.parentElement;i++) n=n.parentElement;
    return {outer: b.outerHTML.slice(0,400), block: n.innerText.slice(0,1800)};
  });
  log(JSON.stringify(html,null,1));
  // click one
  const b = await page.$('button[data-key*=":toll:"]');
  await b.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  await shot('toll-before');
  await b.click(); await page.waitForTimeout(1000);
  await shot('toll-after');
  const after = await page.evaluate(()=>{
    const t=document.querySelector('.dossier').innerText; const i=t.indexOf('THE DEATH TOLL')>=0?t.indexOf('THE DEATH TOLL'):t.search(/toll/i);
    return t.slice(Math.max(0,i-600), i+1600);
  });
  log('--- after toll click ---\n'+after);
};
