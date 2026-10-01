/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const ids = ["cape-colony","natal","transvaal-colony","union-of-south-africa","bechuanaland","benin-kingdom","commonwealth-of-australia","victoria","nauru","mesopotamia-iraq","transjordan","north-west-frontier-province","jammu-and-kashmir","tripura","bermuda"];
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const banned = /(acquired|pacified|natives?|unrest|tribal|tribes?|mixed legacy|arguably)/gi;
  for (const id of ids) {
    await page.evaluate(id => { location.hash = '#year=1913&sel='+id; }, id);
    await page.waitForTimeout(250);
    const r = await page.evaluate(()=>document.querySelector('.dossier').innerText);
    let out=[]; let m;
    const re = new RegExp(banned.source, 'gi');
    while ((m = re.exec(r))) { out.push('…'+r.slice(Math.max(0,m.index-90), m.index+90).replace(/\n/g,' ')+'…'); }
    log('### '+id+'\n'+out.slice(0,4).join('\n'));
  }
  // bermuda actors
  await page.evaluate(()=>{location.hash='#year=1913&sel=bermuda';}); await page.waitForTimeout(400);
  const b = await page.evaluate(()=>{ const t=document.querySelector('.dossier').innerText; const i=t.indexOf('WHO WAS HERE'); return t.slice(i,i+900); });
  log('### BERMUDA WHO WAS HERE\n'+b);
};
