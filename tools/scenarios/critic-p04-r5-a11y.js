/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>{if(!/frameSpan/.test(e.message))errs.push('PE '+e.message)});
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const a = await page.evaluate(()=>{
    const el=document.querySelector('.dossier');
    const focusables=[...el.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"]),summary,input,select')];
    const noName=focusables.filter(n=>!(n.innerText||'').trim() && !n.getAttribute('aria-label') && !n.getAttribute('title'));
    const host=document.querySelector('.app__dossier');
    return { role: el.getAttribute('role'), aria: el.getAttribute('aria-label'), live: el.getAttribute('aria-live'),
      hostRole: host.getAttribute('role'), hostTabindex: host.getAttribute('tabindex'),
      focusables: focusables.length, unnamed: noName.length,
      unnamedSample: noName.slice(0,5).map(n=>n.outerHTML.slice(0,90)),
      headings: [...el.querySelectorAll('h1,h2,h3,h4,h5')].map(n=>n.tagName+': '+n.textContent.trim().slice(0,40)).slice(0,25) };
  });
  log(JSON.stringify(a,null,1));
  // keyboard: tab from the top into the dossier
  await page.evaluate(()=>document.querySelector('.dossier').scrollIntoView());
  let seq=[];
  await page.evaluate(()=>{const b=document.querySelector('.dossier button'); b && b.focus();});
  for (let i=0;i<14;i++){ await page.keyboard.press('Tab'); await page.waitForTimeout(90);
    seq.push(await page.evaluate(()=>{const e=document.activeElement; return (e.tagName||'')+'|'+(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,42).replace(/\n/g,' ');})); }
  log('TAB SEQ:\n'+seq.join('\n'));
  await shot('focus-ring');
  log('ERRS', JSON.stringify(errs.slice(0,5)));
};
