/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>{if(!/frameSpan/.test(e.message))errs.push('PE '+e.message)});
  await page.goto('http://localhost:8777/app/#year=1913&sel=jamaica&motion=reduced', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  log('motion attr', await page.evaluate(()=>document.documentElement.getAttribute('data-motion')));
  await shot('rm-jamaica-asis');
  const anim = await page.evaluate(()=>{
    const el=document.querySelector('.dossier');
    return [...el.querySelectorAll('*')].filter(n=>{const s=getComputedStyle(n); return (s.transitionDuration!=='0s'&&s.transitionDuration!=='')||s.animationName!=='none';}).slice(0,6).map(n=>n.className+'|'+getComputedStyle(n).transitionDuration+'|'+getComputedStyle(n).animationName);
  });
  log('animated in reduced:', JSON.stringify(anim));
  log('ERRS', JSON.stringify(errs));
};
