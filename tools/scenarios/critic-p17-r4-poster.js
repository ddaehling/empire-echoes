/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.getByText(/Open the full key/i).first().click();
  await page.waitForTimeout(1000);
  // scroll to poster exercise
  const el = page.getByText(/NOW DO IT ON A MAP WE DID NOT DRAW/i).first();
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await shot('poster-top');
  log('imgs in plate: ' + await page.evaluate(()=>Array.from(document.querySelectorAll('.lplate img, .lplate svg')).map(e=>e.tagName+':'+(e.getAttribute('src')||'').slice(0,80)).join(' | ')));
  // answer q1 wrongly then see feedback
  const opts = await page.evaluate(()=>Array.from(document.querySelectorAll('.lplate button, .lplate [role="radio"], .lplate [role="button"]')).map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').slice(0,70), cls:String(b.className).slice(0,40)})));
  log('BUTTONS ' + JSON.stringify(opts, null, 0).slice(0,3000));
  const wrong = page.getByText(/There is no way to tell from looking/i).first();
  if (await wrong.count()) { await wrong.click(); await page.waitForTimeout(800); await shot('poster-answered-wrong'); }
  const t = await page.evaluate(()=>{ const p=document.querySelector('.lplate'); return p? p.innerText.slice(-4500):''; });
  log('AFTER>>>\n'+t);
};
