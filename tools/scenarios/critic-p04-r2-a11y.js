/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const meta = await page.evaluate(() => {
    const a = document.querySelector('.app__dossier');
    const d = document.querySelector('.dossier');
    return {
      asideAttrs: a ? [...a.attributes].map(x=>x.name+'='+x.value).join(' ') : null,
      dossierAttrs: d ? [...d.attributes].map(x=>x.name+'='+x.value).join(' ').slice(0,300) : null,
      live: [...document.querySelectorAll('[aria-live]')].map(n=>n.getAttribute('aria-live')+' :: '+(n.className||'')+' :: '+n.innerText.slice(0,120)),
      headings: [...document.querySelectorAll('.dossier h1,.dossier h2,.dossier h3,.dossier h4')].map(n=>n.tagName+' '+n.innerText.slice(0,40)).slice(0,20),
      focusables: [...document.querySelectorAll('.dossier a,.dossier button,.dossier [tabindex]')].length,
    };
  });
  log(JSON.stringify(meta, null, 1));
  // tab far to reach dossier
  const seq=[];
  for (let i=0;i<70;i++){ await page.keyboard.press('Tab'); const s=await page.evaluate(()=>{const a=document.activeElement;return (a.closest && a.closest('.dossier')?'[DOSSIER] ':'')+a.tagName+':'+(a.className||'').slice(0,24)+':'+((a.innerText||a.getAttribute('aria-label')||'').replace(/\n/g,' ').slice(0,36));}); seq.push(i+' '+s); if(s.startsWith('[DOSSIER]')) { seq.push('>>> reached dossier at tab '+i); break; } }
  log(seq.slice(-14).join('\n'));
  await shot('a11y-focus');
};
