/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(400);
  const snap = () => page.evaluate(()=>{
    const svg=document.querySelector('.map svg')||document.querySelector('.map');
    const nodes=[...svg.querySelectorAll('[data-unit]')];
    const dim = nodes.filter(n=>{const cs=getComputedStyle(n); return parseFloat(cs.opacity)<0.9 || n.classList.contains('is-dim')||n.getAttribute('data-dim')==='true';}).length;
    return {n:nodes.length, dim, sampleAttrs: nodes.slice(0,3).map(n=>n.getAttribute('class')+'|'+n.getAttribute('data-unit'))};
  });
  log('before: '+JSON.stringify(await snap()));
  await page.locator('.legend__entry').nth(2).click();
  await page.waitForTimeout(1500);
  log('after protectorate filter: '+JSON.stringify(await snap()));
  await shot('after');
};
