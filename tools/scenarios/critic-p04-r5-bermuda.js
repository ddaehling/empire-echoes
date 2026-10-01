/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=bermuda', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const r = await page.evaluate(() => {
    const d = document.getElementById('dossier');
    const t = d.innerText;
    const i = t.indexOf('[missing local actors]');
    const el = [...d.querySelectorAll('*')].find(e => e.children.length===0 && e.textContent.includes('[missing local actors]'));
    if (el) el.scrollIntoView({block:'center'});
    return { idx: i, around: i<0?null:t.slice(Math.max(0,i-700), i+400), color: el?getComputedStyle(el).color:null, cls: el?el.className:null };
  });
  log(JSON.stringify(r, null, 1));
  await page.waitForTimeout(400);
  await shot('bermuda-missing', '#dossier');
};
