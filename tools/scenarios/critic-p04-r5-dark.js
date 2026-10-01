/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india&theme=lamplit', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  await shot('dark-india');
  // contrast probe on dossier text
  const c = await page.evaluate(()=>{
    const el=document.querySelector('.dossier');
    const bg = getComputedStyle(el).backgroundColor;
    const samples=[...el.querySelectorAll('p,div,span')].slice(0,25).map(n=>getComputedStyle(n).color);
    return {bg, samples:[...new Set(samples)].slice(0,8), theme: document.documentElement.getAttribute('data-theme')};
  });
  log(JSON.stringify(c));
  // princely states toggle T11
  const p = await page.evaluate(()=>{
    const t=document.querySelector('.dossier').innerText;
    const i=t.toLowerCase().indexOf('princely');
    return i<0?'(no princely mention)':t.slice(Math.max(0,i-300), i+700);
  });
  log('--- princely ---\n'+p);
};
