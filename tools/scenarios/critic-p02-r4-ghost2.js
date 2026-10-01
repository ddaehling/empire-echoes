/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const t = await page.evaluate(()=>['hawaii','us-florida','reunion','id-maluku','tk-tokelau','union-islands'].map(id=>{const e=document.querySelector(`.map__target[data-unit="${id}"]`); if(!e) return {id,missing:true}; const r=e.getBoundingClientRect(); return {id,cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};}));
  log('T:', JSON.stringify(t));
  for (const u of t) { if (u.missing) continue;
    await page.mouse.move(u.cx,u.cy); await page.waitForTimeout(450);
    const tip = await page.evaluate(()=>{const e=[...document.querySelectorAll('div,aside')].find(x=>/map__tip|tip--/.test(x.className)); return e?e.innerText.replace(/\n+/g,' | ').slice(0,260):null;});
    log('hover', u.id, '=>', tip);
  }
  // legend full key
  const btn = await page.$('text=Open the full key');
  if (btn) { await btn.click(); await page.waitForTimeout(1200); await shot('fullkey');
    log('KEYTEXT:', (await page.evaluate(()=>document.body.innerText)).slice(0,4000)); }
};
