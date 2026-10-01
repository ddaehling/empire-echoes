/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'parentElement').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const g = await page.$('.dossier button:has-text("go to it")');
  log('goto found', !!g);
  await g.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  await g.click(); await page.waitForTimeout(1400);
  await shot('after-goto');
  const vis = await page.evaluate(()=>{
    const b=document.querySelector('button[data-key*=":toll:"]');
    const r=b.getBoundingClientRect();
    return {visible: r.width>0&&r.height>0, y:r.y|0, block: (()=>{let n=b;for(let i=0;i<6&&n.parentElement;i++)n=n.parentElement;return n.innerText.slice(0,1400)})()};
  });
  log(JSON.stringify(vis,null,1));
  if (vis.visible) {
    const b = await page.$('button[data-key*=":toll:"]');
    await b.click(); await page.waitForTimeout(1000);
    await shot('toll-committed');
    log('--- after commit ---\n'+ await page.evaluate(()=>{const b=document.querySelector('button[data-key*=":toll:"]');let n=b;for(let i=0;i<6&&n.parentElement;i++)n=n.parentElement;return n.innerText.slice(0,2000);}));
  }
};
