/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const crit = () => {
  const n = [...document.querySelectorAll('*')].find(e => /THREE THINGS WRONG WITH THIS RENDERING/.test(e.textContent) && e.children.length < 12 && e.className && /crit|lkey|lplate/.test(String(e.className)));
  const host = document.querySelector('.lplate, .stage__legend');
  const all = document.body.innerText;
  const i = all.indexOf('THREE THINGS WRONG WITH THIS RENDERING');
  return i < 0 ? null : all.slice(i, i + 1400).replace(/\s+/g,' ');
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const open = await page.$('text=Open the full key'); if (open) { await open.click(); await page.waitForTimeout(1200); }
  const states = [
    ['1900 mercator claimed', async()=>{}],
    ['equal earth', async()=>{ await page.keyboard.press('p'); }],
    ['controlled', async()=>{ await page.keyboard.press('3'); }],
    ['influenced', async()=>{ await page.keyboard.press('4'); }],
    ['weight', async()=>{ await page.keyboard.press('w'); }],
    ['stitching', async()=>{ await page.keyboard.press('s'); }],
    ['year 1783', async()=>{ await page.goto('http://localhost:8777/app/#year=1783'); await page.waitForTimeout(2500); const o=await page.$('text=Open the full key'); if(o) await o.click(); }],
    ['year 1947', async()=>{ await page.goto('http://localhost:8777/app/#year=1947'); await page.waitForTimeout(2500); const o=await page.$('text=Open the full key'); if(o) await o.click(); }],
    ['year 1650', async()=>{ await page.goto('http://localhost:8777/app/#year=1650'); await page.waitForTimeout(2500); const o=await page.$('text=Open the full key'); if(o) await o.click(); }],
  ];
  for (const [name, fn] of states) { await fn(); await page.waitForTimeout(1300);
    log('### ' + name + '\n' + (await page.evaluate(crit) || 'NOT FOUND')); }
  await shot('crit-end');
};
