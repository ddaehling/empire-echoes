/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const idx of [0,1,2,3,4,5,6]) {
    await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    await page.addStyleTag({content:'.map__furniture{display:none !important}'});
    const ok = await page.evaluate((i)=>{
      const g=[...document.querySelectorAll('.dossier button')].find(b=>/go to it/.test(b.textContent));
      if(g) g.click(); return true;
    }, idx);
    await page.waitForTimeout(700);
    const r = await page.evaluate((i)=>{
      const bs=[...document.querySelectorAll('button[data-key*=":toll:"]')];
      if(!bs[i]) return '(no button '+i+')';
      const label = bs[i].innerText.trim();
      bs[i].click();
      return label;
    }, idx);
    await page.waitForTimeout(700);
    const msg = await page.evaluate(()=>{
      const t=document.querySelector('.dossier').innerText; const i=t.indexOf('YOU SAID');
      return i<0?'(no msg)':t.slice(i, i+260).replace(/\n+/g,' | ');
    });
    log('choice['+idx+'] "'+r+'" -> '+msg);
  }
};
