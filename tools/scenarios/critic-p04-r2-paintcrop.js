/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => { const b=document.querySelector('[data-block="nested"]'); if(b) b.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(400);
  const clip = { x: 640, y: 300, width: 400, height: 380 };
  await page.screenshot({ path: '/tmp/cp04r2p/a-before.png', clip });
  await page.click('[data-act="paint-direct"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/cp04r2p/b-direct.png', clip });
  await page.click('[data-act="paint-children"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/cp04r2p/c-children.png', clip });
  log('done');
  log('legend note: ' + await page.evaluate(()=>{const n=[...document.querySelectorAll('*')].find(x=>x.children.length===0 && /Showing a set/.test(x.textContent)); return n?n.parentElement.innerText.slice(0,400):'none';}));
};
